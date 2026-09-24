"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import crypto from "crypto";

/**
 * =====================================================
 * RAZORPAY CONFIG
 * =====================================================
 */

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay environment variables are not configured.");
  }

  return {
    keyId,
    keySecret,
  };
}

/**
 * =====================================================
 * RAZORPAY API REQUEST
 * =====================================================
 */

async function razorpayRequest(path, options = {}) {
  const { keyId, keySecret } = getRazorpayConfig();

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,

    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      raw: text,
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.description ||
        data?.error?.reason ||
        data?.message ||
        `Razorpay API error (${response.status})`
    );
  }

  return data;
}

/**
 * =====================================================
 * CREATE RAZORPAY ORDER
 * =====================================================
 *
 * SECURITY:
 *
 * - Frontend amount is NOT trusted.
 * - Convex order.total is source of truth.
 * - Customer sessionId must match order.sessionId.
 * - Razorpay order is linked to the Convex order.
 *
 * =====================================================
 */

export const createRazorpayOrder = action({
  args: {
    orderId: v.id("orders"),

    /**
     * Customer session ownership.
     */
    sessionId: v.string(),

    /**
     * Kept for frontend compatibility.
     *
     * NOT TRUSTED.
     */
    amount: v.optional(v.number()),

    orderNumber: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    /**
     * =============================================
     * GET ORDER
     * =============================================
     */

    const order = await ctx.runQuery(
      internal.paymentMutations.getOrderForPayment,
      {
        orderId: args.orderId,
      }
    );

    if (!order) {
      throw new Error("Order not found.");
    }

    /**
     * =============================================
     * CUSTOMER OWNERSHIP
     * =============================================
     *
     * Prevent another browser/session from
     * creating a Razorpay order for this order.
     */

    if (order.sessionId !== args.sessionId) {
      throw new Error("You are not authorized to pay for this order.");
    }

    /**
     * =============================================
     * ORDER STATUS
     * =============================================
     */

    if (order.paymentStatus === "paid") {
      throw new Error("This order has already been paid.");
    }

    if (order.paymentStatus === "cancelled") {
      throw new Error("This order has been cancelled.");
    }

    /**
     * =============================================
     * STOCK RESERVATION
     * =============================================
     */

    if (order.stockReserved && order.stockReservationExpiresAt) {
      if (Date.now() >= order.stockReservationExpiresAt) {
        throw new Error(
          "This order's stock reservation has expired. Please create a new order."
        );
      }
    }

    /**
     * =============================================
     * SERVER-SIDE TOTAL
     * =============================================
     */

    const orderTotal = Number(order.total || 0);

    if (!Number.isFinite(orderTotal) || orderTotal < 0) {
      throw new Error("Invalid order total.");
    }

    /**
     * =============================================
     * CONVERT RUPEES → PAISE
     * =============================================
     */

    const amountPaise = Math.round(orderTotal * 100);

    if (amountPaise <= 0) {
      throw new Error("Order amount must be greater than zero.");
    }

    /**
     * =============================================
     * REUSE EXISTING RAZORPAY ORDER
     * =============================================
     *
     * Prevents creating multiple Razorpay
     * orders for the same ELYVORR order.
     */

    if (order.razorpayOrderId) {
      return {
        success: true,

        reused: true,

        keyId: process.env.RAZORPAY_KEY_ID,

        razorpayOrderId: order.razorpayOrderId,

        amount: amountPaise,

        currency: "INR",

        orderNumber: order.orderNumber,
      };
    }

    /**
     * =============================================
     * CREATE RAZORPAY ORDER
     * =============================================
     */

    const razorpayOrder = await razorpayRequest("/orders", {
      method: "POST",

      body: JSON.stringify({
        amount: amountPaise,

        currency: "INR",

        receipt: order.orderNumber,

        notes: {
          convexOrderId: String(order._id),

          orderNumber: order.orderNumber,
        },
      }),
    });

    if (!razorpayOrder?.id) {
      throw new Error("Razorpay did not return an order ID.");
    }

    /**
     * =============================================
     * SAVE RAZORPAY ORDER ID
     * =============================================
     */

    await ctx.runMutation(internal.paymentMutations.saveRazorpayOrderId, {
      orderId: order._id,

      razorpayOrderId: razorpayOrder.id,
    });

    /**
     * =============================================
     * RETURN
     * =============================================
     */

    return {
      success: true,

      reused: false,

      keyId: process.env.RAZORPAY_KEY_ID,

      razorpayOrderId: razorpayOrder.id,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency,

      orderNumber: order.orderNumber,
    };
  },
});

/**
 * =====================================================
 * VERIFY RAZORPAY PAYMENT
 * =====================================================
 *
 * SECURITY FLOW:
 *
 * sessionId
 *     ↓
 * Verify order ownership
 *     ↓
 * razorpay_order_id
 *     +
 * razorpay_payment_id
 *     +
 * razorpay_signature
 *     ↓
 * HMAC SHA256
 *     ↓
 * Compare signature
 *     ↓
 * Verify Razorpay order ID
 *     ↓
 * Fetch actual Razorpay payment
 *     ↓
 * Verify payment amount
 *     ↓
 * Verify payment status
 *     ↓
 * Mark order paid
 *
 * =====================================================
 */

export const verifyPayment = action({
  args: {
    orderId: v.id("orders"),

    /**
     * Customer session ownership.
     */
    sessionId: v.string(),

    razorpayOrderId: v.string(),

    razorpayPaymentId: v.string(),

    razorpaySignature: v.string(),
  },

  handler: async (ctx, args) => {
    /**
     * =============================================
     * VALIDATE INPUT
     * =============================================
     */

    if (
      !args.razorpayOrderId ||
      !args.razorpayPaymentId ||
      !args.razorpaySignature
    ) {
      throw new Error("Incomplete Razorpay payment information.");
    }

    /**
     * =============================================
     * GET ORDER
     * =============================================
     */

    const order = await ctx.runQuery(
      internal.paymentMutations.getOrderForPayment,
      {
        orderId: args.orderId,
      }
    );

    if (!order) {
      throw new Error("Order not found.");
    }

    /**
     * =============================================
     * CUSTOMER OWNERSHIP
     * =============================================
     */

    if (order.sessionId !== args.sessionId) {
      throw new Error(
        "You are not authorized to verify payment for this order."
      );
    }

    /**
     * =============================================
     * ALREADY PAID
     * =============================================
     */

    if (order.paymentStatus === "paid") {
      return {
        success: true,

        alreadyPaid: true,

        orderId: order._id,

        orderNumber: order.orderNumber,

        paymentId: order.paymentId || args.razorpayPaymentId,
      };
    }

    /**
     * =============================================
     * RAZORPAY ORDER ID CHECK
     * =============================================
     */

    if (!order.razorpayOrderId) {
      throw new Error("Razorpay order ID is not linked to this order.");
    }

    if (order.razorpayOrderId !== args.razorpayOrderId) {
      throw new Error("Razorpay order ID does not match this order.");
    }

    /**
     * =============================================
     * STOCK RESERVATION CHECK
     * =============================================
     */

    if (order.stockReserved && order.stockReservationExpiresAt) {
      if (Date.now() >= order.stockReservationExpiresAt) {
        throw new Error(
          "This order's stock reservation has expired. Please create a new order."
        );
      }
    }

    /**
     * =============================================
     * GET SECRET
     * =============================================
     */

    const { keySecret } = getRazorpayConfig();

    /**
     * =============================================
     * CREATE SIGNATURE
     * =============================================
     */

    const payload = `${args.razorpayOrderId}|${args.razorpayPaymentId}`;

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    /**
     * =============================================
     * TIMING-SAFE SIGNATURE CHECK
     * =============================================
     */

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    const receivedBuffer = Buffer.from(args.razorpaySignature, "utf8");

    if (expectedBuffer.length !== receivedBuffer.length) {
      throw new Error("Invalid Razorpay payment signature.");
    }

    const signatureValid = crypto.timingSafeEqual(
      expectedBuffer,
      receivedBuffer
    );

    if (!signatureValid) {
      throw new Error("Invalid Razorpay payment signature.");
    }

    /**
     * =============================================
     * FETCH PAYMENT FROM RAZORPAY
     * =============================================
     */

    const payment = await razorpayRequest(
      `/payments/${encodeURIComponent(args.razorpayPaymentId)}`,
      {
        method: "GET",
      }
    );

    if (!payment?.id) {
      throw new Error("Unable to verify Razorpay payment.");
    }

    /**
     * =============================================
     * PAYMENT ORDER ID CHECK
     * =============================================
     */

    if (payment.order_id !== args.razorpayOrderId) {
      throw new Error("Razorpay payment does not belong to this order.");
    }

    /**
     * =============================================
     * PAYMENT AMOUNT CHECK
     * =============================================
     */

    const expectedAmountPaise = Math.round(Number(order.total || 0) * 100);

    const receivedAmountPaise = Number(payment.amount || 0);

    if (receivedAmountPaise !== expectedAmountPaise) {
      throw new Error(
        "Razorpay payment amount does not match the order amount."
      );
    }

    /**
     * =============================================
     * PAYMENT STATUS CHECK
     * =============================================
     */

    const paymentStatus = String(payment.status || "").toLowerCase();

    if (paymentStatus !== "captured" && paymentStatus !== "authorized") {
      throw new Error(
        `Razorpay payment is not successful. Current status: ${
          paymentStatus || "unknown"
        }`
      );
    }

    /**
     * =============================================
     * MARK PAID
     * =============================================
     */

    const result = await ctx.runMutation(
      internal.paymentMutations.markPaymentSuccess,
      {
        orderId: order._id,

        paymentId: args.razorpayPaymentId,
      }
    );

    /**
     * =============================================
     * RETURN
     * =============================================
     */

    return {
      success: true,

      alreadyPaid: Boolean(result?.alreadyPaid),

      orderId: order._id,

      orderNumber: order.orderNumber,

      paymentId: args.razorpayPaymentId,

      amount: Number(order.total || 0),

      message: "Payment verified successfully.",
    };
  },
});
