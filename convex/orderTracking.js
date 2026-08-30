import { query } from "./_generated/server";
import { v } from "convex/values";

// =====================================================
// TRACK ORDER BY ORDER NUMBER
// =====================================================
//
// Customer sirf Order Number enter karega.
// Example:
// ELY-78268887-3182
//
// Convex query hone ki wajah se status automatically
// real-time update hoga jab admin order status change karega.
// =====================================================

export const getOrderByOrderNumber = query({
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

    // =================================================
    // RETURN ONLY CUSTOMER-SAFE INFORMATION
    // =================================================

    return {
      _id: order._id,

      orderNumber: order.orderNumber,

      customerName: order.customerName,

      // Payment
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,

      // Order
      orderStatus: order.orderStatus,

      // Amount
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      gst: order.gst,
      total: order.total,

      // Items
      items: order.items,

      // Date
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  },
});
