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
 * GET ORDER BY PAYMENT ID
 * INTERNAL ONLY
 * =====================================================
 *
 * Used to prevent one Razorpay Payment ID from being
 * attached to multiple ELYVORR orders.
 *
 * =====================================================
 */

export const getOrderByPaymentId = internalQuery({
  args: {
    paymentId: v.string(),
  },

  handler: async (ctx, args) => {
    const paymentId = args.paymentId.trim();

    if (!paymentId) {
      return null;
    }

    const order = await ctx.db
      .query("orders")
      .withIndex("by_paymentId", (q) => q.eq("paymentId", paymentId))
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
    const razorpayOrderId = args.razorpayOrderId.trim();

    if (!razorpayOrderId) {
      throw new Error("Razorpay Order ID is required.");
    }

    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    /**
     * =============================================
     * PREVENT REPLACING RAZORPAY ORDER ID
     * =============================================
     */

    if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
      throw new Error(
        "A different Razorpay order is already linked to this order."
      );
    }

    /**
     * =============================================
     * PREVENT SAME RAZORPAY ORDER ID ON
     * ANOTHER ELYVORR ORDER
     * =============================================
     */

    const existingOrder = await ctx.db
      .query("orders")
      .withIndex("by_razorpayOrderId", (q) =>
        q.eq("razorpayOrderId", razorpayOrderId)
      )
      .unique();

    if (existingOrder && existingOrder._id !== args.orderId) {
      throw new Error(
        "This Razorpay order is already linked to another ELYVORR order."
      );
    }

    await ctx.db.patch(args.orderId, {
      razorpayOrderId,
      updatedAt: Date.now(),
    });

    return {
      success: true,
    };
  },
});

/**
 * =====================================================
 * CHECK PAYMENT ID REUSE
 * INTERNAL ONLY
 * =====================================================
 *
 * A Razorpay Payment ID must belong to only ONE
 * ELYVORR order.
 *
 * =====================================================
 */

async function validatePaymentIdOwnership(ctx, orderId, paymentId) {
  const existingOrder = await ctx.db
    .query("orders")
    .withIndex("by_paymentId", (q) => q.eq("paymentId", paymentId))
    .unique();

  if (!existingOrder) {
    return;
  }

  /**
   * Same payment already belongs to this order.
   * This is safe/idempotent.
   */

  if (existingOrder._id === orderId) {
    return;
  }

  /**
   * Same Razorpay Payment ID is already attached
   * to another order.
   */

  throw new Error(
    "This Razorpay payment is already associated with another order."
  );
}

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
    /**
     * =============================================
     * VALIDATE PAYMENT ID
     * =============================================
     */

    const paymentId = args.paymentId.trim();

    if (!paymentId) {
      throw new Error("Payment ID is required.");
    }

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
      /**
       * If this order is already paid with a different
       * payment ID, do NOT silently accept another ID.
       */

      if (order.paymentId && order.paymentId !== paymentId) {
        throw new Error("This order is already paid with a different payment.");
      }

      return {
        success: true,
        alreadyPaid: true,
        message: "Payment is already marked as paid.",
      };
    }

    /**
     * =============================================
     * PAYMENT ID OWNERSHIP
     * =============================================
     */

    await validatePaymentIdOwnership(ctx, args.orderId, paymentId);

    /**
     * =============================================
     * CHECK STOCK RESERVATION EXPIRY
     * =============================================
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
      paymentId,

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
 * Verify Payment ID ownership
 *        ↓
 * Mark PAID
 *
 * =====================================================
 */

export const markPaymentSuccessByRazorpayOrderId = internalMutation({
  args: {
    razorpayOrderId: v.string(),
    paymentId: v.string(),
    amountPaise: v.number(),
  },

  handler: async (ctx, args) => {
    /**
     * =============================================
     * VALIDATE WEBHOOK PAYMENT DATA
     * =============================================
     */

    const razorpayOrderId = args.razorpayOrderId.trim();

    const paymentId = args.paymentId.trim();

    const receivedAmountPaise = Number(args.amountPaise);

    if (!razorpayOrderId) {
      throw new Error("Razorpay Order ID is required.");
    }

    if (!paymentId) {
      throw new Error("Payment ID is required.");
    }

    if (!Number.isFinite(receivedAmountPaise) || receivedAmountPaise <= 0) {
      throw new Error("Invalid payment amount.");
    }

    /**
     * =============================================
     * FIND ORDER
     * =============================================
     */

    const order = await ctx.db
      .query("orders")
      .withIndex("by_razorpayOrderId", (q) =>
        q.eq("razorpayOrderId", razorpayOrderId)
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

      console.error("Razorpay Order ID:", razorpayOrderId);

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
      /**
       * If the order is already paid, the incoming
       * payment ID must either match the stored ID
       * or already belong to this same order.
       */

      if (order.paymentId && order.paymentId !== paymentId) {
        throw new Error("Order is already paid with a different payment.");
      }

      await validatePaymentIdOwnership(ctx, order._id, paymentId);

      console.log("ELYVORR WEBHOOK: ORDER ALREADY PAID", order.orderNumber);

      return {
        success: true,
        orderFound: true,
        alreadyPaid: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentId: order.paymentId || paymentId,
        message: "Order already marked as paid.",
      };
    }

    /**
     * =============================================
     * PAYMENT ID OWNERSHIP
     * =============================================
     *
     * IMPORTANT:
     * Prevents the same Razorpay Payment ID from
     * being attached to another order.
     */

    await validatePaymentIdOwnership(ctx, order._id, paymentId);

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

    if (receivedAmountPaise !== expectedAmountPaise) {
      console.error("ELYVORR WEBHOOK: PAYMENT AMOUNT MISMATCH", {
        orderNumber: order.orderNumber,
        expectedAmountPaise,
        receivedAmountPaise,
        razorpayOrderId,
        paymentId,
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
      paymentId,

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

    console.log("Razorpay Order:", razorpayOrderId);

    console.log("Payment ID:", paymentId);

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
      paymentId,
      amountPaise: receivedAmountPaise,
      message: "Order marked as paid.",
    };
  },
});
