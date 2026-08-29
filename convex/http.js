import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import crypto from "crypto";

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
      // WEBHOOK SECRET
      // =================================================

      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("ELYVORR: RAZORPAY_WEBHOOK_SECRET is not configured.");

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
      // RAW BODY
      // =================================================

      const rawBody = await request.text();

      // =================================================
      // RAZORPAY SIGNATURE
      // =================================================

      const signature = request.headers.get("x-razorpay-signature");

      if (!signature) {
        console.error("ELYVORR: Missing Razorpay webhook signature.");

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
      // CALCULATE SIGNATURE
      // =================================================

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      // =================================================
      // SIGNATURE LENGTH
      // =================================================

      if (expectedSignature.length !== signature.length) {
        console.error("ELYVORR: Invalid webhook signature length.");

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

      // =================================================
      // VERIFY SIGNATURE
      // =================================================

      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf8"),
        Buffer.from(signature, "utf8")
      );

      if (!isValid) {
        console.error("ELYVORR: Invalid Razorpay webhook signature.");

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

      // =================================================
      // PARSE BODY
      // =================================================

      let payload;

      try {
        payload = JSON.parse(rawBody);
      } catch (error) {
        console.error("ELYVORR: Invalid webhook JSON.", error);

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

      console.log("Payment ID:", paymentId);
      console.log("Razorpay Order ID:", razorpayOrderId);
      console.log("Amount Paise:", amountPaise);

      // =================================================
      // PAYMENT CAPTURED
      // =================================================

      if (event === "payment.captured") {
        if (!paymentId || !razorpayOrderId) {
          console.error("ELYVORR: Payment/order ID missing.");

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

        // =================================================
        // UPDATE CONVEX ORDER
        // =================================================

        const result = await ctx.runMutation(
          internal.paymentMutations.markPaymentSuccessByRazorpayOrderId,
          {
            razorpayOrderId,
            paymentId,
            amountPaise,
          }
        );

        console.log("ELYVORR: Convex payment update result:", result);

        console.log("=================================================");

        return new Response(
          JSON.stringify({
            success: true,
            received: true,
            event,
            result,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // =================================================
      // ORDER PAID
      // =================================================

      if (event === "order.paid") {
        if (!paymentId || !razorpayOrderId) {
          console.error("ELYVORR: order.paid missing payment/order ID.");

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

        const result = await ctx.runMutation(
          internal.paymentMutations.markPaymentSuccessByRazorpayOrderId,
          {
            razorpayOrderId,
            paymentId,
            amountPaise,
          }
        );

        console.log("ELYVORR: order.paid Convex update result:", result);

        return new Response(
          JSON.stringify({
            success: true,
            received: true,
            event,
            result,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // =================================================
      // PAYMENT FAILED
      // =================================================

      if (event === "payment.failed") {
        console.log("ELYVORR PAYMENT FAILED:", paymentId);

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
      }

      // =================================================
      // OTHER EVENTS
      // =================================================

      console.log("ELYVORR: Event ignored:", event);

      return new Response(
        JSON.stringify({
          success: true,
          received: true,
          ignored: true,
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
      console.error("=================================================");

      console.error("ELYVORR WEBHOOK ERROR:", error);

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

export default http;
