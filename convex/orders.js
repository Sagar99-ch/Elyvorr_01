import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";

/**
 * ==================================================
 * CONSTANTS
 * ==================================================
 */

const STOCK_RESERVATION_MINUTES = 30;
const STOCK_RESERVATION_MS = STOCK_RESERVATION_MINUTES * 60 * 1000;

/**
 * ==================================================
 * GENERATE ORDER NUMBER
 * ==================================================
 */

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `ELY-${timestamp}-${random}`;
}

/**
 * ==================================================
 * CUSTOMER-SAFE ORDER RESPONSE
 * ==================================================
 */

function customerSafeOrder(order) {
  return {
    _id: order._id,
    orderNumber: order.orderNumber,

    paymentStatus: order.paymentStatus,
    paymentId: order.paymentId,

    orderStatus: order.orderStatus,

    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    gst: order.gst,
    total: order.total,

    items: order.items,

    awbCode: order.awbCode,
    courierName: order.courierName,
    shippingStatus: order.shippingStatus,
    trackingUrl: order.trackingUrl,

    delhiveryWaybill: order.delhiveryWaybill,
    delhiveryPickupId: order.delhiveryPickupId,
    delhiveryStatus: order.delhiveryStatus,
    delhiveryStatusCode: order.delhiveryStatusCode,
    delhiveryManifestedAt: order.delhiveryManifestedAt,

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
  };
}

/**
 * ==================================================
 * CREATE PENDING ORDER
 * ==================================================
 *
 * IMPORTANT:
 *
 * 1. Server calculates prices.
 * 2. Server checks stock.
 * 3. Server reserves/decrements stock.
 * 4. Reservation expires after 30 minutes.
 * 5. Discount is DISPLAY SAVING only.
 * 6. Discount is NOT subtracted from selling price.
 *
 * Example:
 *
 * MRP       ₹399
 * Sale      ₹1
 * Saving    ₹398
 * Shipping  ₹1
 *
 * Customer pays ₹2.
 *
 * ==================================================
 */

export const createPendingOrder = mutation({
  args: {
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    if (!args.sessionId.trim()) {
      throw new Error("Invalid checkout session.");
    }

    /**
     * ================================================
     * GET ADDRESS
     * ================================================
     */

    const address = await ctx.db
      .query("addresses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!address) {
      throw new Error("Delivery address is required before placing the order.");
    }

    /**
     * ================================================
     * GET CART
     * ================================================
     */

    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Your shopping bag is empty.");
    }

    /**
     * ================================================
     * CHECK FOR EXISTING ACTIVE RESERVATIONS
     * ================================================
     *
     * Prevents accidental duplicate stock reservation
     * when customer refreshes/clicks payment repeatedly.
     *
     * Expired reservations are released first.
     * ================================================
     */

    const existingOrders = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const now = Date.now();

    for (const existingOrder of existingOrders) {
      if (
        existingOrder.paymentStatus === "pending" &&
        existingOrder.stockReserved === true
      ) {
        const expiry = Number(existingOrder.stockReservationExpiresAt || 0);

        /**
         * Existing reservation is still active.
         */
        if (expiry > now) {
          throw new Error(
            "You already have an active payment order. Please complete payment or wait for the current reservation to expire."
          );
        }

        /**
         * Existing reservation expired.
         * Release stock.
         */

        for (const item of existingOrder.items || []) {
          const product = await ctx.db.get(item.productId);

          if (product) {
            const currentStock = Number(product.stock || 0);
            const quantity = Number(item.quantity || 0);

            await ctx.db.patch(product._id, {
              stock: currentStock + quantity,
            });
          }
        }

        await ctx.db.patch(existingOrder._id, {
          stockReserved: false,
          stockReleasedAt: now,
          paymentStatus: "cancelled",
          orderStatus: "cancelled",
          updatedAt: now,
        });
      }
    }

    /**
     * ================================================
     * BUILD ORDER ITEMS
     * ================================================
     */

    const orderItems = [];

    let subtotal = 0;
    let discount = 0;

    let removedInvalidItem = false;

    /**
     * ================================================
     * VALIDATE ALL PRODUCTS FIRST
     * ================================================
     *
     * IMPORTANT:
     *
     * We do NOT decrement stock during this loop.
     *
     * First validate everything.
     * Then reserve everything.
     *
     * Convex mutation is transactional.
     * ================================================
     */

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);

      /**
       * PRODUCT DOES NOT EXIST
       */

      if (!product) {
        await ctx.db.delete(cartItem._id);

        removedInvalidItem = true;
        continue;
      }

      /**
       * PRODUCT INACTIVE
       */

      if (!product.isActive) {
        await ctx.db.delete(cartItem._id);

        removedInvalidItem = true;
        continue;
      }

      /**
       * QUANTITY
       */

      const quantity = Number(cartItem.quantity || 0);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(`${product.name} has an invalid quantity.`);
      }

      if (!Number.isInteger(quantity)) {
        throw new Error(`${product.name} quantity must be a whole number.`);
      }

      /**
       * SELLING PRICE
       */

      const sellingPrice = Number(product.price || 0);

      if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
        throw new Error(`${product.name} has an invalid selling price.`);
      }

      /**
       * STOCK
       */

      const availableStock = Number(product.stock || 0);

      if (!Number.isFinite(availableStock) || availableStock < quantity) {
        throw new Error(
          `${product.name} does not have enough stock. Available stock: ${Math.max(
            0,
            availableStock
          )}.`
        );
      }

      /**
       * ==============================================
       * SUBTOTAL
       * ==============================================
       *
       * This is actual selling price.
       *
       * Example:
       *
       * price = ₹1
       * quantity = 5
       *
       * subtotal = ₹5
       * ==============================================
       */

      const itemSubtotal = sellingPrice * quantity;

      subtotal += itemSubtotal;

      /**
       * ==============================================
       * DISPLAY SAVING
       * ==============================================
       *
       * oldPrice is only used to show customer
       * how much they are saving.
       *
       * IMPORTANT:
       *
       * This amount is NOT subtracted again.
       *
       * Example:
       *
       * oldPrice = ₹399
       * price    = ₹1
       *
       * saving = ₹398
       *
       * payable remains ₹1.
       * ==============================================
       */

      const oldPrice = Number(product.oldPrice || 0);

      if (Number.isFinite(oldPrice) && oldPrice > sellingPrice) {
        discount += (oldPrice - sellingPrice) * quantity;
      }

      /**
       * ==============================================
       * ORDER ITEM SNAPSHOT
       * ==============================================
       */

      orderItems.push({
        productId: product._id,

        name: product.name,

        volume: product.volume,

        price: sellingPrice,

        quantity,

        image: product.image,

        /**
         * Delhivery shipping snapshot
         */
        sku: product.sku,
        weight: product.weight,
        length: product.length,
        breadth: product.breadth,
        height: product.height,
      });
    }

    /**
     * ================================================
     * INVALID PRODUCTS HANDLING
     * ================================================
     */

    if (removedInvalidItem && orderItems.length === 0) {
      throw new Error(
        "All products in your bag are no longer available. They have been removed from your bag. Please add available products and try again."
      );
    }

    if (removedInvalidItem) {
      throw new Error(
        "One or more products in your bag are no longer available. They were removed from your bag. Please review your bag and try again."
      );
    }

    /**
     * ================================================
     * ROUND VALUES
     * ================================================
     */

    subtotal = Number(subtotal.toFixed(2));

    discount = Number(discount.toFixed(2));

    /**
     * ================================================
     * SHIPPING
     * ================================================
     */

    const shipping = 1;

    const gst = 0;

    /**
     * ================================================
     * FINAL TOTAL
     * ================================================
     *
     * IMPORTANT:
     *
     * DO NOT:
     *
     * subtotal - discount
     *
     * because discount is already represented in
     * product.price.
     *
     * Correct:
     *
     * subtotal + shipping + gst
     * ================================================
     */

    const total = Number((subtotal + shipping + gst).toFixed(2));

    /**
     * ================================================
     * RESERVE STOCK
     * ================================================
     *
     * Stock is decremented immediately.
     *
     * Example:
     *
     * Stock before = 10
     * Order qty    = 3
     * Stock after  = 7
     *
     * Reservation lasts 30 minutes.
     * ================================================
     */

    for (const item of orderItems) {
      const product = await ctx.db.get(item.productId);

      if (!product) {
        throw new Error(`${item.name} is no longer available.`);
      }

      const currentStock = Number(product.stock || 0);

      if (currentStock < item.quantity) {
        throw new Error(
          `${item.name} is no longer available in the requested quantity.`
        );
      }

      await ctx.db.patch(product._id, {
        stock: currentStock - item.quantity,
      });
    }

    /**
     * ================================================
     * CREATE ORDER
     * ================================================
     */

    const orderNumber = generateOrderNumber();

    const stockReservationExpiresAt = now + STOCK_RESERVATION_MS;

    const orderId = await ctx.db.insert("orders", {
      sessionId: args.sessionId,

      orderNumber,

      /**
       * CUSTOMER
       */

      customerName: address.fullName,

      mobile: address.mobile,

      address: address.address,

      city: address.city,

      state: address.state,

      pincode: address.pincode,

      /**
       * PRODUCTS
       */

      items: orderItems,

      /**
       * PAYMENT SUMMARY
       */

      subtotal,

      /**
       * This is display saving only.
       */
      discount,

      shipping,

      gst,

      /**
       * Actual payable amount.
       */
      total,

      /**
       * PAYMENT
       */

      paymentStatus: "pending",

      /**
       * ORDER
       */

      orderStatus: "pending",

      /**
       * STOCK RESERVATION
       */

      stockReserved: true,

      stockReservedAt: now,

      stockReservationExpiresAt,

      /**
       * TIMESTAMPS
       */

      createdAt: now,

      updatedAt: now,
    });

    /**
     * ================================================
     * RETURN
     * ================================================
     */

    return {
      orderId,

      orderNumber,

      subtotal,

      discount,

      shipping,

      gst,

      total,

      stockReservationExpiresAt,

      itemCount: orderItems.reduce((count, item) => count + item.quantity, 0),
    };
  },
});

/**
 * ==================================================
 * GET ORDER BY ORDER NUMBER
 * ==================================================
 */

export const getOrderByNumber = query({
  args: {
    orderNumber: v.string(),
  },

  handler: async (ctx, args) => {
    const orderNumber = args.orderNumber.trim();

    if (!orderNumber) {
      return null;
    }

    const order = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", orderNumber))
      .unique();

    if (!order) {
      return null;
    }

    return customerSafeOrder(order);
  },
});

/**
 * ==================================================
 * GET ORDER BY ID
 * ==================================================
 *
 * Requires checkout session ownership.
 * ==================================================
 */

export const getOrderById = query({
  args: {
    orderId: v.id("orders"),
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      return null;
    }

    if (order.sessionId !== args.sessionId) {
      return null;
    }

    return customerSafeOrder(order);
  },
});

/**
 * ==================================================
 * GET ORDERS BY SESSION
 * ==================================================
 */

export const getOrdersBySession = query({
  args: {
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();

    return orders.map(customerSafeOrder);
  },
});

/**
 * ==================================================
 * MARK ORDER AS PAID
 * ==================================================
 *
 * REMOVED.
 *
 * Payment confirmation must ONLY happen through:
 *
 * convex/payment.js
 *
 * using verified Razorpay payment information.
 *
 * DO NOT add a public mark-as-paid mutation.
 * ==================================================
 */

/**
 * ==================================================
 * CANCEL ORDER
 * ==================================================
 *
 * Customer can only cancel an order belonging to
 * the same checkout session.
 *
 * If stock is still reserved, release it.
 * ==================================================
 */

export const cancelOrder = mutation({
  args: {
    orderId: v.id("orders"),
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    /**
     * OWNERSHIP
     */

    if (order.sessionId !== args.sessionId) {
      throw new Error("You are not authorized to cancel this order.");
    }

    /**
     * ALREADY PAID
     */

    if (order.paymentStatus === "paid") {
      throw new Error("A paid order cannot be cancelled this way.");
    }

    /**
     * ALREADY CANCELLED
     */

    if (
      order.paymentStatus === "cancelled" ||
      order.orderStatus === "cancelled"
    ) {
      return {
        success: true,
        alreadyCancelled: true,
      };
    }

    /**
     * ==============================================
     * RELEASE RESERVED STOCK
     * ==============================================
     */

    if (order.stockReserved === true) {
      for (const item of order.items || []) {
        const product = await ctx.db.get(item.productId);

        if (!product) {
          /**
           * Do not silently recreate deleted products.
           * The order remains cancellable, but the deleted
           * product cannot receive stock back.
           */
          continue;
        }

        const currentStock = Number(product.stock || 0);

        const quantity = Number(item.quantity || 0);

        await ctx.db.patch(product._id, {
          stock: currentStock + quantity,
        });
      }
    }

    const now = Date.now();

    await ctx.db.patch(args.orderId, {
      paymentStatus: "cancelled",

      orderStatus: "cancelled",

      stockReserved: false,

      stockReleasedAt: now,

      updatedAt: now,
    });

    return {
      success: true,
      alreadyCancelled: false,
    };
  },
});

/**
 * ==================================================
 * ADMIN — GET ALL ORDERS
 * ==================================================
 */

export const getAllOrders = query({
  args: {
    sessionToken: v.string(),
  },

  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    return await ctx.db.query("orders").order("desc").collect();
  },
});

/**
 * ==================================================
 * ADMIN — UPDATE ORDER STATUS
 * ==================================================
 */

export const updateOrderStatus = mutation({
  args: {
    sessionToken: v.string(),

    orderId: v.id("orders"),

    orderStatus: v.string(),
  },

  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const normalizedStatus = String(args.orderStatus || "")
      .trim()
      .toLowerCase();

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(normalizedStatus)) {
      throw new Error("Invalid order status.");
    }

    await ctx.db.patch(args.orderId, {
      orderStatus: normalizedStatus,

      updatedAt: Date.now(),
    });

    return {
      success: true,

      orderId: args.orderId,

      orderStatus: normalizedStatus,
    };
  },
});

/**
 * ==================================================
 * CUSTOMER — TRACK ORDER BY ORDER NUMBER
 * ==================================================
 */

export const getOrderTrackingByNumber = query({
  args: {
    orderNumber: v.string(),
  },

  handler: async (ctx, args) => {
    const orderNumber = args.orderNumber.trim();

    if (!orderNumber) {
      return null;
    }

    const order = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", orderNumber))
      .unique();

    if (!order) {
      return null;
    }

    return customerSafeOrder(order);
  },
});

/**
 * ==================================================
 * ADMIN — DELETE ORDER
 * ==================================================
 */

export const deleteOrder = mutation({
  args: {
    sessionToken: v.string(),

    orderId: v.id("orders"),
  },

  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    /**
     * ==============================================
     * IMPORTANT:
     * ==============================================
     *
     * Do not allow deleting an active stock
     * reservation without returning the stock.
     */

    if (order.stockReserved === true && order.paymentStatus !== "paid") {
      for (const item of order.items || []) {
        const product = await ctx.db.get(item.productId);

        if (product) {
          const currentStock = Number(product.stock || 0);

          const quantity = Number(item.quantity || 0);

          await ctx.db.patch(product._id, {
            stock: currentStock + quantity,
          });
        }
      }
    }

    await ctx.db.delete(args.orderId);

    return {
      success: true,

      message: "Order deleted successfully.",
    };
  },
});
