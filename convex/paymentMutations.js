import { internalMutation, internalQuery } from "./_generated/server";

import { v } from "convex/values";

// =====================================================
// GET ORDER FOR PAYMENT
// INTERNAL ONLY
// =====================================================

export const getOrderForPayment = internalQuery({
  args: {
    orderId: v.id("orders"),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      return null;
    }

    return order;
  },
});

// =====================================================
// SAVE RAZORPAY ORDER ID
// INTERNAL ONLY
// =====================================================

export const saveRazorpayOrderId = internalMutation({
  args: {
    orderId: v.id("orders"),
    razorpayOrderId: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    // Prevent replacing an existing Razorpay order ID
    if (
      order.razorpayOrderId &&
      order.razorpayOrderId !== args.razorpayOrderId
    ) {
      throw new Error(
        "A different Razorpay order is already linked to this order."
      );
    }

    await ctx.db.patch(args.orderId, {
      razorpayOrderId: args.razorpayOrderId,
      updatedAt: Date.now(),
    });

    return {
      success: true,
    };
  },
});

// =====================================================
// MARK PAYMENT SUCCESS
// INTERNAL ONLY
// =====================================================

export const markPaymentSuccess = internalMutation({
  args: {
    orderId: v.id("orders"),
    paymentId: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    // =============================================
    // ALREADY PAID
    // =============================================

    if (order.paymentStatus === "paid") {
      return {
        success: true,
        message: "Payment is already marked as paid.",
      };
    }

    // =============================================
    // MARK PAYMENT AS PAID
    // =============================================

    await ctx.db.patch(args.orderId, {
      paymentStatus: "paid",
      orderStatus: "confirmed",
      paymentId: args.paymentId,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Order marked as paid.",
    };
  },
});
