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
// GET ORDER BY RAZORPAY ORDER ID
// INTERNAL ONLY
// =====================================================
//
// Used when we need to find a Convex order using the
// Razorpay order ID.
//

export const getOrderByRazorpayOrderId = internalQuery({
  args: {
    razorpayOrderId: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_razorpayOrderId", (q) =>
        q.eq("razorpayOrderId", args.razorpayOrderId)
      )
      .unique();

    return order ?? null;
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

    // -------------------------------------------------
    // PREVENT REPLACING DIFFERENT RAZORPAY ORDER ID
    // -------------------------------------------------

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
//
// Used by:
// payment.verifyPayment()
//
// This is the browser/frontend verification path.
//
// Webhook has a separate mutation below.
//

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

    // -------------------------------------------------
    // ALREADY PAID
    // -------------------------------------------------

    if (order.paymentStatus === "paid") {
      return {
        success: true,
        alreadyPaid: true,
        message: "Payment is already marked as paid.",
      };
    }

    // -------------------------------------------------
    // MARK PAYMENT AS PAID
    // -------------------------------------------------

    await ctx.db.patch(args.orderId, {
      paymentStatus: "paid",

      orderStatus: "confirmed",

      paymentId: args.paymentId,

      updatedAt: Date.now(),
    });

    return {
      success: true,
      alreadyPaid: false,
      message: "Order marked as paid.",
    };
  },
});

// =====================================================
// MARK PAYMENT SUCCESS BY RAZORPAY ORDER ID
// INTERNAL ONLY
// =====================================================
//
// USED BY:
// Razorpay webhook
//
// Events:
// - payment.captured
// - order.paid
//
// Flow:
//
// Razorpay Order ID
//       ↓
// Find Convex Order
//       ↓
// Verify amount
//       ↓
// paymentStatus = paid
//       ↓
// orderStatus = confirmed
//
// =====================================================

export const markPaymentSuccessByRazorpayOrderId = internalMutation({
  args: {
    razorpayOrderId: v.string(),
    paymentId: v.string(),
    amountPaise: v.number(),
  },

  handler: async (ctx, args) => {
    // =================================================
    // FIND ORDER USING INDEX
    // =================================================

    const order = await ctx.db
      .query("orders")
      .withIndex("by_razorpayOrderId", (q) =>
        q.eq("razorpayOrderId", args.razorpayOrderId)
      )
      .unique();

    // =================================================
    // ORDER NOT FOUND
    // =================================================

    if (!order) {
      console.error("=================================================");

      console.error("ELYVORR WEBHOOK: ORDER NOT FOUND");

      console.error("Razorpay Order ID:", args.razorpayOrderId);

      console.error("=================================================");

      return {
        success: false,
        orderFound: false,
        alreadyPaid: false,
        message: "Order not found.",
      };
    }

    console.log("ELYVORR WEBHOOK: ORDER FOUND", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: order.razorpayOrderId,
      paymentStatus: order.paymentStatus,
    });

    // =================================================
    // ALREADY PAID
    // =================================================

    if (order.paymentStatus === "paid") {
      console.log("ELYVORR WEBHOOK: ORDER ALREADY PAID", order.orderNumber);

      return {
        success: true,
        orderFound: true,
        alreadyPaid: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentId: order.paymentId || args.paymentId,
        message: "Order already marked as paid.",
      };
    }

    // =================================================
    // VERIFY PAYMENT AMOUNT
    // =================================================
    //
    // Order total is stored in rupees.
    // Razorpay amount is received in paise.
    //
    // Example:
    //
    // Order total = ₹999
    // Razorpay    = 99900 paise
    //
    // =================================================

    const expectedAmountPaise = Math.round(Number(order.total || 0) * 100);

    const receivedAmountPaise = Number(args.amountPaise || 0);

    console.log("ELYVORR WEBHOOK: AMOUNT CHECK", {
      orderNumber: order.orderNumber,

      expectedAmountPaise,

      receivedAmountPaise,
    });

    // -------------------------------------------------
    // Only validate when Razorpay provided amount
    // -------------------------------------------------

    if (
      receivedAmountPaise > 0 &&
      receivedAmountPaise !== expectedAmountPaise
    ) {
      console.error("ELYVORR WEBHOOK: PAYMENT AMOUNT MISMATCH", {
        orderNumber: order.orderNumber,

        expectedAmountPaise,

        receivedAmountPaise,

        razorpayOrderId: args.razorpayOrderId,

        paymentId: args.paymentId,
      });

      throw new Error("Payment amount does not match order amount.");
    }

    // =================================================
    // MARK ORDER AS PAID
    // =================================================

    await ctx.db.patch(order._id, {
      paymentStatus: "paid",

      orderStatus: "confirmed",

      paymentId: args.paymentId,

      updatedAt: Date.now(),
    });

    // =================================================
    // SUCCESS LOG
    // =================================================

    console.log("=================================================");

    console.log("ELYVORR WEBHOOK PAYMENT SUCCESS");

    console.log("Order ID:", order._id);

    console.log("Order Number:", order.orderNumber);

    console.log("Razorpay Order:", args.razorpayOrderId);

    console.log("Payment ID:", args.paymentId);

    console.log("Amount Paise:", receivedAmountPaise);

    console.log("Expected Amount Paise:", expectedAmountPaise);

    console.log("Payment Status: PAID");

    console.log("Order Status: CONFIRMED");

    console.log("=================================================");

    // =================================================
    // RETURN SUCCESS
    // =================================================

    return {
      success: true,
      orderFound: true,
      alreadyPaid: false,

      orderId: order._id,

      orderNumber: order.orderNumber,

      paymentId: args.paymentId,

      amountPaise: receivedAmountPaise,

      message: "Order marked as paid.",
    };
  },
});
