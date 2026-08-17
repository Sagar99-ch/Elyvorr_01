import { Heart, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : 0;

  // =====================================================
  // OPEN PRODUCT DETAILS
  // =====================================================

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-[24px]
        border
        border-[#E7E1D7]
        bg-white
        transition
        duration-500
        hover:-translate-y-1
        hover:shadow-[0_20px_50px_rgba(30,25,20,0.08)]
      "
    >
      {/* =================================================
          PRODUCT IMAGE
      ================================================= */}

      <button
        type="button"
        onClick={handleProductClick}
        className="
          relative
          block
          h-[380px]
          w-full
          overflow-hidden
          bg-[#F8F5F0]
          text-left
          outline-none
        "
        aria-label={`View ${product.name} details`}
      >
        {/* Badge */}

        {product.badge && (
          <span className="absolute left-5 top-5 z-10 rounded-full bg-[#181818] px-4 py-2 text-[10px] font-semibold uppercase tracking-[2px] text-white">
            {product.badge}
          </span>
        )}

        {/* Wishlist */}

        <span
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          className="
            absolute
            right-5
            top-5
            z-20
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-white
            text-[#555]
            shadow-sm
            transition
            hover:bg-[#181818]
            hover:text-white
          "
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart size={18} />
        </span>

        {/* Product Image */}

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="
              h-[290px]
              w-auto
              object-contain
              transition-transform
              duration-700
              group-hover:scale-105
            "
          />
        ) : (
          <div className="flex flex-col items-center">
            <div className="h-56 w-28 rounded-2xl bg-[#C9A96E] shadow-lg" />

            <span className="mt-5 text-[11px] font-semibold tracking-[4px] text-[#555]">
              ELYVORR
            </span>
          </div>
        )}

        {/* =================================================
            VIEW DETAILS OVERLAY
        ================================================= */}

        <div
          className="
            absolute
            bottom-5
            left-5
            right-5
            flex
            h-14
            translate-y-4
            items-center
            justify-center
            gap-3
            rounded-2xl
            bg-[#181818]
            text-sm
            font-semibold
            uppercase
            tracking-[2px]
            text-white
            opacity-0
            shadow-lg
            transition-all
            duration-500
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >
          View Details
          <ChevronRight size={18} />
        </div>
      </button>

      {/* =================================================
          PRODUCT DETAILS
      ================================================= */}

      <button
        type="button"
        onClick={handleProductClick}
        className="
          block
          w-full
          p-6
          text-left
          outline-none
        "
      >
        <h3 className="font-serif text-[28px] font-semibold text-[#181818]">
          {product.name}
        </h3>

        <p className="mt-1 text-sm text-[#777]">
          Eau de Parfum • {product.volume || "50ml"}
        </p>

        {/* Rating */}

        <div className="mt-4 flex items-center gap-2">
          <div className="flex gap-0.5 text-[#C9A96E]">★★★★★</div>

          <span className="text-xs text-[#888]">({product.reviews || 0})</span>
        </div>

        {/* Price */}

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <span className="text-[27px] font-bold text-[#181818]">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          {product.oldPrice && (
            <span className="mb-1 text-sm text-[#999] line-through">
              ₹{product.oldPrice.toLocaleString("en-IN")}
            </span>
          )}

          {discount > 0 && (
            <span className="mb-1 rounded-full bg-[#EAF8EC] px-2 py-1 text-[10px] font-semibold text-[#2F8F46]">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Small Details CTA */}

        <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[1.8px] text-[#999] transition group-hover:text-[#C9A96E]">
          Explore fragrance
          <ChevronRight size={14} />
        </div>
      </button>
    </article>
  );
}

export default ProductCard;
  