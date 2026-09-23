import { internalMutation, internalQuery } from "./_generated/server";

import { v } from "convex/values";

/**
 * =====================================================
 * GET ORDER FOR PAYMENT
 * INTERNAL ONLY
 * =====================================================
 */

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

/**
 * =====================================================
 * GET ORDER BY RAZORPAY ORDER ID
 * INTERNAL ONLY
 * =====================================================
 *
 * Used by Razorpay webhook.
 *
 * Razorpay Order ID
 *        ↓
 * Convex orders table
 *        ↓
 * Find matching order
 *
 * =====================================================
 */

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

/**
 * =====================================================
 * SAVE RAZORPAY ORDER ID
 * INTERNAL ONLY
 * =====================================================
 */

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

    /**
     * =============================================
     * PREVENT REPLACING RAZORPAY ORDER ID
     * =============================================
     *
     * Once a Razorpay Order ID has been linked,
     * another Razorpay Order ID cannot replace it.
     */

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

/**
 * =====================================================
 * MARK PAYMENT SUCCESS
 * INTERNAL ONLY
 * =====================================================
 *
 * Called ONLY after:
 *
 * 1. Razorpay signature is verified
 * 2. Razorpay Order ID is checked
 * 3. Payment ID is received
 *
 * This function itself is NOT public.
 *
 * =====================================================
 */

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

    /**
     * =============================================
     * ALREADY PAID
     * =============================================
     *
     * Makes payment confirmation idempotent.
     */

    if (order.paymentStatus === "paid") {
      return {
        success: true,

        alreadyPaid: true,

        message: "Payment is already marked as paid.",
      };
    }

    /**
     * =============================================
     * CHECK STOCK RESERVATION EXPIRY
     * =============================================
     *
     * Order was created with a temporary stock
     * reservation.
     *
     * Do not accept payment after reservation
     * expiry.
     */

    if (
      order.stockReserved &&
      order.stockReservationExpiresAt &&
      Date.now() >= order.stockReservationExpiresAt
    ) {
      throw new Error(
        "This order's stock reservation has expired. Please create a new order."
      );
    }

    /**
     * =============================================
     * MARK PAYMENT AS PAID
     * =============================================
     */

    await ctx.db.patch(args.orderId, {
      paymentStatus: "paid",

      orderStatus: "confirmed",

      paymentId: args.paymentId,

      /**
       * Stock was already deducted when the
       * pending order was created.
       *
       * Payment success permanently consumes
       * the reservation.
       */

      stockReserved: false,

      stockReleasedAt: undefined,

      updatedAt: Date.now(),
    });

    return {
      success: true,

      alreadyPaid: false,

      message: "Order marked as paid.",
    };
  },
});

/**
 * =====================================================
 * MARK PAYMENT SUCCESS BY RAZORPAY ORDER ID
 * INTERNAL ONLY
 * =====================================================
 *
 * Used by:
 *
 * Razorpay webhook
 *
 * Events can include:
 *
 * - payment.captured
 * - order.paid
 *
 * Flow:
 *
 * Razorpay Order ID
 *        ↓
 * Find Convex Order
 *        ↓
 * Verify amount
 *        ↓
 * Mark PAID
 *
 * =====================================================
 */

export const markPaymentSuccessByRazorpayOrderId = internalMutation({
  args: {
    razorpayOrderId: v.string(),

    paymentId: v.string(),

    /**
     * Razorpay sends amount in paise.
     *
     * Example:
     *
     * ₹999
     * =
     * 99900 paise
     */

    amountPaise: v.number(),
  },

  handler: async (ctx, args) => {
    /**
     * =============================================
     * FIND ORDER
     * =============================================
     */

    const order = await ctx.db
      .query("orders")
      .withIndex("by_razorpayOrderId", (q) =>
        q.eq("razorpayOrderId", args.razorpayOrderId)
      )
      .unique();

    /**
     * =============================================
     * ORDER NOT FOUND
     * =============================================
     */

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

    /**
     * =============================================
     * ALREADY PAID
     * =============================================
     *
     * Webhooks can be delivered more than once.
     *
     * Never process the same payment twice.
     */

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

    /**
     * =============================================
     * CHECK STOCK RESERVATION
     * =============================================
     */

    if (
      order.stockReserved &&
      order.stockReservationExpiresAt &&
      Date.now() >= order.stockReservationExpiresAt
    ) {
      throw new Error("Order stock reservation has expired.");
    }

    /**
     * =============================================
     * VERIFY PAYMENT AMOUNT
     * =============================================
     *
     * Convex:
     *
     * order.total = rupees
     *
     * Razorpay:
     *
     * amount = paise
     *
     * Example:
     *
     * Order total:
     * ₹999
     *
     * Expected Razorpay:
     * 99900 paise
     *
     * =============================================
     */

    const expectedAmountPaise = Math.round(Number(order.total || 0) * 100);

    const receivedAmountPaise = Number(args.amountPaise || 0);

    console.log("ELYVORR WEBHOOK: AMOUNT CHECK", {
      orderNumber: order.orderNumber,

      expectedAmountPaise,

      receivedAmountPaise,
    });

    /**
     * =============================================
     * AMOUNT MISMATCH
     * =============================================
     */

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

    /**
     * =============================================
     * MARK ORDER PAID
     * =============================================
     */

    await ctx.db.patch(order._id, {
      paymentStatus: "paid",

      orderStatus: "confirmed",

      paymentId: args.paymentId,

      /**
       * Stock was already deducted during
       * createPendingOrder().
       */

      stockReserved: false,

      stockReleasedAt: undefined,

      updatedAt: Date.now(),
    });

    /**
     * =============================================
     * SUCCESS LOG
     * =============================================
     */

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

    /**
     * =============================================
     * RETURN SUCCESS
     * =============================================
     */

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
