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
        console.error(
          "ELYVORR WEBHOOK: RAZORPAY_WEBHOOK_SECRET is not configured."
        );

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
      // IMPORTANT:
      // Razorpay signature must be calculated using
      // the exact raw request body.
      // =================================================

      const rawBody = await request.text();

      // =================================================
      // RAZORPAY SIGNATURE
      // =================================================

      const signature = request.headers.get("x-razorpay-signature");

      if (!signature) {
        console.error("ELYVORR WEBHOOK: Missing x-razorpay-signature.");

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
      // CALCULATE EXPECTED SIGNATURE
      // =================================================

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      // =================================================
      // VERIFY SIGNATURE LENGTH
      // =================================================

      if (expectedSignature.length !== signature.length) {
        console.error("ELYVORR WEBHOOK: Invalid signature length.");

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
        console.error("ELYVORR WEBHOOK: Invalid webhook signature.");

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
      // PARSE JSON
      // =================================================

      let payload;

      try {
        payload = JSON.parse(rawBody);
      } catch (error) {
        console.error("ELYVORR WEBHOOK: Invalid JSON payload.");

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
      console.log("ELYVORR RAZORPAY WEBHOOK");
      console.log("EVENT:", event);
      console.log("=================================================");

      // =================================================
      // PAYMENT CAPTURED
      // =================================================

      if (event === "payment.captured") {
        const payment = payload?.payload?.payment?.entity;

        const paymentId = payment?.id;
        const razorpayOrderId = payment?.order_id;

        const amountPaise = Number(payment?.amount || 0);

        // -------------------------------------------------
        // VALIDATE PAYMENT DATA
        // -------------------------------------------------

        if (!paymentId || !razorpayOrderId) {
          console.error(
            "ELYVORR WEBHOOK: Payment ID or Razorpay Order ID missing.",
            {
              paymentId,
              razorpayOrderId,
            }
          );

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

        console.log("ELYVORR WEBHOOK: Processing captured payment...");

        console.log("Razorpay Order ID:", razorpayOrderId);
        console.log("Payment ID:", paymentId);
        console.log("Amount Paise:", amountPaise);

        const result = await ctx.runMutation(
          internal.paymentMutations.markPaymentSuccessByRazorpayOrderId,
          {
            razorpayOrderId,
            paymentId,
            amountPaise,
          }
        );

        console.log("ELYVORR WEBHOOK: Convex update result:", result);
      }

      // =================================================
      // ORDER PAID
      // =================================================
      // Razorpay may send order.paid after successful
      // payment. We also handle this event.
      // =================================================

      if (event === "order.paid") {
        const orderEntity = payload?.payload?.order?.entity;

        const razorpayOrderId = orderEntity?.id;

        // -------------------------------------------------
        // PAYMENT ENTITY
        // -------------------------------------------------

        const payment = payload?.payload?.payment?.entity;

        const paymentId = payment?.id || "";

        const amountPaise = Number(
          payment?.amount ||
            orderEntity?.amount_paid ||
            orderEntity?.amount ||
            0
        );

        if (!razorpayOrderId) {
          console.error(
            "ELYVORR WEBHOOK: order.paid missing Razorpay Order ID."
          );

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
        // If payment ID is unavailable in order.paid,
        // don't overwrite an existing payment ID with
        // an empty string.
        //
        // payment.captured normally handles the payment
        // ID. order.paid is mainly a backup confirmation.
        // -------------------------------------------------

        if (paymentId) {
          console.log("ELYVORR WEBHOOK: Processing order.paid...");

          const result = await ctx.runMutation(
            internal.paymentMutations.markPaymentSuccessByRazorpayOrderId,
            {
              razorpayOrderId,
              paymentId,
              amountPaise,
            }
          );

          console.log("ELYVORR WEBHOOK: order.paid update result:", result);
        } else {
          console.log(
            "ELYVORR WEBHOOK: order.paid received without payment ID.",
            {
              razorpayOrderId,
              amountPaise,
            }
          );
        }
      }

      // =================================================
      // PAYMENT FAILED
      // =================================================

      if (event === "payment.failed") {
        const payment = payload?.payload?.payment?.entity;

        console.log("ELYVORR RAZORPAY PAYMENT FAILED");

        console.log("Payment ID:", payment?.id);

        console.log("Razorpay Order ID:", payment?.order_id);

        console.log(
          "Error:",
          payment?.error_description ||
            payment?.error_reason ||
            "Unknown payment error"
        );
      }

      // =================================================
      // PAYMENT AUTHORIZED
      // =================================================

      if (event === "payment.authorized") {
        const payment = payload?.payload?.payment?.entity;

        console.log("ELYVORR PAYMENT AUTHORIZED:", payment?.id);
      }

      // =================================================
      // ACKNOWLEDGE RAZORPAY
      // =================================================

      return new Response(
        JSON.stringify({
          success: true,
          received: true,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      // =================================================
      // GLOBAL ERROR
      // =================================================

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
