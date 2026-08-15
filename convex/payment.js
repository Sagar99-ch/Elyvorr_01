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
    if (!RAZORPAY_KEY_ID) {
      throw new Error("RAZORPAY_KEY_ID is not configured.");
    }

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET is not configured.");
    }

    // =============================================
    // AMOUNT IN PAISE
    // =============================================

    const amountInPaise = Math.round(args.amount * 100);

    if (amountInPaise < 100) {
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
        receipt: args.orderNumber,

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
    // IMPORTANT FIX
    // =============================================

    const razorpayOrder = await response.json();

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
