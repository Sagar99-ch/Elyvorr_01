"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import crypto from "crypto";

// =====================================================
// RAZORPAY CONFIG
// =====================================================

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

export const createRazorpayOrder = action({
  args: {
    orderId: v.id("orders"),
    amount: v.number(),
    orderNumber: v.string(),
  },

  handler: async (ctx, args) => {
    // =============================================
    // CHECK RAZORPAY CONFIG
    // =============================================

    if (!RAZORPAY_KEY_ID) {
      throw new Error("RAZORPAY_KEY_ID is not configured.");
    }

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET is not configured.");
    }

    // =============================================
    // GET REAL ORDER FROM DATABASE
    // =============================================

    const order = await ctx.runQuery(
      internal.paymentMutations.getOrderForPayment,
      {
        orderId: args.orderId,
      }
    );

    if (!order) {
      throw new Error("Order not found.");
    }

    // =============================================
    // PREVENT DUPLICATE PAYMENT
    // =============================================

    if (order.paymentStatus === "paid") {
      throw new Error("This order has already been paid.");
    }

    if (order.orderStatus === "cancelled") {
      throw new Error("This order has been cancelled.");
    }

    // =============================================
    // VERIFY ORDER NUMBER
    // =============================================

    if (args.orderNumber !== order.orderNumber) {
      throw new Error("Invalid order information.");
    }

    // =============================================
    // USE DATABASE TOTAL
    // DO NOT TRUST FRONTEND AMOUNT
    // =============================================

    const amountInRupees = Number(order.total || 0);
    const amountInPaise = Math.round(amountInRupees * 100);

    if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
      throw new Error("Razorpay order amount must be at least ₹1.");
    }

    // =============================================
    // BASIC AUTH
    // =============================================

    const auth = Buffer.from(
      `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    // =============================================
    // CREATE RAZORPAY ORDER
    // =============================================

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },

      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: order.orderNumber,

        notes: {
          convexOrderId: args.orderId,
        },
      }),
    });

    // =============================================
    // HANDLE RAZORPAY ERROR
    // =============================================

    if (!response.ok) {
      const errorText = await response.text();

      console.error("RAZORPAY RAW ERROR:", errorText);

      let razorpayError = null;

      try {
        razorpayError = JSON.parse(errorText);
      } catch {
        // Ignore JSON parsing error
      }

      const description =
        razorpayError?.error?.description || "Unable to create Razorpay order.";

      throw new Error(description);
    }

    // =============================================
    // GET RAZORPAY ORDER
    // =============================================

    const razorpayOrder = await response.json();

    if (!razorpayOrder?.id) {
      throw new Error("Razorpay did not return an order ID.");
    }

    // =============================================
    // SAVE RAZORPAY ORDER ID
    // =============================================

    await ctx.runMutation(internal.paymentMutations.saveRazorpayOrderId, {
      orderId: args.orderId,
      razorpayOrderId: razorpayOrder.id,
    });

    // =============================================
    // RETURN TO FRONTEND
    // =============================================

    return {
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: RAZORPAY_KEY_ID,
    };
  },
});

// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

export const verifyPayment = action({
  args: {
    orderId: v.id("orders"),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.string(),
  },

  handler: async (ctx, args) => {
    // =============================================
    // CHECK SECRET KEY
    // =============================================

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET is not configured.");
    }

    // =============================================
    // GET ORDER
    // =============================================

    const order = await ctx.runQuery(
      internal.paymentMutations.getOrderForPayment,
      {
        orderId: args.orderId,
      }
    );

    if (!order) {
      throw new Error("Order not found.");
    }

    // =============================================
    // VERIFY RAZORPAY ORDER ID
    // =============================================

    if (order.razorpayOrderId !== args.razorpayOrderId) {
      throw new Error("Invalid Razorpay order.");
    }

    // =============================================
    // ALREADY PAID
    // =============================================

    if (order.paymentStatus === "paid") {
      return {
        success: true,
        message: "Payment was already verified.",
        orderId: args.orderId,
        paymentId: order.paymentId || args.razorpayPaymentId,
      };
    }

    // =============================================
    // GENERATE SIGNATURE
    // =============================================

    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${args.razorpayOrderId}|${args.razorpayPaymentId}`)
      .digest("hex");

    // =============================================
    // VERIFY SIGNATURE LENGTH
    // =============================================

    if (generatedSignature.length !== args.razorpaySignature.length) {
      throw new Error("Payment signature verification failed.");
    }

    // =============================================
    // VERIFY SIGNATURE
    // =============================================

    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf8"),
      Buffer.from(args.razorpaySignature, "utf8")
    );

    if (!isValid) {
      throw new Error("Payment signature verification failed.");
    }

    // =============================================
    // MARK PAYMENT SUCCESS
    // =============================================

    const result = await ctx.runMutation(
      internal.paymentMutations.markPaymentSuccess,
      {
        orderId: args.orderId,
        paymentId: args.razorpayPaymentId,
      }
    );

    // =============================================
    // RETURN SUCCESS
    // =============================================

    return {
      success: true,
      message: "Payment verified successfully.",
      orderId: args.orderId,
      paymentId: args.razorpayPaymentId,
      ...result,
    };
  },
});
