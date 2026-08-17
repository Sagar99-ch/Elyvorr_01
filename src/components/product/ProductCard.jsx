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
    navigate(`/product/${product.id || product._id}`);
  };

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-[20px]
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
          PRODUCT IMAGE
      ================================================= */}

      <button
        type="button"
        onClick={handleProductClick}
        className="
          relative
          block
          h-[220px]
          w-full
          overflow-hidden
          bg-[#F8F5F0]
          text-left
          outline-none

          sm:h-[280px]

          lg:h-[380px]
        "
        aria-label={`View ${product.name} details`}
      >
        {/* BADGE */}

        {product.badge && (
          <span
            className="
              absolute
              left-3
              top-3
              z-10
              rounded-full
              bg-[#181818]
              px-3
              py-1.5
              text-[8px]
              font-semibold
              uppercase
              tracking-[1.5px]
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
            right-3
            top-3
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-white
            text-[#555]
            shadow-sm
            transition

            sm:right-5
            sm:top-5
            sm:h-11
            sm:w-11

            hover:bg-[#181818]
            hover:text-white
          "
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart size={18} />
        </span>

        {/* =================================================
            PRODUCT IMAGE
        ================================================= */}

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              group-hover:scale-[1.03]

              lg:object-contain
            "
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div
              className="
                h-40
                w-20
                rounded-2xl
                bg-[#C9A96E]
                shadow-lg

                sm:h-56
                sm:w-28
              "
            />

            <span className="mt-4 text-[10px] font-semibold tracking-[3px] text-[#555] sm:mt-5 sm:text-[11px] sm:tracking-[4px]">
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

            lg:flex
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >
          View Details
          <ChevronRight size={18} />
        </div>
      </button>

      {/* =================================================
          PRODUCT INFORMATION
      ================================================= */}

      <button
        type="button"
        onClick={handleProductClick}
        className="
          block
          w-full
          p-4
          text-left
          outline-none

          sm:p-5

          lg:p-6
        "
      >
        {/* NAME */}

        <h3
          className="
            font-serif
            text-[20px]
            font-semibold
            leading-tight
            text-[#181818]

            sm:text-[24px]

            lg:text-[28px]
          "
        >
          {product.name}
        </h3>

        {/* VOLUME */}

        <p
          className="
            mt-2
            text-[11px]
            font-medium
            text-[#777]

            sm:text-sm
          "
        >
          Eau de Parfum • {product.volume || "50ml"}
        </p>

        {/* RATING */}

        <div className="mt-3 flex items-center gap-2 sm:mt-4">
          <div className="flex gap-0.5 text-sm text-[#C9A96E] sm:text-base">
            ★★★★★
          </div>

          <span className="text-[10px] font-medium text-[#888] sm:text-xs">
            ({product.reviews || 0})
          </span>
        </div>

        {/* PRICE */}

        <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3">
          <span className="text-[22px] font-bold text-[#181818] sm:text-[25px] lg:text-[27px]">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          {product.oldPrice && (
            <span className="text-xs text-[#999] line-through sm:text-sm">
              ₹{product.oldPrice.toLocaleString("en-IN")}
            </span>
          )}

          {discount > 0 && (
            <span
              className="
                rounded-full
                bg-[#EAF8EC]
                px-2
                py-1
                text-[9px]
                font-semibold
                text-[#2F8F46]

                sm:text-[10px]
              "
            >
              {discount}% OFF
            </span>
          )}
        </div>

        {/* =================================================
            EXPLORE FRAGRANCE
        ================================================= */}

        <div
          className="
            mt-4
            flex
            items-center
            gap-1
            text-[9px]
            font-semibold
            uppercase
            tracking-[1.5px]
            text-[#999]
            transition

            sm:mt-5
            sm:gap-2
            sm:text-[10px]
            sm:tracking-[1.8px]

            group-hover:text-[#C9A96E]
          "
        >
          Explore fragrance
          <ChevronRight size={13} />
        </div>
      </button>
    </article>
  );
}

export default ProductCard;
