import {
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import { useCart } from "../../context/CartContext";

function BagDrawer({ isOpen, onClose }) {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromBag,
    subtotal,
  } = useCart();

  if (!isOpen) return null;

  const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 99;

  const freeShippingRemaining = Math.max(5000 - subtotal, 0);

  const progress = Math.min((subtotal / 5000) * 100, 100);

  const gst = Math.round(subtotal * 0.08);

  const total = subtotal + shipping + gst;

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <>
      {/* =====================================================
            OVERLAY
        ===================================================== */}

      <div
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm"
      />

      {/* =====================================================
            FULL PAGE BAG
        ===================================================== */}

      <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 lg:p-8">
        <div className="flex h-[96vh] w-full max-w-[1500px] overflow-hidden rounded-[26px] border border-[#E7E1D7] bg-[#FAF8F4] shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
          {/* =================================================
                LEFT SIDE
            ================================================= */}

          <section className="flex min-w-0 flex-1 flex-col">
            {/* HEADER */}

            <header className="flex-shrink-0 border-b border-[#E8E2D8] bg-[#FAF8F4] px-6 py-5 sm:px-8 lg:px-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[4px] text-[#C9A96E]">
                    Shopping Bag
                  </p>

                  <h1 className="mt-1 font-serif text-4xl font-semibold leading-none text-[#181818] sm:text-5xl">
                    Your Bag ({totalQuantity})
                  </h1>

                  <p className="mt-2 text-sm text-[#777]">
                    Carefully selected luxury fragrances.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#DED7CC] bg-white transition-all duration-300 hover:rotate-90 hover:bg-[#181818] hover:text-white"
                  aria-label="Close bag"
                >
                  <X size={21} />
                </button>
              </div>
            </header>

            {/* SCROLLABLE LEFT CONTENT */}

            <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8 lg:px-10">
              {/* EMPTY BAG */}

              {cartItems.length === 0 ? (
                <div className="flex h-full min-h-[500px] flex-col items-center justify-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#F0EBE2]">
                    <ShoppingBag
                      size={38}
                      strokeWidth={1.4}
                      className="text-[#C9A96E]"
                    />
                  </div>

                  <h2 className="mt-7 font-serif text-4xl font-semibold text-[#181818]">
                    Your bag is empty
                  </h2>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#777]">
                    Discover our signature fragrances and find the scent that
                    feels uniquely yours.
                  </p>

                  <button
                    onClick={onClose}
                    className="mt-7 rounded-xl bg-[#181818] px-8 py-4 text-xs font-semibold uppercase tracking-[2px] text-white transition hover:bg-[#C9A96E]"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* SHIPPING PROGRESS */}

                  <div className="rounded-2xl border border-[#E7E1D7] bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        {freeShippingRemaining > 0 ? (
                          <p className="text-sm text-[#555]">
                            Add{" "}
                            <span className="font-semibold text-[#C9A96E]">
                              ₹{freeShippingRemaining.toLocaleString("en-IN")}
                            </span>{" "}
                            more to get{" "}
                            <span className="font-semibold text-[#181818]">
                              FREE SHIPPING
                            </span>
                          </p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              size={18}
                              className="text-[#2F8F46]"
                            />

                            <p className="text-sm font-semibold text-[#2F8F46]">
                              Free Shipping Unlocked
                            </p>
                          </div>
                        )}
                      </div>

                      <span className="hidden text-xs text-[#888] sm:block">
                        ₹5,000
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEE9E1]">
                      <div
                        className="h-full rounded-full bg-[#C9A96E] transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between text-[11px] text-[#999]">
                      <span>₹0</span>

                      <span>₹{subtotal.toLocaleString("en-IN")} added</span>

                      <span>₹5,000</span>
                    </div>
                  </div>

                  {/* DELIVERY */}

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F5F1E9] px-5 py-3.5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[1px] text-[#444]">
                        Estimated Delivery
                      </p>

                      <p className="mt-1 text-xs text-[#777]">
                        2–4 Business Days
                      </p>
                    </div>

                    <span className="rounded-full bg-[#DFF3E3] px-3 py-1.5 text-[10px] font-semibold text-[#2F8F46]">
                      Fast Delivery
                    </span>
                  </div>

                  {/* PRODUCTS */}

                  <div className="mt-5 overflow-hidden rounded-2xl border border-[#E7E1D7] bg-white">
                    {cartItems.map((product, index) => (
                      <article
                        key={product.id}
                        className={`p-5 ${
                          index !== cartItems.length - 1
                            ? "border-b border-[#EAE4DA]"
                            : ""
                        }`}
                      >
                        <div className="flex gap-5">
                          {/* IMAGE */}

                          <div className="flex h-[130px] w-[115px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F7F3EC]">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-contain p-2"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="h-24 w-12 rounded-xl bg-[#C9A96E]" />
                            )}
                          </div>

                          {/* DETAILS */}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h2 className="font-serif text-2xl font-semibold text-[#181818]">
                                  {product.name}
                                </h2>

                                <p className="mt-1 text-sm text-[#777]">
                                  Eau de Parfum • {product.volume}
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-[#C9A96E]">★★★★★</span>

                                  <span className="text-xs text-[#999]">
                                    ({product.reviews} Reviews)
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => removeFromBag(product.id)}
                                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[#999] transition hover:bg-red-50 hover:text-red-500"
                                aria-label={`Remove ${product.name}`}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            {/* PRICE */}

                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <span className="text-2xl font-bold text-[#181818]">
                                ₹{product.price.toLocaleString("en-IN")}
                              </span>

                              {product.oldPrice && (
                                <span className="text-sm text-[#999] line-through">
                                  ₹{product.oldPrice.toLocaleString("en-IN")}
                                </span>
                              )}

                              {product.oldPrice && (
                                <span className="rounded-full bg-[#EAF8EC] px-2.5 py-1 text-[10px] font-semibold text-[#2F8F46]">
                                  SAVE ₹
                                  {(
                                    product.oldPrice - product.price
                                  ).toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>

                            {/* BOTTOM */}

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex h-10 items-center overflow-hidden rounded-lg border border-[#DED7CC]">
                                <button
                                  onClick={() => decreaseQuantity(product.id)}
                                  className="flex h-full w-10 items-center justify-center transition hover:bg-[#F5F1E9]"
                                >
                                  <Minus size={15} />
                                </button>

                                <span className="flex h-full w-10 items-center justify-center border-x border-[#DED7CC] text-sm font-semibold">
                                  {product.quantity}
                                </span>

                                <button
                                  onClick={() => increaseQuantity(product.id)}
                                  className="flex h-full w-10 items-center justify-center transition hover:bg-[#F5F1E9]"
                                >
                                  <Plus size={15} />
                                </button>
                              </div>

                              <span className="text-lg font-semibold text-[#181818]">
                                ₹
                                {(
                                  product.price * product.quantity
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* BENEFITS */}

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#E7E1D7] bg-white p-4">
                      <p className="text-sm font-semibold text-[#181818]">
                        ✓ 100% Authentic
                      </p>

                      <p className="mt-1 text-[11px] text-[#888]">
                        Original products
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#E7E1D7] bg-white p-4">
                      <p className="text-sm font-semibold text-[#181818]">
                        ↻ Easy Returns
                      </p>

                      <p className="mt-1 text-[11px] text-[#888]">
                        7 days return policy
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#E7E1D7] bg-white p-4">
                      <p className="text-sm font-semibold text-[#181818]">
                        □ Secure Packaging
                      </p>

                      <p className="mt-1 text-[11px] text-[#888]">
                        Safe & reliable
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* =================================================
                RIGHT ORDER SUMMARY
            ================================================= */}

          <aside className="hidden w-[400px] flex-shrink-0 border-l border-[#E5DED3] bg-white lg:flex lg:flex-col">
            {/* SUMMARY HEADER */}

            <div className="border-b border-[#ECE7DF] px-8 py-7">
              <p className="text-[11px] font-semibold uppercase tracking-[4px] text-[#C9A96E]">
                Checkout
              </p>

              <h2 className="mt-1 font-serif text-4xl font-semibold text-[#181818]">
                Order Summary
              </h2>

              <p className="mt-2 text-xs text-[#888]">
                Secure checkout powered by Razorpay.
              </p>
            </div>

            {cartItems.length > 0 ? (
              <div className="flex flex-1 flex-col overflow-y-auto">
                {/* PRICE DETAILS */}

                <div className="px-8 py-7">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#777]">
                        Subtotal ({totalQuantity} items)
                      </span>

                      <span className="font-semibold text-[#181818]">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-[#777]">Discount</span>

                      <span className="font-semibold text-[#2F8F46]">-₹0</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-[#777]">Shipping</span>

                      <span className="font-semibold text-[#2F8F46]">
                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-[#777]">GST</span>

                      <span className="font-semibold">
                        ₹{gst.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="my-6 border-t border-[#E8E2D8]" />

                  {/* TOTAL */}

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[2px] text-[#999]">
                        Grand Total
                      </p>

                      <h3 className="mt-1 font-serif text-5xl font-semibold text-[#181818]">
                        ₹{total.toLocaleString("en-IN")}
                      </h3>
                    </div>
                  </div>

                  {/* SAVING */}

                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F2FAF3] px-4 py-3 text-xs font-medium text-[#2F8F46]">
                    <CheckCircle2 size={16} />
                    You are getting the best available price.
                  </div>
                </div>

                {/* CHECKOUT AREA */}

                <div className="mt-auto border-t border-[#E8E2D8] px-8 py-7">
                  {/* PROCEED TO PAY */}

                  <button
                    className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#181818]
                        py-4
                        text-sm
                        font-semibold
                        uppercase
                        tracking-[2px]
                        text-white
                        transition
                        duration-300
                        hover:bg-[#C9A96E]
                      "
                  >
                    <ShieldCheck size={18} />
                    Proceed To Pay
                  </button>

                  {/* RAZORPAY */}

                  <div className="mt-5 rounded-xl border border-[#E8E2D8] bg-[#FCFBF9] p-5">
                    <p className="text-center text-[10px] font-semibold uppercase tracking-[3px] text-[#999]">
                      Pay Securely With
                    </p>

                    <div className="mt-3 flex items-center justify-center">
                      <img
                        src="https://razorpay.com/assets/razorpay-logo.svg"
                        alt="Razorpay"
                        className="h-8"
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#777]">
                      <ShieldCheck size={14} className="text-[#2F8F46]" />
                      100% Secure Payment
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="mt-4 w-full py-2 text-xs font-semibold uppercase tracking-[2px] text-[#666] transition hover:text-[#C9A96E]"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingBag
                  size={40}
                  strokeWidth={1.3}
                  className="text-[#C9A96E]"
                />

                <h3 className="mt-5 font-serif text-3xl font-semibold">
                  Your bag is empty
                </h3>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

export default BagDrawer;
