import { Heart, ShoppingBag, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProductCard({ product, onAddToBag }) {
  const navigate = useNavigate();

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : 0;

  // =====================================================
  // PRODUCT DETAILS
  // =====================================================

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  // =====================================================
  // ADD TO BAG
  // =====================================================

  const handleAddToBag = (event) => {
    event.stopPropagation();

    onAddToBag?.({
      ...product,
      volume: "50ml",
    });
  };

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-[18px]
        border
        border-[#E7E1D7]
        bg-white
        transition
        duration-500
        hover:-translate-y-1
        hover:shadow-[0_20px_50px_rgba(30,25,20,0.08)]
        sm:rounded-[24px]
      "
    >
      {/* =================================================
          IMAGE
      ================================================= */}

      <button
        type="button"
        onClick={handleProductClick}
        className="
          relative
          block
          aspect-[0.86]
          w-full
          overflow-hidden
          bg-[#F8F5F0]
          text-left
          outline-none
          sm:h-[380px]
          sm:aspect-auto
        "
        aria-label={`View ${product.name} details`}
      >
        {/* BADGE */}

        {product.badge && (
          <span
            className="
              absolute
              left-2.5
              top-2.5
              z-10
              rounded-full
              bg-[#181818]
              px-2.5
              py-1.5
              text-[7px]
              font-semibold
              uppercase
              tracking-[1px]
              text-white
              sm:left-5
              sm:top-5
              sm:px-4
              sm:py-2
              sm:text-[10px]
              sm:tracking-[2px]
            "
          >
            {product.badge}
          </span>
        )}

        {/* WISHLIST */}

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
            right-2.5
            top-2.5
            z-20
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-white
            text-[#555]
            shadow-sm
            sm:right-5
            sm:top-5
            sm:h-11
            sm:w-11
            hover:bg-[#181818]
            hover:text-white
          "
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart size={15} className="sm:h-[18px] sm:w-[18px]" />
        </span>

        {/* PRODUCT IMAGE */}

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="
              h-full
              w-full
              object-contain
              p-4
              transition-transform
              duration-700
              group-hover:scale-105
              sm:h-[290px]
              sm:w-auto
              sm:p-0
              sm:object-contain
            "
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="h-32 w-16 rounded-2xl bg-[#C9A96E] shadow-lg sm:h-56 sm:w-28" />

            <span className="mt-3 text-[7px] font-semibold tracking-[2px] text-[#555] sm:mt-5 sm:text-[11px] sm:tracking-[4px]">
              ELYVORR
            </span>
          </div>
        )}

        {/* =================================================
            DESKTOP VIEW DETAILS
        ================================================= */}

        <div
          className="
            absolute
            bottom-5
            left-5
            right-5
            hidden
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
            sm:flex
          "
        >
          View Details
          <ChevronRight size={18} />
        </div>
      </button>

      {/* =================================================
          PRODUCT INFO
      ================================================= */}

      <div className="p-3 sm:p-6">
        {/* NAME */}

        <button
          type="button"
          onClick={handleProductClick}
          className="
            block
            w-full
            text-left
            outline-none
          "
        >
          <h3
            className="
              truncate
              font-serif
              text-[17px]
              font-semibold
              text-[#181818]
              sm:text-[28px]
            "
          >
            {product.name}
          </h3>
        </button>

        {/* VOLUME */}

        <p className="mt-1 text-[9px] text-[#777] sm:text-sm">
          Eau de Parfum • 50ml
        </p>

        {/* RATING */}

        <div className="mt-2.5 flex items-center gap-1.5 sm:mt-4 sm:gap-2">
          <div className="flex gap-[1px] text-[11px] text-[#C9A96E] sm:text-base">
            ★★★★★
          </div>

          <span className="text-[8px] text-[#888] sm:text-xs">
            ({product.reviews || 0})
          </span>
        </div>

        {/* PRICE */}

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:mt-5 sm:items-end sm:gap-3">
          <span className="text-[18px] font-bold text-[#181818] sm:text-[27px]">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          {product.oldPrice && (
            <span className="text-[9px] text-[#999] line-through sm:mb-1 sm:text-sm">
              ₹{product.oldPrice.toLocaleString("en-IN")}
            </span>
          )}

          {discount > 0 && (
            <span className="rounded-full bg-[#EAF8EC] px-1.5 py-1 text-[7px] font-semibold text-[#2F8F46] sm:mb-1 sm:px-2 sm:text-[10px]">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* =================================================
            MOBILE ADD TO BAG
        ================================================= */}

        <button
          type="button"
          onClick={handleAddToBag}
          className="
            mt-3
            flex
            h-9
            w-full
            items-center
            justify-center
            gap-1.5
            rounded-lg
            bg-[#181818]
            text-[8px]
            font-semibold
            uppercase
            tracking-[1px]
            text-white
            transition
            hover:bg-[#C9A96E]
            sm:mt-5
            sm:hidden
          "
        >
          <ShoppingBag size={13} />
          Add to Bag
        </button>

        {/* =================================================
            DESKTOP CTA
        ================================================= */}

        <button
          type="button"
          onClick={handleProductClick}
          className="
            mt-5
            hidden
            items-center
            gap-2
            text-[10px]
            font-semibold
            uppercase
            tracking-[1.8px]
            text-[#999]
            transition
            hover:text-[#C9A96E]
            sm:flex
          "
        >
          Explore fragrance
          <ChevronRight size={14} />
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
