import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// =====================================================
// JSON RESPONSE HELPER
// =====================================================

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// =====================================================
// CONSTANT-TIME HEX SIGNATURE COMPARISON
// =====================================================

function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  let difference = 0;

  for (let i = 0; i < a.length; i++) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return difference === 0;
}

// =====================================================
// RAZORPAY WEBHOOK
// =====================================================

http.route({
  path: "/razorpay-webhook",
  method: "POST",

  handler: httpAction(async (ctx, request) => {
    try {
      // =================================================
      // WEBHOOK SECRET
      // =================================================

      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("ELYVORR: RAZORPAY_WEBHOOK_SECRET is not configured.");

        return jsonResponse(
          {
            success: false,
            error: "Webhook secret not configured.",
          },
          500
        );
      }

      // =================================================
      // RAW BODY
      //
      // IMPORTANT:
      // Razorpay webhook signature must be calculated
      // against the exact raw request body.
      // =================================================

      const rawBody = await request.text();

      if (!rawBody) {
        console.error("ELYVORR: Empty Razorpay webhook body.");

        return jsonResponse(
          {
            success: false,
            error: "Empty webhook body.",
          },
          400
        );
      }

      // =================================================
      // RAZORPAY SIGNATURE
      // =================================================

      const signature = request.headers.get("x-razorpay-signature");

      if (!signature) {
        console.error("ELYVORR: Missing Razorpay webhook signature.");

        return jsonResponse(
          {
            success: false,
            error: "Missing webhook signature.",
          },
          400
        );
      }

      // =================================================
      // CALCULATE HMAC SHA256
      //
      // Web Crypto works in Convex HTTP actions,
      // so Node "crypto" is NOT required here.
      // =================================================

      const encoder = new TextEncoder();

      const keyData = encoder.encode(webhookSecret);

      const cryptoKey = await globalThis.crypto.subtle.importKey(
        "raw",
        keyData,
        {
          name: "HMAC",
          hash: "SHA-256",
        },
        false,
        ["sign"]
      );

      const signatureBuffer = await globalThis.crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        encoder.encode(rawBody)
      );

      // =================================================
      // CONVERT HMAC TO HEX
      // =================================================

      const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      // =================================================
      // VERIFY SIGNATURE
      // =================================================

      if (!safeCompare(expectedSignature, signature.trim())) {
        console.error("ELYVORR: Invalid Razorpay webhook signature.");

        return jsonResponse(
          {
            success: false,
            error: "Invalid webhook signature.",
          },
          400
        );
      }

      console.log("ELYVORR: Razorpay webhook signature verified.");

      // =================================================
      // PARSE BODY
      // =================================================

      let payload;

      try {
        payload = JSON.parse(rawBody);
      } catch (error) {
        console.error("ELYVORR: Invalid Razorpay webhook JSON.", error);

        return jsonResponse(
          {
            success: false,
            error: "Invalid webhook JSON.",
          },
          400
        );
      }

      // =================================================
      // EVENT
      // =================================================

      const event = payload?.event;

      console.log("=================================================");

      console.log("ELYVORR RAZORPAY WEBHOOK RECEIVED");

      console.log("Event:", event);

      // =================================================
      // PAYMENT ENTITY
      // =================================================

      const payment = payload?.payload?.payment?.entity;

      const paymentId = payment?.id;

      const razorpayOrderId = payment?.order_id;

      const amountPaise = Number(payment?.amount || 0);

      console.log("Payment ID:", paymentId || "missing");

      console.log("Razorpay Order ID:", razorpayOrderId || "missing");

      console.log("Amount Paise:", amountPaise);

      // =================================================
      // PAYMENT CAPTURED
      // =================================================

      if (event === "payment.captured") {
        // -----------------------------------------------
        // VALIDATE PAYMENT DATA
        // -----------------------------------------------

        if (!paymentId || !razorpayOrderId) {
          console.error("ELYVORR: payment.captured missing payment/order ID.");

          return jsonResponse(
            {
              success: false,
              error: "Missing payment information.",
            },
            400
          );
        }

        if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
          console.error("ELYVORR: Invalid payment amount.");

          return jsonResponse(
            {
              success: false,
              error: "Invalid payment amount.",
            },
            400
          );
        }

        // -----------------------------------------------
        // MARK PAYMENT SUCCESS
        //
        // This mutation:
        // - finds order by Razorpay order ID
        // - verifies amount
        // - prevents duplicate payment processing
        // - marks order paid
        // - consumes stock reservation
        // -----------------------------------------------

        const result = await ctx.runMutation(
          internal.paymentMutations.markPaymentSuccessByRazorpayOrderId,
          {
            razorpayOrderId,
            paymentId,
            amountPaise,
          }
        );

        console.log("ELYVORR: payment.captured result:", result);

        console.log("=================================================");

        return jsonResponse({
          success: true,
          received: true,
          event,
          result,
        });
      }

      // =================================================
      // ORDER PAID
      // =================================================

      if (event === "order.paid") {
        // -----------------------------------------------
        // VALIDATE PAYMENT DATA
        // -----------------------------------------------

        if (!paymentId || !razorpayOrderId) {
          console.error("ELYVORR: order.paid missing payment/order ID.");

          return jsonResponse(
            {
              success: false,
              error: "Missing payment information.",
            },
            400
          );
        }

        if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
          console.error("ELYVORR: order.paid has invalid amount.");

          return jsonResponse(
            {
              success: false,
              error: "Invalid payment amount.",
            },
            400
          );
        }

        // -----------------------------------------------
        // IDEMPOTENT PAYMENT UPDATE
        // -----------------------------------------------

        const result = await ctx.runMutation(
          internal.paymentMutations.markPaymentSuccessByRazorpayOrderId,
          {
            razorpayOrderId,
            paymentId,
            amountPaise,
          }
        );

        console.log("ELYVORR: order.paid result:", result);

        return jsonResponse({
          success: true,
          received: true,
          event,
          result,
        });
      }

      // =================================================
      // PAYMENT FAILED
      // =================================================

      if (event === "payment.failed") {
        console.log("ELYVORR: Razorpay payment failed:", {
          paymentId,
          razorpayOrderId,
        });

        // IMPORTANT:
        // We intentionally do NOT mark the order as paid.
        //
        // Stock reservation remains available until its
        // expiration/cancel flow handles it.

        return jsonResponse({
          success: true,
          received: true,
          event,
        });
      }

      // =================================================
      // OTHER EVENTS
      // =================================================

      console.log("ELYVORR: Razorpay event ignored:", event);

      return jsonResponse({
        success: true,
        received: true,
        ignored: true,
        event,
      });
    } catch (error) {
      console.error("=================================================");

      console.error("ELYVORR WEBHOOK ERROR:", error);

      console.error("=================================================");

      return jsonResponse(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Webhook processing failed.",
        },
        500
      );
    }
  }),
});

// =====================================================
// EXPORT
// =====================================================

export default http;
