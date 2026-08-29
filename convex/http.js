import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// =====================================================
// RAZORPAY WEBHOOK
// =====================================================

http.route({
  path: "/razorpay-webhook",
  method: "POST",

  handler: httpAction(async (ctx, request) => {
    try {
      // =================================================
      // GET WEBHOOK SECRET
      // =================================================

      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("RAZORPAY_WEBHOOK_SECRET is not configured.");

        return new Response(
          JSON.stringify({
            success: false,
            error: "Webhook secret not configured.",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // =================================================
      // READ RAW BODY
      // IMPORTANT:
      // Razorpay signature must be generated using
      // the exact raw request body.
      // =================================================

      const rawBody = await request.text();

      // =================================================
      // GET RAZORPAY SIGNATURE
      // =================================================

      const signature = request.headers.get("x-razorpay-signature");

      if (!signature) {
        console.error("Missing Razorpay webhook signature.");

        return new Response(
          JSON.stringify({
            success: false,
            error: "Missing webhook signature.",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // =================================================
      // GENERATE HMAC SHA256 SIGNATURE
      // =================================================
      //
      // Web Crypto API is used because this is a Convex
      // HTTP Action and should not depend on Node crypto.
      // =================================================

      const encoder = new TextEncoder();

      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        {
          name: "HMAC",
          hash: "SHA-256",
        },
        false,
        ["sign"]
      );

      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(rawBody)
      );

      // =================================================
      // CONVERT SIGNATURE TO HEX
      // =================================================

      const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      // =================================================
      // VERIFY SIGNATURE
      // =================================================

      if (expectedSignature !== signature) {
        console.error("Invalid Razorpay webhook signature.");

        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid webhook signature.",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      console.log("Razorpay webhook signature verified.");

      // =================================================
      // PARSE WEBHOOK JSON
      // =================================================

      let payload;

      try {
        payload = JSON.parse(rawBody);
      } catch (error) {
        console.error("Invalid Razorpay webhook JSON:", error);

        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid webhook JSON.",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // =================================================
      // GET EVENT
      // =================================================

      const event = payload?.event;

      console.log("=================================================");

      console.log("ELYVORR RAZORPAY WEBHOOK");

      console.log("Event:", event);

      console.log("=================================================");

      // =================================================
      // PAYMENT CAPTURED
      // =================================================

      if (event === "payment.captured") {
        const payment = payload?.payload?.payment?.entity;

        const paymentId = payment?.id;

        const razorpayOrderId = payment?.order_id;

        const amountPaise = Number(payment?.amount || 0);

        console.log("PAYMENT CAPTURED");

        console.log("Payment ID:", paymentId);

        console.log("Razorpay Order ID:", razorpayOrderId);

        console.log("Amount:", amountPaise);

        // -------------------------------------------------
        // VALIDATE PAYMENT DATA
        // -------------------------------------------------

        if (!paymentId || !razorpayOrderId) {
          console.error("Payment captured event is missing payment/order ID.");

          return new Response(
            JSON.stringify({
              success: false,
              error: "Missing payment information.",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }

        // -------------------------------------------------
        // UPDATE CONVEX ORDER
        // -------------------------------------------------

        const result = await ctx.runMutation(
          internal.paymentMutations.markPaymentSuccessByRazorpayOrderId,
          {
            razorpayOrderId,
            paymentId,
            amountPaise,
          }
        );

        console.log("ORDER UPDATE RESULT:", result);
      }

      // =====================================================
      // ORDER PAID
      // =====================================================

      if (event === "order.paid") {
        const orderEntity = payload?.payload?.order?.entity;

        const razorpayOrderId = orderEntity?.id;

        // -------------------------------------------------
        // order.paid payload normally contains payment
        // information as well.
        // -------------------------------------------------

        const payment = payload?.payload?.payment?.entity;

        const paymentId = payment?.id;

        const amountPaise = Number(payment?.amount || orderEntity?.amount || 0);

        console.log("ORDER PAID");

        console.log("Razorpay Order ID:", razorpayOrderId);

        console.log("Payment ID:", paymentId);

        console.log("Amount:", amountPaise);

        // -------------------------------------------------
        // VALIDATE ORDER ID
        // -------------------------------------------------

        if (!razorpayOrderId) {
          console.error("order.paid event is missing Razorpay order ID.");

          return new Response(
            JSON.stringify({
              success: false,
              error: "Missing Razorpay order ID.",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }

        // -------------------------------------------------
        // PAYMENT ID
        // -------------------------------------------------

        if (!paymentId) {
          console.error("order.paid event is missing payment ID.");

          return new Response(
            JSON.stringify({
              success: false,
              error: "Missing payment ID.",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }

        // -------------------------------------------------
        // UPDATE CONVEX ORDER
        // -------------------------------------------------

        const result = await ctx.runMutation(
          internal.paymentMutations.markPaymentSuccessByRazorpayOrderId,
          {
            razorpayOrderId,
            paymentId,
            amountPaise,
          }
        );

        console.log("ORDER.PAID UPDATE RESULT:", result);
      }

      // =====================================================
      // PAYMENT FAILED
      // =====================================================

      if (event === "payment.failed") {
        const payment = payload?.payload?.payment?.entity;

        console.log("=================================================");

        console.log("ELYVORR PAYMENT FAILED");

        console.log("Payment ID:", payment?.id);

        console.log("Razorpay Order ID:", payment?.order_id);

        console.log("Error Code:", payment?.error_code);

        console.log("Error Description:", payment?.error_description);

        console.log("=================================================");

        // IMPORTANT:
        // Do NOT mark the order as paid.
      }

      // =====================================================
      // OTHER EVENTS
      // =====================================================

      if (
        event !== "payment.captured" &&
        event !== "order.paid" &&
        event !== "payment.failed"
      ) {
        console.log("Unhandled Razorpay event:", event);
      }

      // =====================================================
      // SUCCESS RESPONSE
      // =====================================================

      return new Response(
        JSON.stringify({
          success: true,
          received: true,
          event,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      // =====================================================
      // WEBHOOK ERROR
      // =====================================================

      console.error("=================================================");

      console.error("ELYVORR RAZORPAY WEBHOOK ERROR");

      console.error(error);

      console.error("=================================================");

      return new Response(
        JSON.stringify({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Webhook processing failed.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }),
});

// =====================================================
// EXPORT HTTP ROUTER
// =====================================================

export default http;
