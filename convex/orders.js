import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
 * CREATE PENDING ORDER
 * ==================================================
 */

export const createPendingOrder = mutation({
  args: {
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
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
     * BUILD ORDER ITEMS
     * ================================================
     */

    const orderItems = [];

    let subtotal = 0;
    let discount = 0;

    let removedInvalidItem = false;

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);

      /**
       * PRODUCT NOT FOUND
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
       * STOCK CHECK
       */

      if (product.stock < cartItem.quantity) {
        throw new Error(`${product.name} does not have enough stock.`);
      }

      /**
       * BASIC VALUES
       */

      const sellingPrice = Number(product.price || 0);
      const quantity = Number(cartItem.quantity || 0);

      /**
       * PRICE VALIDATION
       */

      if (sellingPrice < 0) {
        throw new Error(`${product.name} has an invalid selling price.`);
      }

      if (quantity <= 0) {
        throw new Error(`${product.name} has an invalid quantity.`);
      }

      /**
       * ================================================
       * SUBTOTAL
       * ================================================
       */

      const itemSubtotal = sellingPrice * quantity;

      subtotal += itemSubtotal;

      /**
       * ================================================
       * PRODUCT-SPECIFIC PERCENTAGE DISCOUNT
       *
       * Example:
       *
       * Price = ₹299
       * Discount = 1%
       * Quantity = 1
       *
       * Discount = ₹2.99
       *
       * oldPrice is NOT used for calculation.
       * ================================================
       */

      const productDiscount = Math.min(
        100,
        Math.max(0, Number(product.discount || 0))
      );

      const itemDiscount = (sellingPrice * productDiscount) / 100;

      discount += itemDiscount * quantity;

      /**
       * ================================================
       * SHIPPING PRODUCT SNAPSHOT
       *
       * These values are copied from the product into
       * the order so Delhivery can use the original
       * shipping information even if the product is
       * edited later.
       * ================================================
       */

      const item = {
        productId: product._id,
        name: product.name,
        volume: product.volume,
        price: sellingPrice,
        quantity,
        image: product.image,

        // Delhivery shipping data
        sku: product.sku,
        weight: product.weight,
        length: product.length,
        breadth: product.breadth,
        height: product.height,
      };

      orderItems.push(item);
    }

    /**
     * ================================================
     * HANDLE REMOVED PRODUCTS
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
     * ROUND DISCOUNT
     * ================================================
     */

    discount = Number(discount.toFixed(2));

    /**
     * ================================================
     * ORDER TOTALS
     * ================================================
     */

    const shipping = 1;
    const gst = 0;

    /**
     * subtotal
     *    - discount
     *    + shipping
     *    + gst
     *    = total
     */

    const total = Number(
      Math.max(0, subtotal - discount + shipping + gst).toFixed(2)
    );

    /**
     * ================================================
     * CREATE ORDER
     * ================================================
     */

    const orderNumber = generateOrderNumber();
    const now = Date.now();

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
      discount,
      shipping,
      gst,
      total,

      /**
       * PAYMENT
       */

      paymentStatus: "pending",

      /**
       * ORDER STATUS
       */

      orderStatus: "pending",

      /**
       * TIMESTAMPS
       */

      createdAt: now,
      updatedAt: now,
    });

    /**
     * ================================================
     * RETURN ORDER DATA
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
    return await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) =>
        q.eq("orderNumber", args.orderNumber.trim())
      )
      .unique();
  },
});

/**
 * ==================================================
 * GET ORDER BY ID
 * ==================================================
 */

export const getOrderById = query({
  args: {
    orderId: v.id("orders"),
  },

  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
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
    return await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();
  },
});

/**
 * ==================================================
 * MARK ORDER AS PAID
 * ==================================================
 */

export const markOrderPaid = mutation({
  args: {
    orderId: v.id("orders"),
    paymentId: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.paymentStatus === "paid") {
      return {
        success: true,
        message: "Order is already paid.",
      };
    }

    await ctx.db.patch(args.orderId, {
      paymentStatus: "paid",
      orderStatus: "confirmed",
      paymentId: args.paymentId,
      updatedAt: Date.now(),
    });

    return {
      success: true,
    };
  },
});

/**
 * ==================================================
 * CANCEL ORDER
 * ==================================================
 */

export const cancelOrder = mutation({
  args: {
    orderId: v.id("orders"),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.paymentStatus === "paid") {
      throw new Error("A paid order cannot be cancelled this way.");
    }

    await ctx.db.patch(args.orderId, {
      paymentStatus: "cancelled",
      orderStatus: "cancelled",
      updatedAt: Date.now(),
    });

    return {
      success: true,
    };
  },
});

/**
 * ==================================================
 * ADMIN — GET ALL ORDERS
 * ==================================================
 */

export const getAllOrders = query({
  args: {},

  handler: async (ctx) => {
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
    orderId: v.id("orders"),
    orderStatus: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    /**
     * Normalize status
     */

    const normalizedStatus = String(args.orderStatus || "")
      .trim()
      .toLowerCase();

    /**
     * Allowed statuses
     */

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

    /**
     * Update order
     */

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
 *
 * Sensitive customer information is intentionally
 * NOT returned.
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

    /**
     * Find order
     */

    const order = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", orderNumber))
      .unique();

    if (!order) {
      return null;
    }

    /**
     * Customer-safe tracking data
     */

    return {
      _id: order._id,

      orderNumber: order.orderNumber,

      /**
       * PAYMENT
       */

      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,

      /**
       * ORDER STATUS
       */

      orderStatus: order.orderStatus,

      /**
       * PAYMENT SUMMARY
       */

      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      gst: order.gst,
      total: order.total,

      /**
       * PRODUCTS
       */

      items: order.items,

      /**
       * =================================================
       * COMMON SHIPPING
       * =================================================
       */

      awbCode: order.awbCode,
      courierName: order.courierName,
      shippingStatus: order.shippingStatus,
      trackingUrl: order.trackingUrl,

      /**
       * =================================================
       * DELHIVERY
       * =================================================
       */

      delhiveryWaybill: order.delhiveryWaybill,
      delhiveryPickupId: order.delhiveryPickupId,
      delhiveryStatus: order.delhiveryStatus,
      delhiveryStatusCode: order.delhiveryStatusCode,
      delhiveryManifestedAt: order.delhiveryManifestedAt,

      /**
       * =================================================
       * TIMESTAMPS
       * =================================================
       */

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
    };
  },
});

/**
 * ==================================================
 * ADMIN — DELETE ORDER
 * ==================================================
 */

export const deleteOrder = mutation({
  args: {
    orderId: v.id("orders"),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    await ctx.db.delete(args.orderId);

    return {
      success: true,
      message: "Order deleted successfully.",
    };
  },
});
