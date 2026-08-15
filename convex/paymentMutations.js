import { mutation } from "./_generated/server";
import { v } from "convex/values";

// =====================================================
// SAVE RAZORPAY ORDER ID
// =====================================================

export const saveRazorpayOrderId = mutation({
  args: {
    orderId: v.id("orders"),
    razorpayOrderId: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
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
// =====================================================

export const markPaymentSuccess = mutation({
  args: {
    orderId: v.id("orders"),
    paymentId: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
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
