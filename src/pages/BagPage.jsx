import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

function BagPage() {
  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromBag,
    subtotal,
  } = useCart();

  const shipping = subtotal === 0 ? 0 : 99;

  const gst = Math.round(subtotal * 0.08);

  const total = subtotal + shipping + gst;

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  /* ================= BUY NOW ================= */

  const handleBuyNow = () => {
    if (cartItems.length === 0) {
      return;
    }

    localStorage.setItem("elyvorr_buy_now_items", JSON.stringify(cartItems));

    navigate("/checkout/address");
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-[1450px]">
        {/* ================= HEADER ================= */}

        <div className="mb-8">
          {/* BACK TO SHOPPING */}

          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="mb-7 flex items-center gap-2 text-sm font-medium text-[#666] transition hover:text-[#C9A96E]"
          >
            <ArrowLeft size={18} />

            <span>Back to Shopping</span>
          </button>

          <p className="text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
            Shopping Bag
          </p>

          <h1 className="mt-2 font-serif text-5xl font-semibold text-[#181818] sm:text-6xl">
            Your Bag ({totalItems})
          </h1>

          <p className="mt-3 text-sm text-[#777]">
            Carefully selected luxury fragrances.
          </p>
        </div>

        {/* ================= EMPTY BAG ================= */}

        {cartItems.length === 0 ? (
          <div className="flex min-h-[550px] flex-col items-center justify-center rounded-[28px] border border-[#E7E1D7] bg-white text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#F4EFE5]">
              <ShoppingBag
                size={38}
                strokeWidth={1.4}
                className="text-[#C9A96E]"
              />
            </div>

            <h2 className="mt-7 font-serif text-4xl font-semibold">
              Your bag is empty
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-[#777]">
              Discover our signature fragrances and find the scent that feels
              uniquely yours.
            </p>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="mt-8 rounded-xl bg-[#181818] px-8 py-4 text-xs font-semibold uppercase tracking-[2px] text-white transition hover:bg-[#C9A96E]"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-7 lg:grid-cols-[1fr_420px]">
            {/* ================= LEFT ================= */}

            <section>
              {/* DELIVERY */}

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F5F1E9] px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[1px]">
                    Estimated Delivery
                  </p>

                  <p className="mt-1 text-sm text-[#777]">2–4 Business Days</p>
                </div>

                <span className="rounded-full bg-[#DFF3E3] px-4 py-2 text-xs font-semibold text-[#2F8F46]">
                  Fast Delivery
                </span>
              </div>

              {/* PRODUCTS */}

              <div className="mt-5 overflow-hidden rounded-[24px] border border-[#E7E1D7] bg-white">
                {cartItems.map((product, index) => (
                  <article
                    key={product.id}
                    className={`p-5 sm:p-7 ${
                      index !== cartItems.length - 1
                        ? "border-b border-[#ECE7DF]"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row">
                      {/* IMAGE */}

                      <div className="flex h-[180px] w-full flex-shrink-0 items-center justify-center rounded-2xl bg-[#F7F3EC] sm:h-[180px] sm:w-[160px]">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-contain p-4"
                          />
                        ) : (
                          <div className="h-32 w-16 rounded-2xl bg-[#C9A96E]" />
                        )}
                      </div>

                      {/* DETAILS */}

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h2 className="font-serif text-3xl font-semibold text-[#181818]">
                                {product.name}
                              </h2>

                              <p className="mt-1 text-sm text-[#777]">
                                Eau de Parfum • {product.volume}
                              </p>
                            </div>

                            {/* REMOVE */}

                            <button
                              type="button"
                              onClick={() => removeFromBag(product.id)}
                              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[#999] transition hover:bg-red-50 hover:text-red-500"
                              aria-label={`Remove ${product.name}`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          {/* RATING */}

                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-[#C9A96E]">★★★★★</span>

                            <span className="text-xs text-[#999]">
                              ({product.reviews} Reviews)
                            </span>
                          </div>

                          {/* PRICE */}

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="text-3xl font-bold">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>

                            {product.oldPrice && (
                              <span className="text-sm text-[#999] line-through">
                                ₹{product.oldPrice.toLocaleString("en-IN")}
                              </span>
                            )}

                            {product.oldPrice && (
                              <span className="rounded-full bg-[#EAF8EC] px-3 py-1 text-xs font-semibold text-[#2F8F46]">
                                SAVE ₹
                                {(
                                  product.oldPrice - product.price
                                ).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* BOTTOM */}

                        <div className="mt-6 flex items-center justify-between">
                          {/* QUANTITY */}

                          <div className="flex h-11 items-center overflow-hidden rounded-xl border border-[#DED7CC]">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(product.id)}
                              className="flex h-full w-11 items-center justify-center transition hover:bg-[#F5F1E9]"
                            >
                              <Minus size={16} />
                            </button>

                            <span className="flex h-full w-12 items-center justify-center border-x border-[#DED7CC] text-sm font-semibold">
                              {product.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => increaseQuantity(product.id)}
                              className="flex h-full w-11 items-center justify-center transition hover:bg-[#F5F1E9]"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* ITEM TOTAL */}

                          <span className="text-xl font-semibold">
                            ₹
                            {(product.price * product.quantity).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* BENEFITS */}

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#E7E1D7] bg-white p-5">
                  <p className="font-semibold">✓ 100% Authentic</p>

                  <p className="mt-1 text-xs text-[#888]">
                    Original luxury fragrances
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E7E1D7] bg-white p-5">
                  <p className="font-semibold">↻ Easy Returns</p>

                  <p className="mt-1 text-xs text-[#888]">
                    7 days return policy
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E7E1D7] bg-white p-5">
                  <p className="font-semibold">□ Secure Packaging</p>

                  <p className="mt-1 text-xs text-[#888]">
                    Safe & reliable delivery
                  </p>
                </div>
              </div>
            </section>

            {/* ================= RIGHT SUMMARY ================= */}

            <aside className="h-fit rounded-[24px] border border-[#E7E1D7] bg-white lg:sticky lg:top-8">
              <div className="border-b border-[#ECE7DF] p-7">
                <p className="text-xs font-semibold uppercase tracking-[3px] text-[#C9A96E]">
                  Summary
                </p>

                <h2 className="mt-2 font-serif text-3xl font-semibold">
                  Your Order
                </h2>
              </div>

              <div className="p-7">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#777]">Subtotal</span>

                    <span className="font-semibold">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#777]">Discount</span>

                    <span className="font-semibold text-[#2F8F46]">-₹0</span>
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

                <div className="my-6 border-t border-[#ECE7DF]" />

                <p className="text-xs uppercase tracking-[2px] text-[#999]">
                  Grand Total
                </p>

                <h3 className="mt-1 font-serif text-5xl font-semibold">
                  ₹{total.toLocaleString("en-IN")}
                </h3>

                {/* ================= BUY NOW ================= */}

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="mt-7 flex w-full items-center justify-center rounded-xl bg-[#181818] py-5 text-sm font-semibold uppercase tracking-[2px] text-white transition duration-300 hover:bg-[#C9A96E] active:scale-[0.98]"
                >
                  Buy Now
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-[#999]">
                  You'll review your complete order before payment.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default BagPage;
