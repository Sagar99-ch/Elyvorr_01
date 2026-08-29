import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import { useCart } from "../context/CartContext";

function BagPage() {
  const navigate = useNavigate();

  // =====================================================
  // CART
  // =====================================================

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromBag,
    subtotal,
  } = useCart();

  // =====================================================
  // PRODUCTS
  //
  // We fetch products directly so oldPrice is always
  // available for live discount calculation.
  // =====================================================

  const products = useQuery(api.products.getAll, {
    includeInactive: true,
  });

  // =====================================================
  // ENRICH CART
  //
  // Cart item -> Product
  // Product gives us oldPrice.
  // =====================================================

  const enrichedCartItems = useMemo(() => {
    if (!cartItems || !products) {
      return [];
    }

    return cartItems.map((item) => {
      const product = products.find(
        (p) => p._id === item.productId || p._id === item.id
      );

      return {
        ...item,

        oldPrice: item.oldPrice ?? product?.oldPrice ?? 0,

        name: item.name ?? product?.name ?? "Product",

        volume: item.volume ?? product?.volume ?? "",

        image: item.image ?? product?.image ?? "",

        reviews: item.reviews ?? product?.reviews ?? 0,
      };
    });
  }, [cartItems, products]);

  // =====================================================
  // DISCOUNT
  //
  // Example:
  //
  // Old Price = ₹399
  // Selling   = ₹299
  // Discount  = ₹100
  //
  // Quantity 2
  // Discount  = ₹200
  // =====================================================

  const discount = useMemo(() => {
    return enrichedCartItems.reduce((total, item) => {
      const oldPrice = Number(item.oldPrice || 0);
      const currentPrice = Number(item.price || 0);
      const quantity = Number(item.quantity || 0);

      if (oldPrice > currentPrice) {
        return total + (oldPrice - currentPrice) * quantity;
      }

      return total;
    }, 0);
  }, [enrichedCartItems]);

  // =====================================================
  // SHIPPING
  //
  // FIXED ₹1 SHIPPING
  // =====================================================

  const shipping = subtotal > 0 ? 1 : 0;

  // =====================================================
  // GST
  //
  // GST REMOVED
  // =====================================================

  const gst = 0;

  // =====================================================
  // GRAND TOTAL
  //
  // subtotal - discount + shipping
  // =====================================================

  const total = Math.max(0, subtotal - discount + shipping);

  // =====================================================
  // TOTAL ITEMS
  // =====================================================

  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  // =====================================================
  // BUY NOW
  // =====================================================

  const handleBuyNow = () => {
    if (cartItems.length === 0) {
      return;
    }

    localStorage.setItem("elyvorr_buy_now_items", JSON.stringify(cartItems));

    navigate("/checkout/address");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (products === undefined) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] px-4 py-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="h-10 w-48 animate-pulse rounded bg-[#EEE8DE]" />

          <div className="mt-8 h-[500px] animate-pulse rounded-[24px] bg-[#EEE8DE]" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-[1450px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/collection")}
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

        {/* =================================================
            EMPTY BAG
        ================================================= */}

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
              onClick={() => navigate("/collection")}
              className="mt-8 rounded-xl bg-[#181818] px-8 py-4 text-xs font-semibold uppercase tracking-[2px] text-white transition hover:bg-[#C9A96E]"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-7 lg:grid-cols-[1fr_420px]">
            {/* =================================================
                LEFT
            ================================================= */}

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
                {enrichedCartItems.map((product, index) => (
                  <article
                    key={product.id}
                    className={`p-5 sm:p-7 ${
                      index !== enrichedCartItems.length - 1
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
                              ₹
                              {Number(product.price || 0).toLocaleString(
                                "en-IN"
                              )}
                            </span>

                            {Number(product.oldPrice || 0) >
                              Number(product.price || 0) && (
                              <span className="text-sm text-[#999] line-through">
                                ₹
                                {Number(product.oldPrice).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            )}

                            {Number(product.oldPrice || 0) >
                              Number(product.price || 0) && (
                              <span className="rounded-full bg-[#EAF8EC] px-3 py-1 text-xs font-semibold text-[#2F8F46]">
                                SAVE ₹
                                {(
                                  Number(product.oldPrice) -
                                  Number(product.price)
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
                            {(
                              Number(product.price || 0) *
                              Number(product.quantity || 0)
                            ).toLocaleString("en-IN")}
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
                  <p className="font-semibold">Fast Delivery</p>

                  <p className="mt-1 text-xs text-[#888]">2 - 4 days</p>
                </div>

                <div className="rounded-2xl border border-[#E7E1D7] bg-white p-5">
                  <p className="font-semibold">□ Secure Packaging</p>

                  <p className="mt-1 text-xs text-[#888]">
                    Safe & reliable delivery
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                RIGHT SUMMARY
            ================================================= */}

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
                <div className="space-y-5 text-base">
                  {/* SUBTOTAL */}

                  <div className="flex justify-between">
                    <span className="text-[#777]">Subtotal</span>

                    <span className="font-semibold">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* DISCOUNT */}

                  <div className="flex justify-between">
                    <span className="text-[#777]">Discount</span>

                    <span className="font-semibold text-[#2F8F46]">
                      -₹
                      {discount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* SHIPPING */}

                  <div className="flex justify-between">
                    <span className="text-[#777]">Shipping</span>

                    <span className="font-semibold">₹{shipping}</span>
                  </div>
                </div>

                {/* DIVIDER */}

                <div className="my-7 border-t border-[#ECE7DF]" />

                {/* GRAND TOTAL */}

                <p className="text-xs uppercase tracking-[3px] text-[#999]">
                  Grand Total
                </p>

                <h3 className="mt-1 font-serif text-5xl font-semibold">
                  ₹{total.toLocaleString("en-IN")}
                </h3>

                {/* BUY NOW */}

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
