import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  Leaf,
  Lock,
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Zap,
} from "lucide-react";

import { useMutation, useQuery } from "convex/react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../../convex/_generated/api";
import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";

// =====================================================
// PRODUCT DETAILS PAGE
// =====================================================

function ProductDetailsPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  // Always open product details from the top.
  // Prevents the previous Collection scroll position from being restored.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [id]);

  // ===================================================
  // CART CONTEXT
  // Single source of truth for the browser session/cart
  // ===================================================

  const { addToBag } = useCart();

  // ===================================================
  // PRODUCT
  // ===================================================

  const product = useQuery(api.products.getById, id ? { id } : "skip");

  // ===================================================
  // STATE
  // ===================================================

  const [activeImage, setActiveImage] = useState(0);

  const [adding, setAdding] = useState(false);

  const [buying, setBuying] = useState(false);

  const [liked, setLiked] = useState(false);

  const [message, setMessage] = useState("");

  // ===================================================
  // LOADING
  // ===================================================

  if (product === undefined) {
    return (
      <Layout>
        <main className="min-h-screen bg-[#FAF8F4]">
          <div className="mx-auto max-w-[1450px] px-5 py-12 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="h-[650px] animate-pulse rounded-[28px] bg-[#EEE8DE]" />

              <div className="space-y-6 py-8">
                <div className="h-8 w-32 animate-pulse rounded-full bg-[#EEE8DE]" />

                <div className="h-16 w-3/4 animate-pulse rounded-xl bg-[#EEE8DE]" />

                <div className="h-5 w-1/3 animate-pulse rounded bg-[#EEE8DE]" />

                <div className="h-10 w-1/2 animate-pulse rounded bg-[#EEE8DE]" />

                <div className="h-32 w-full animate-pulse rounded-2xl bg-[#EEE8DE]" />

                <div className="h-14 w-full animate-pulse rounded-xl bg-[#EEE8DE]" />
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  // ===================================================
  // PRODUCT NOT FOUND
  // ===================================================

  if (!product || !product.isActive) {
    return (
      <Layout>
        <main className="flex min-h-[70vh] items-center justify-center bg-[#FAF8F4] px-5">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[4px] text-[#C9A96E]">
              ELYVORR
            </p>

            <h1 className="mt-3 font-serif text-4xl font-semibold">
              Product Not Found
            </h1>

            <p className="mt-3 text-sm text-[#777]">
              This fragrance is currently unavailable.
            </p>

            <button
              type="button"
              onClick={() => navigate("/collection")}
              className="mt-7 rounded-xl bg-[#181818] px-7 py-4 text-xs font-semibold uppercase tracking-[2px] text-white transition hover:bg-[#C9A96E]"
            >
              Back To Collection
            </button>
          </div>
        </main>
      </Layout>
    );
  }

  // ===================================================
  // GALLERY
  // ===================================================

  /*
    Current products table has one `image` field.

    If later we add an `images` array to Convex,
    this automatically supports it.

    For now we use the main image.
  */

  const galleryImages = [product.image, ...(product.images || [])].filter(
    Boolean
  );
  // ===================================================
  // PRICE
  // ===================================================

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : 0;

  // ===================================================
  // ADD TO BAG
  // ===================================================

  const handleAddToBag = async () => {
    if (adding || product.stock <= 0) {
      return;
    }

    setAdding(true);
    setMessage("");

    try {
      await addToBag({
        id: product._id,
      });

      setMessage("Added to your bag successfully.");
    } catch (error) {
      console.error("Add to bag error:", error);

      setMessage(error?.message || "Unable to add product to bag.");
    } finally {
      setAdding(false);
    }
  };

  // ===================================================
  // BUY NOW
  // ===================================================

  const handleBuyNow = async () => {
    if (buying || product.stock <= 0) {
      return;
    }

    setBuying(true);
    setMessage("");

    try {
      await addToBag({
        id: product._id,
      });

      navigate("/checkout/address");
    } catch (error) {
      console.error("Buy now error:", error);

      setMessage(error?.message || "Unable to proceed.");

      setBuying(false);
    }
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <Layout>
      <main className="min-h-screen bg-[#FAF8F4] text-[#181818]">
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="border-b border-[#E7E1D7] bg-white">
          <div className="mx-auto flex max-w-[1450px] items-center gap-2 px-5 py-5 text-xs text-[#777] sm:px-8 lg:px-12">
            <button
              type="button"
              onClick={() => navigate("/collection")}
              className="transition hover:text-[#C9A96E]"
            >
              Collection
            </button>

            <ChevronRight size={14} />

            <span className="text-[#181818]">{product.name}</span>
          </div>
        </div>

        {/* =================================================
            PRODUCT
        ================================================= */}

        <section className="mx-auto max-w-[1450px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <button
            type="button"
            onClick={() => navigate("/collection")}
            className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#666] transition hover:text-[#C9A96E]"
          >
            <ArrowLeft size={16} />
            Back to Collection
          </button>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)]">
            {/* =================================================
                LEFT — GALLERY
            ================================================= */}

            <section>
              <div
                className="
                  grid
                  gap-4
                  sm:grid-cols-[90px_minmax(0,1fr)]
                  sm:gap-5
                "
              >
                {/* THUMBNAILS */}

                <div
                  className="
                    order-2
                    grid
                    grid-cols-3
                    gap-3
                    sm:order-1
                    sm:flex
                    sm:flex-col
                    sm:gap-4
                  "
                >
                  {galleryImages.slice(0, 3).map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-[#F4EFE7] transition ${
                        activeImage === index
                          ? "border-[#C9A96E]"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="h-full w-full object-contain p-4 sm:p-5 lg:p-6"
                      />
                    </button>
                  ))}
                </div>

                {/* MAIN IMAGE */}

                <div className="relative order-1 mx-auto w-full max-w-[520px] overflow-hidden rounded-[28px] border border-[#E5DED3] bg-[#F2EDE4] sm:order-2">
                  <div className="aspect-[4/5] max-h-[560px] w-full">
                    <img
                      src={galleryImages[activeImage] || product.image}
                      alt={product.name}
                      className="h-full w-full object-contain p-6 sm:p-8 lg:p-10"
                    />
                  </div>

                  {/* BADGE */}

                  {product.badge && (
                    <div className="absolute left-5 top-5 rounded-full bg-[#181818] px-5 py-3 text-[10px] font-bold uppercase tracking-[2px] text-white">
                      {product.badge}
                    </div>
                  )}

                  {/* HEART */}

                  <button
                    type="button"
                    onClick={() => setLiked((current) => !current)}
                    className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_25px_rgba(0,0,0,0.10)] transition hover:scale-105"
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      size={22}
                      className={
                        liked ? "fill-[#C9A96E] text-[#C9A96E]" : "text-[#555]"
                      }
                    />
                  </button>

                  {/* IMAGE ARROWS */}

                  {galleryImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImage((current) =>
                            current === 0
                              ? galleryImages.length - 1
                              : current - 1
                          )
                        }
                        className="absolute bottom-5 left-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-lg transition hover:bg-white"
                      >
                        <ChevronLeft size={19} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveImage((current) =>
                            current === galleryImages.length - 1
                              ? 0
                              : current + 1
                          )
                        }
                        className="absolute bottom-5 left-[70px] flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-lg transition hover:bg-white"
                      >
                        <ChevronRight size={19} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* =================================================
                RIGHT — PRODUCT INFO
            ================================================= */}

            <section className="lg:pt-2">
              {/* BADGE */}

              {product.badge && (
                <span className="inline-flex rounded-full bg-[#181818] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[2px] text-white">
                  {product.badge}
                </span>
              )}

              {/* TITLE */}

              <h1 className="mt-5 font-serif text-[46px] font-semibold leading-[1.05] tracking-[-1px] sm:text-[58px]">
                {product.name}
              </h1>

              {/* VOLUME */}

              <p className="mt-3 text-base text-[#777]">
                Eau de Parfum <span className="mx-2 text-[#C9A96E]">•</span>
                {product.volume || "50ml"}
              </p>

              {/* REVIEWS */}

              <div className="mt-5 flex items-center gap-3">
                <div className="flex items-center gap-1 text-[#C9A96E]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={17} className="fill-[#C9A96E]" />
                  ))}
                </div>

                <span className="text-sm font-semibold">4.8</span>

                <span className="text-sm text-[#888]">
                  ({product.reviews || 0} reviews)
                </span>
              </div>

              {/* PRICE */}

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <span className="text-[38px] font-semibold tracking-[-1px]">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>

                {product.oldPrice && (
                  <span className="text-lg text-[#999] line-through">
                    ₹{product.oldPrice.toLocaleString("en-IN")}
                  </span>
                )}

                {discount > 0 && (
                  <span className="rounded-lg bg-[#F6EEDC] px-3 py-2 text-xs font-bold text-[#A27B3C]">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* DESCRIPTION */}

              <p className="mt-6 max-w-xl text-[15px] leading-7 text-[#666]">
                A sophisticated fragrance designed to leave a lasting
                impression. Elegant, distinctive and suitable for everyday wear
                as well as special occasions.
              </p>

              {/* =================================================
                  FEATURES
              ================================================= */}

              <div className="mt-7 grid grid-cols-3 gap-3 border-y border-[#E8E1D7] py-6">
                <Feature
                  icon={<Clock3 size={21} />}
                  title="Long Lasting"
                  text="8–10 Hours"
                />

                <Feature
                  icon={<Sparkles size={21} />}
                  title="Premium"
                  text="Quality"
                />

                <Feature
                  icon={<Leaf size={21} />}
                  title="Refreshing"
                  text="Unique Scent"
                />
              </div>

              {/* =================================================
                  SIZE — ONLY 50ML
              ================================================= */}

              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Size</h3>

                  <span className="text-xs text-[#888]">Available</span>
                </div>

                <div className="mt-4">
                  <div className="flex h-12 w-28 items-center justify-center rounded-xl border-2 border-[#181818] bg-[#181818] text-sm font-semibold text-white">
                    50ml
                  </div>
                </div>
              </div>

              {/* =================================================
                  STOCK
              ================================================= */}

              <div className="mt-6 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    product.stock > 0 ? "bg-[#3AA55D]" : "bg-red-500"
                  }`}
                />

                <span
                  className={`text-sm font-medium ${
                    product.stock > 0 ? "text-[#2F8F46]" : "text-red-500"
                  }`}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* =================================================
                  MESSAGE
              ================================================= */}

              {message && (
                <div className="mt-5 rounded-xl border border-[#DDE9DD] bg-[#F2F9F2] px-4 py-3 text-sm text-[#2F8F46]">
                  {message}
                </div>
              )}

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={product.stock <= 0 || adding}
                  onClick={handleAddToBag}
                  className={`flex h-[58px] items-center justify-center gap-3 rounded-xl text-sm font-semibold uppercase tracking-[1.5px] text-white transition ${
                    product.stock > 0
                      ? "bg-[#181818] hover:bg-[#C9A96E]"
                      : "cursor-not-allowed bg-[#BDB9B2]"
                  }`}
                >
                  <ShoppingBag size={19} />

                  {adding ? "Adding..." : "Add To Bag"}
                </button>

                <button
                  type="button"
                  disabled={product.stock <= 0 || buying}
                  onClick={handleBuyNow}
                  className={`flex h-[58px] items-center justify-center gap-3 rounded-xl text-sm font-semibold uppercase tracking-[1.5px] text-white transition ${
                    product.stock > 0
                      ? "bg-[#C9A96E] hover:bg-[#B99155]"
                      : "cursor-not-allowed bg-[#BDB9B2]"
                  }`}
                >
                  <Zap size={19} />

                  {buying ? "Processing..." : "Buy Now"}
                </button>
              </div>

              {/* =================================================
                  TRUST FEATURES
              ================================================= */}

              <div className="mt-7 grid grid-cols-2 gap-y-5 border-t border-[#E8E1D7] pt-7 sm:grid-cols-4">
                <Trust
                  icon={<ShieldCheck size={20} />}
                  title="Secure"
                  text="Payment"
                />

                <Trust
                  icon={<Truck size={20} />}
                  title="Fast"
                  text="Delivery"
                />

                <Trust
                  icon={<RotateCcw size={20} />}
                  title="2 - 7 Days"
                  text="Dlievery"
                />

                <Trust
                  icon={<PackageCheck size={20} />}
                  title="100%"
                  text="Original"
                />
              </div>

              {/* =================================================
                  SECURITY
              ================================================= */}

              <div className="mt-7 flex items-center gap-3 rounded-2xl bg-[#F5F1E9] p-5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
                  <Lock size={18} className="text-[#C9A96E]" />
                </div>

                <div>
                  <p className="text-xs font-semibold">Secure Checkout</p>

                  <p className="mt-1 text-[11px] text-[#888]">
                    Your payment is securely processed by Razorpay.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </Layout>
  );
}

// =====================================================
// FEATURE
// =====================================================

function Feature({ icon, title, text }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#E2DBD0] bg-white text-[#C9A96E]">
        {icon}
      </div>

      <p className="mt-3 text-[11px] font-semibold">{title}</p>

      <p className="mt-1 text-[10px] text-[#888]">{text}</p>
    </div>
  );
}

// =====================================================
// NOTE
// =====================================================

function Note({ title, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#999]">
        {title}
      </p>

      <p className="mt-2 text-xs font-medium leading-5 text-[#555]">{value}</p>
    </div>
  );
}

// =====================================================
// TRUST
// =====================================================

function Trust({ icon, title, text }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F5F1E9] text-[#C9A96E]">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-semibold">{title}</p>

        <p className="text-[10px] text-[#888]">{text}</p>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
