import { useMemo, useState } from "react";
import { ArrowLeft, Check, MapPin, ShieldCheck, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";

// =====================================================
// GET / CREATE SESSION ID
// =====================================================

function getSessionId() {
  const storageKey = "elyvorr_session_id";

  let sessionId = localStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = crypto.randomUUID();

    localStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

// =====================================================
// PAYMENT PAGE
// =====================================================

function PaymentPage() {
  const navigate = useNavigate();

  const [sessionId] = useState(() => getSessionId());

  const [paymentLoading, setPaymentLoading] = useState(false);

  const [paymentError, setPaymentError] = useState("");

  // =====================================================
  // CONVEX CART
  // =====================================================

  const cartItems = useQuery(api.cart.getCart, {
    sessionId,
  });

  // =====================================================
  // CONVEX ADDRESS
  // =====================================================

  const savedAddress = useQuery(api.addresses.getAddress, {
    sessionId,
  });

  // =====================================================
  // ORDER + RAZORPAY FUNCTIONS
  // =====================================================

  const createPendingOrder = useMutation(api.orders.createPendingOrder);

  const createRazorpayOrder = useAction(api.payment.createRazorpayOrder);

  const verifyPayment = useAction(api.payment.verifyPayment);

  // =====================================================
  // LOADING
  // =====================================================

  const isLoading = cartItems === undefined || savedAddress === undefined;

  // =====================================================
  // TOTALS
  // =====================================================

  const subtotal = useMemo(() => {
    if (!cartItems) return 0;

    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const shipping = cartItems?.length > 0 ? 99 : 0;

  const gst = Math.round(subtotal * 0.08);

  const grandTotal = subtotal + shipping + gst;

  const itemCount = useMemo(() => {
    if (!cartItems) return 0;

    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // =====================================================
  // LOAD RAZORPAY CHECKOUT
  // =====================================================

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // =====================================================
  // PROCEED TO PAY
  // =====================================================

  const handleProceedToPay = async () => {
    if (!savedAddress) {
      navigate("/checkout/address");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setPaymentError("Your shopping bag is empty.");
      return;
    }

    setPaymentError("");
    setPaymentLoading(true);

    try {
      // =================================================
      // 1. CREATE PENDING ORDER
      // =================================================

      const pendingOrder = await createPendingOrder({
        sessionId,
      });

      if (!pendingOrder?.orderId) {
        throw new Error("Unable to create your order.");
      }

      // =================================================
      // 2. CREATE RAZORPAY ORDER
      // =================================================

      const razorpayOrder = await createRazorpayOrder({
        orderId: pendingOrder.orderId,

        amount: pendingOrder.total,

        orderNumber: pendingOrder.orderNumber,
      });

      if (!razorpayOrder?.razorpayOrderId) {
        throw new Error("Unable to create Razorpay order.");
      }

      // =================================================
      // 3. LOAD RAZORPAY
      // =================================================

      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error("Razorpay checkout could not be loaded.");
      }

      // =================================================
      // 4. RAZORPAY CHECKOUT OPTIONS
      // =================================================

      const options = {
        key: razorpayOrder.keyId,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: "ELYVORR",

        description: `Order ${pendingOrder.orderNumber}`,

        order_id: razorpayOrder.razorpayOrderId,

        prefill: {
          name: savedAddress.fullName,

          contact: savedAddress.mobile,
        },

        notes: {
          orderNumber: pendingOrder.orderNumber,
        },

        theme: {
          color: "#C9A96E",
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },

        // =================================================
        // PAYMENT SUCCESS
        // =================================================

        handler: async function (response) {
          try {
            setPaymentError("");

            const verification = await verifyPayment({
              orderId: pendingOrder.orderId,

              razorpayOrderId: response.razorpay_order_id,

              razorpayPaymentId: response.razorpay_payment_id,

              razorpaySignature: response.razorpay_signature,
            });

            if (!verification?.success) {
              throw new Error("Payment verification failed.");
            }

            // Save last order
            localStorage.setItem(
              "elyvorr_last_order",
              JSON.stringify({
                orderId: pendingOrder.orderId,

                orderNumber: pendingOrder.orderNumber,

                total: pendingOrder.total,

                paymentId: response.razorpay_payment_id,
              })
            );

            setPaymentLoading(false);

            // Go to success page
            navigate(
              `/order-success?order=${encodeURIComponent(
                pendingOrder.orderNumber
              )}`
            );
          } catch (error) {
            console.error("Payment verification error:", error);

            setPaymentError(error?.message || "Payment verification failed.");

            setPaymentLoading(false);
          }
        },
      };

      // =================================================
      // CREATE RAZORPAY INSTANCE
      // =================================================

      const razorpay = new window.Razorpay(options);

      // =================================================
      // PAYMENT FAILED
      // =================================================

      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response);

        setPaymentError(
          response?.error?.description || "Payment failed. Please try again."
        );

        setPaymentLoading(false);
      });

      // =================================================
      // OPEN RAZORPAY
      // =================================================

      razorpay.open();
    } catch (error) {
      console.error("Payment initialization error:", error);

      setPaymentError(error?.message || "Unable to start payment.");

      setPaymentLoading(false);
    }
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FAF8F4]">
        <header className="border-b border-[#E7E1D7] bg-white">
          <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8">
            <div className="h-5 w-24 animate-pulse rounded bg-[#E8E1D6]" />

            <div className="text-center">
              <div className="font-serif text-2xl font-semibold tracking-[4px]">
                ELYVORR
              </div>

              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
                Secure Checkout
              </p>
            </div>

            <div className="h-5 w-16 animate-pulse rounded bg-[#E8E1D6]" />
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="h-4 w-20 animate-pulse rounded bg-[#E8E1D6]" />

          <div className="mt-4 h-14 w-80 max-w-full animate-pulse rounded bg-[#E8E1D6]" />

          <div className="mt-3 h-5 w-[500px] max-w-full animate-pulse rounded bg-[#E8E1D6]" />

          <div className="mt-10 grid gap-7 lg:grid-cols-[minmax(0,1fr)_430px]">
            <div className="space-y-7">
              <div className="h-52 animate-pulse rounded-[26px] bg-white" />
              <div className="h-44 animate-pulse rounded-[26px] bg-white" />
              <div className="h-72 animate-pulse rounded-[26px] bg-white" />
            </div>

            <div className="h-[520px] animate-pulse rounded-[28px] bg-white" />
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (!cartItems || cartItems.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F4] px-5">
        <div className="w-full max-w-md text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[4px] text-[#C9A96E]">
            ELYVORR
          </p>

          <h1 className="mt-4 font-serif text-4xl font-semibold text-[#181818]">
            No Order Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#777]">
            Your shopping bag is empty. Add a fragrance before proceeding to
            payment.
          </p>

          <button
            type="button"
            onClick={() => navigate("/collection")}
            className="mt-8 rounded-xl bg-[#181818] px-8 py-4 text-xs font-semibold uppercase tracking-[2px] text-white transition hover:bg-[#C9A96E]"
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#FAF8F4] text-[#181818]">
      {/* HEADER */}

      <header className="border-b border-[#E7E1D7] bg-white">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/checkout/address")}
            className="flex items-center gap-2 text-sm text-[#555] transition hover:text-[#C9A96E]"
          >
            <ArrowLeft size={18} />

            <span className="hidden sm:inline">Back to Address</span>
          </button>

          <div className="text-center">
            <div className="font-serif text-2xl font-semibold tracking-[4px]">
              ELYVORR
            </div>

            <p className="mt-1 text-[8px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
              Secure Checkout
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#777]">
            <ShieldCheck size={17} className="text-[#2F8F46]" />

            <span className="hidden sm:inline">Secure</span>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[4px] text-[#C9A96E]">
            Step 02
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl lg:text-6xl">
            Proceed To Pay
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777]">
            Review your delivery details and order before making your secure
            payment.
          </p>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_430px]">
          {/* LEFT */}

          <div className="space-y-7">
            {/* ADDRESS */}

            <section className="rounded-[26px] border border-[#E5DED3] bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#F5EFE3]">
                    <MapPin size={21} className="text-[#C9A96E]" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
                      Delivery Address
                    </p>

                    <h2 className="mt-1 font-serif text-2xl font-semibold">
                      {savedAddress?.fullName || "Your Address"}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/checkout/address")}
                  className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#777] transition hover:text-[#C9A96E]"
                >
                  Edit
                </button>
              </div>

              {savedAddress ? (
                <div className="mt-6 rounded-2xl bg-[#F9F7F3] p-5">
                  <p className="text-sm leading-6 text-[#555]">
                    {savedAddress.address}
                  </p>

                  <p className="text-sm leading-6 text-[#555]">
                    {savedAddress.city}, {savedAddress.state} -{" "}
                    {savedAddress.pincode}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs text-[#777]">
                    <span>
                      <strong className="text-[#181818]">Mobile:</strong>{" "}
                      {savedAddress.mobile}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#2F8F46]">
                    <Check size={15} />
                    Delivery address saved
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-[#FFF8ED] p-5">
                  <p className="text-sm font-semibold text-[#8A6A32]">
                    Delivery address required
                  </p>

                  <p className="mt-1 text-xs text-[#9A7C43]">
                    Please add your delivery address before proceeding to
                    payment.
                  </p>
                </div>
              )}
            </section>

            {/* DELIVERY */}

            <section className="rounded-[26px] border border-[#E5DED3] bg-white p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#F5EFE3]">
                  <Truck size={21} className="text-[#C9A96E]" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
                    Delivery
                  </p>

                  <h2 className="mt-1 font-serif text-2xl font-semibold">
                    Standard Delivery
                  </h2>

                  <p className="mt-2 text-sm text-[#777]">
                    Estimated delivery in 2–4 business days
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#E8D5AC] bg-[#FCF8EF] px-5 py-4">
                <div>
                  <p className="text-sm font-semibold">Fast & Safe Delivery</p>

                  <p className="mt-1 text-xs text-[#777]">
                    Carefully packed for you.
                  </p>
                </div>

                <span className="text-sm font-semibold text-[#2F8F46]">
                  ₹99
                </span>
              </div>
            </section>

            {/* ORDER ITEMS */}

            <section className="rounded-[26px] border border-[#E5DED3] bg-white p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
                    Your Selection
                  </p>

                  <h2 className="mt-1 font-serif text-2xl font-semibold">
                    Order Items
                  </h2>
                </div>

                <span className="text-xs text-[#888]">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="mt-7 divide-y divide-[#ECE7DF]">
                {cartItems.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-5 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-[105px] w-[86px] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F7F3EC]">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-contain p-3"
                        />
                      ) : (
                        <div className="h-20 w-10 rounded-xl bg-[#C9A96E]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-xl font-semibold">
                            {product.name}
                          </h3>

                          <p className="mt-1 text-sm text-[#777]">
                            {product.volume
                              ? `Eau de Parfum • ${product.volume}`
                              : "Eau de Parfum"}
                          </p>
                        </div>

                        <p className="whitespace-nowrap font-semibold">
                          ₹
                          {(product.price * product.quantity).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <span className="rounded-full bg-[#F7F3EC] px-4 py-2 text-xs text-[#666]">
                          Quantity:{" "}
                          <strong className="text-[#181818]">
                            {product.quantity}
                          </strong>
                        </span>

                        <span className="text-xs text-[#999]">
                          ₹{product.price.toLocaleString("en-IN")} / item
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECURITY */}

            <div className="flex items-center gap-4 rounded-[22px] border border-[#E5DED3] bg-white p-5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#EAF8EC]">
                <ShieldCheck size={20} className="text-[#2F8F46]" />
              </div>

              <div>
                <p className="text-sm font-semibold">Secure Payment</p>

                <p className="mt-1 text-xs text-[#888]">
                  Your payment details are securely processed by Razorpay.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SUMMARY */}

          <aside className="h-fit rounded-[28px] border border-[#E5DED3] bg-white p-6 shadow-[0_20px_70px_rgba(30,25,20,0.06)] sm:p-8 lg:sticky lg:top-8">
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
              Order Summary
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold">
              Your Order
            </h2>

            <div className="mt-7 border-t border-[#E8E2D8]" />

            <div className="divide-y divide-[#ECE7DF]">
              {cartItems.map((product) => (
                <div key={product.id} className="flex items-center gap-3 py-5">
                  <div className="flex h-16 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F7F3EC]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <div className="h-12 w-6 rounded-lg bg-[#C9A96E]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-[#888]">
                      {product.quantity} × ₹
                      {product.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <p className="text-sm font-semibold">
                    ₹
                    {(product.price * product.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E8E2D8] pt-6">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#777]">Subtotal</span>

                  <span className="font-semibold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#777]">Discount</span>

                  <span className="font-semibold text-[#2F8F46]">₹0</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#777]">Shipping</span>

                  <span className="font-semibold">₹{shipping}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#777]">GST</span>

                  <span className="font-semibold">
                    ₹{gst.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="my-6 border-t border-[#E8E2D8]" />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#999]">
                  Grand Total
                </p>

                <p className="mt-1 font-serif text-4xl font-semibold">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </p>
              </div>

              {/* ERROR */}

              {paymentError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-xs leading-5 text-red-600">
                    {paymentError}
                  </p>
                </div>
              )}

              {/* PAY */}

              <button
                type="button"
                onClick={handleProceedToPay}
                disabled={!savedAddress || paymentLoading}
                className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold uppercase tracking-[2px] transition duration-300 ${
                  !savedAddress || paymentLoading
                    ? "cursor-not-allowed bg-[#D5D1CB] text-white"
                    : "bg-[#181818] text-white hover:bg-[#C9A96E]"
                }`}
              >
                <ShieldCheck size={18} />

                {paymentLoading
                  ? "Processing..."
                  : savedAddress
                    ? "Proceed To Pay"
                    : "Add Delivery Address"}
              </button>

              <p className="mt-4 text-center text-[11px] leading-5 text-[#999]">
                You will be redirected to Razorpay's secure checkout.
              </p>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#2F8F46]">
                <ShieldCheck size={15} />
                Secure checkout
              </div>

              <p className="mt-3 text-center text-[10px] text-[#AAA]">
                Test Mode — No real money will be charged.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default PaymentPage;
