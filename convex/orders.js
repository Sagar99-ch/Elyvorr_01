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
     * GET PRODUCTS + BUILD ORDER ITEMS
     * ================================================
     */

    const orderItems = [];

    let subtotal = 0;
    let discount = 0;
    let removedInvalidItem = false;

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);

      if (!product) {
        await ctx.db.delete(cartItem._id);
        removedInvalidItem = true;
        continue;
      }

      if (!product.isActive) {
        await ctx.db.delete(cartItem._id);
        removedInvalidItem = true;
        continue;
      }

      if (product.stock < cartItem.quantity) {
        throw new Error(`${product.name} does not have enough stock.`);
      }

      const sellingPrice = Number(product.price || 0);
      const quantity = Number(cartItem.quantity || 0);

      subtotal += sellingPrice * quantity;

      const oldPrice = Number(product.oldPrice || 0);

      if (oldPrice > sellingPrice) {
        discount += (oldPrice - sellingPrice) * quantity;
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        volume: product.volume,
        price: sellingPrice,
        quantity,
        image: product.image,
      });
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
     * ORDER TOTALS
     * ================================================
     */

    const shipping = 1;
    const gst = 0;
    const total = subtotal + shipping + gst;

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

      customerName: address.fullName,
      mobile: address.mobile,

      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,

      items: orderItems,

      subtotal,
      discount,
      shipping,
      gst,
      total,

      paymentStatus: "pending",

      orderStatus: "pending",

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
 *
 * Customer tracking page is connected to the same
 * order record, so changing the status here will
 * automatically update the tracking page.
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
     *
     * Example:
     * "PACKED"     -> "packed"
     * "Packed"     -> "packed"
     * " shipped "  -> "shipped"
     */

    const normalizedStatus = String(args.orderStatus || "")
      .trim()
      .toLowerCase();

    /**
     * Allowed order statuses
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
 * Used by the public customer tracking page.
 *
 * IMPORTANT:
 * This query is reactive.
 *
 * Admin changes:
 *
 * CONFIRMED
 *     ↓
 * PACKED
 *     ↓
 * SHIPPED
 *     ↓
 * DELIVERED
 *
 * Customer tracking page automatically receives
 * the updated order status through Convex.
 *
 * Sensitive customer information such as:
 * - mobile
 * - address
 * - city
 * - state
 * - pincode
 * - sessionId
 *
 * is intentionally NOT returned.
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
     * Return customer-safe tracking data
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
       * TIMESTAMPS
       */

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
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
