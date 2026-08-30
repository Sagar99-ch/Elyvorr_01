import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ArrowLeft,
  Check,
  Package,
  Search,
  Truck,
  CreditCard,
  Clock,
  XCircle,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// =====================================================
// CUSTOMER SUPPORT NUMBER
// =====================================================
// Example: 919876543210
// 91 + 10 digit mobile number
// =====================================================

const SUPPORT_NUMBER = "919XXXXXXXXX";

function OrderTrackingPage() {
  const navigate = useNavigate();

  const [inputOrderNumber, setInputOrderNumber] = useState("");
  const [searchOrderNumber, setSearchOrderNumber] = useState("");

  // =====================================================
  // GET ORDER
  // =====================================================

  const order = useQuery(api.orders.getOrderTrackingByNumber, {
    orderNumber: searchOrderNumber,
  });

  const isSearching = searchOrderNumber !== "";

  // =====================================================
  // SEARCH ORDER
  // =====================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    const orderNumber = inputOrderNumber.trim().toUpperCase();

    if (!orderNumber) {
      return;
    }

    setSearchOrderNumber(orderNumber);
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setInputOrderNumber("");
    setSearchOrderNumber("");
  };

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    return new Date(timestamp).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // PAYMENT STATUS
  // =====================================================

  const paymentStatus = String(order?.paymentStatus || "").toLowerCase();

  const paymentPaid =
    paymentStatus === "paid" ||
    paymentStatus === "success" ||
    paymentStatus === "successful" ||
    paymentStatus === "captured";

  // =====================================================
  // CURRENT ORDER STATUS
  // =====================================================

  const currentStatus = String(order?.orderStatus || "pending").toLowerCase();

  // =====================================================
  // STATUS STEPS
  // =====================================================

  const statusSteps = [
    {
      key: "confirmed",
      label: "Confirmed",
      icon: Check,
    },
    {
      key: "processing",
      label: "Processing",
      icon: Clock,
    },
    {
      key: "packed",
      label: "Packed",
      icon: Package,
    },
    {
      key: "shipped",
      label: "Shipped",
      icon: Truck,
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: Check,
    },
  ];

  const statusOrder = [
    "pending",
    "confirmed",
    "processing",
    "packed",
    "shipped",
    "delivered",
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);

  const isStepCompleted = (stepKey) => {
    const stepIndex = statusOrder.indexOf(stepKey);

    return currentIndex >= 0 && stepIndex >= 0 && currentIndex >= stepIndex;
  };

  // =====================================================
  // CUSTOMER SUPPORT
  // =====================================================

  const phoneLink = `tel:+${SUPPORT_NUMBER}`;

  const whatsappMessage = encodeURIComponent(
    order
      ? `Hello ELYVORR Support, I need help regarding my order ${order.orderNumber}.`
      : "Hello ELYVORR Support, I need help with my order."
  );

  const whatsappLink = `https://wa.me/${SUPPORT_NUMBER}?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#181818]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-[#E7E1D7] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-[#777] transition hover:text-[#C9A96E]"
          >
            <ArrowLeft size={17} />
            Back to website
          </button>
        </div>
      </section>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
            ELYVORR
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
            Track Your Order
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#777]">
            Enter your order number to view your payment summary and latest
            delivery status.
          </p>

          {/* =================================================
              SEARCH
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
              />

              <input
                type="text"
                value={inputOrderNumber}
                onChange={(event) =>
                  setInputOrderNumber(event.target.value.toUpperCase())
                }
                placeholder="Enter Order Number"
                className="h-14 w-full rounded-xl border border-[#DED7CC] bg-white pl-11 pr-4 text-sm uppercase tracking-[1px] outline-none transition focus:border-[#C9A96E]"
              />
            </div>

            <button
              type="submit"
              className="h-14 rounded-xl bg-[#181818] px-8 text-xs font-semibold uppercase tracking-[2px] text-white transition hover:bg-[#C9A96E]"
            >
              Track Order
            </button>
          </form>
        </div>
      </section>

      {/* =====================================================
          RESULTS
      ===================================================== */}

      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          {/* =================================================
              LOADING
          ================================================= */}

          {isSearching && order === undefined && (
            <div className="rounded-[24px] border border-[#E7E1D7] bg-white p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E5DED3] border-t-[#C9A96E]" />

              <p className="mt-4 text-sm text-[#777]">Finding your order...</p>
            </div>
          )}

          {/* =================================================
              NOT FOUND
          ================================================= */}

          {isSearching && order === null && (
            <div className="rounded-[24px] border border-[#E7E1D7] bg-white p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4F4] text-[#C65353]">
                <XCircle size={25} />
              </div>

              <h2 className="mt-5 font-serif text-2xl font-semibold">
                Order Not Found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777]">
                We couldn't find an order with this order number. Please check
                the number and try again.
              </p>

              <button
                type="button"
                onClick={handleReset}
                className="mt-6 rounded-xl bg-[#181818] px-6 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {/* =================================================
              ORDER FOUND
          ================================================= */}

          {order && (
            <div className="space-y-6">
              {/* =================================================
                  ORDER HEADER
              ================================================= */}

              <div className="rounded-[24px] border border-[#E7E1D7] bg-white p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#999]">
                      Order Number
                    </p>

                    <h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
                      {order.orderNumber}
                    </h2>

                    <p className="mt-2 text-xs text-[#999]">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[1px] ${
                      paymentPaid
                        ? "bg-[#EAF7ED] text-[#2F8F46]"
                        : "bg-[#FFF6E5] text-[#B78325]"
                    }`}
                  >
                    <CreditCard size={14} />

                    {paymentPaid ? "Payment Successful" : "Payment Pending"}
                  </div>
                </div>
              </div>

              {/* =================================================
                  ORDER STATUS TIMELINE
              ================================================= */}

              <div className="rounded-[24px] border border-[#E7E1D7] bg-white p-6 sm:p-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
                    Order Status
                  </p>

                  <h2 className="mt-2 font-serif text-2xl font-semibold">
                    {currentStatus === "cancelled"
                      ? "Order Cancelled"
                      : currentStatus === "pending"
                        ? "Order Pending"
                        : statusSteps.find((step) => step.key === currentStatus)
                            ?.label || "Order Status"}
                  </h2>
                </div>

                {currentStatus === "cancelled" ? (
                  <div className="mt-8 flex items-center gap-4 rounded-xl bg-[#FFF4F4] p-5 text-[#C65353]">
                    <XCircle size={25} />

                    <div>
                      <p className="font-semibold">
                        This order has been cancelled.
                      </p>

                      <p className="mt-1 text-xs text-[#999]">
                        Please contact ELYVORR support if you need help.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-10">
                    <div className="relative">
                      {/* DESKTOP LINE */}

                      <div className="absolute left-[10%] right-[10%] top-6 hidden h-px bg-[#E5DED3] sm:block" />

                      <div className="relative grid grid-cols-1 gap-7 sm:grid-cols-5 sm:gap-3">
                        {statusSteps.map((step) => {
                          const Icon = step.icon;
                          const completed = isStepCompleted(step.key);
                          const active = currentStatus === step.key;

                          return (
                            <div
                              key={step.key}
                              className="flex items-center gap-4 sm:flex-col sm:gap-3 sm:text-center"
                            >
                              <div
                                className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
                                  completed
                                    ? "border-[#C9A96E] bg-[#C9A96E] text-white"
                                    : "border-[#E5DED3] bg-[#FAF9F6] text-[#AAA]"
                                } ${active ? "ring-4 ring-[#F6F0E5]" : ""}`}
                              >
                                <Icon size={19} />
                              </div>

                              <div>
                                <p
                                  className={`text-xs font-semibold ${
                                    completed ? "text-[#181818]" : "text-[#999]"
                                  }`}
                                >
                                  {step.label}
                                </p>

                                {active && (
                                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-[1px] text-[#C9A96E]">
                                    Current
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================
                  PAYMENT SUMMARY + ITEMS
              ================================================= */}

              <div className="grid gap-6 lg:grid-cols-2">
                {/* =================================================
                    PAYMENT SUMMARY
                ================================================= */}

                <div className="rounded-[24px] border border-[#E7E1D7] bg-white p-6 sm:p-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
                    Payment Summary
                  </p>

                  <h2 className="mt-2 font-serif text-2xl font-semibold">
                    Order Total
                  </h2>

                  <div className="mt-7 space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#777]">Subtotal</span>

                      <span>₹{formatPrice(order.subtotal)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#777]">Discount</span>

                      <span className="text-[#2F8F46]">
                        -₹{formatPrice(order.discount)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#777]">Shipping</span>

                      <span>₹{formatPrice(order.shipping)}</span>
                    </div>

                    <div className="border-t border-[#E7E1D7] pt-5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Paid</span>

                        <span className="font-serif text-2xl font-semibold">
                          ₹{formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`mt-6 rounded-xl px-4 py-3 text-xs ${
                      paymentPaid
                        ? "bg-[#EAF7ED] text-[#2F8F46]"
                        : "bg-[#FFF6E5] text-[#B78325]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard size={15} />

                      <span className="font-semibold">
                        {paymentPaid ? "Payment completed" : "Payment pending"}
                      </span>
                    </div>

                    {order.paymentId && (
                      <p className="mt-1 break-all text-[10px] opacity-70">
                        Payment ID: {order.paymentId}
                      </p>
                    )}
                  </div>
                </div>

                {/* =================================================
                    ITEMS
                ================================================= */}

                <div className="rounded-[24px] border border-[#E7E1D7] bg-white p-6 sm:p-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
                    Order Items
                  </p>

                  <h2 className="mt-2 font-serif text-2xl font-semibold">
                    Your Products
                  </h2>

                  <div className="mt-6 space-y-4">
                    {order.items?.map((item, index) => (
                      <div
                        key={`${item.productId}-${index}`}
                        className="flex gap-4 border-b border-[#EEE9E2] pb-4 last:border-0 last:pb-0"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F8F5F0]">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[9px] font-semibold tracking-[2px] text-[#C9A96E]">
                              ELYVORR
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-serif text-base font-semibold">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-xs text-[#888]">
                            {item.volume} × {item.quantity}
                          </p>

                          <p className="mt-2 text-sm font-semibold">
                            ₹{formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* =================================================
                  CUSTOMER SUPPORT
              ================================================= */}

              <div className="rounded-[24px] border border-[#E7E1D7] bg-[#181818] p-6 text-white sm:p-8">
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
                    Need Help?
                  </p>

                  <h2 className="mt-2 font-serif text-2xl font-semibold">
                    Customer Support
                  </h2>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/60">
                    Need help with your payment, order or delivery? Contact our
                    support team.
                  </p>
                </div>

                <div className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
                  {/* CALL SUPPORT */}

                  <a
                    href="tel:+919522042144"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold uppercase tracking-[1.5px] text-[#181818] transition hover:bg-[#C9A96E] hover:text-white"
                  >
                    <Phone size={17} />
                    Call Support
                  </a>
                  {/* WHATSAPP */}

                  <a
                    href="https://wa.me/919522042144"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:border-[#C9A96E] hover:bg-[#C9A96E]"
                  >
                    <MessageCircle size={17} />
                    WhatsApp
                  </a>
                </div>

                <p className="mt-4 text-center text-[10px] text-white/40">
                  Customer Support: +{SUPPORT_NUMBER}
                </p>
              </div>

              {/* =================================================
                  LAST UPDATED
              ================================================= */}

              <div className="text-center text-[10px] text-[#999]">
                Last updated: {formatDate(order.updatedAt)}
              </div>

              {/* =================================================
                  TRACK ANOTHER ORDER
              ================================================= */}

              <div className="pb-5 text-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold uppercase tracking-[1.5px] text-[#999] transition hover:text-[#C9A96E]"
                >
                  Track Another Order
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default OrderTrackingPage;
