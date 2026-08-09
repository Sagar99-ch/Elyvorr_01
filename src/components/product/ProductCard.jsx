import { Heart, ShoppingBag } from "lucide-react";

function ProductCard({ product, onAddToBag }) {
  const discount = Math.round(
    ((product.oldPrice - product.price) / product.oldPrice) * 100
  );

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-[#ECE7DF] bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)]">
      {/* Product Image */}

      <div className="relative flex h-[380px] items-center justify-center overflow-hidden bg-[#F8F5F0]">
        {/* Badge */}

        {product.badge && (
          <span className="absolute left-5 top-5 z-10 rounded-full bg-[#181818] px-4 py-2 text-[10px] font-semibold uppercase tracking-[2px] text-white">
            {product.badge}
          </span>
        )}

        {/* Wishlist */}

        <button
          className="
            absolute
            right-5
            top-5
            z-10
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
        </button>

        {/* Image */}

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

        {/* Quick Add */}

        <button
          onClick={() => onAddToBag?.(product)}
          className="
            absolute
            bottom-5
            left-5
            right-5
            flex
            h-14
            translate-y-20
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
            transition-all
            duration-500
            group-hover:translate-y-0
            group-hover:opacity-100
            hover:bg-[#C9A96E]
          "
        >
          <ShoppingBag size={18} />
          Add to Bag
        </button>
      </div>

      {/* Product Details */}

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-[28px] font-semibold text-[#181818]">
              {product.name}
            </h3>

            <p className="mt-1 text-sm text-[#777]">
              Eau de Parfum • {product.volume}
            </p>
          </div>
        </div>

        {/* Rating */}

        <div className="mt-4 flex items-center gap-2">
          <div className="flex gap-0.5 text-[#C9A96E]">★★★★★</div>

          <span className="text-xs text-[#888]">({product.reviews})</span>
        </div>

        {/* Price */}

        <div className="mt-5 flex items-end gap-3">
          <span className="text-[27px] font-bold text-[#181818]">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          <span className="mb-1 text-sm text-[#999] line-through">
            ₹{product.oldPrice.toLocaleString("en-IN")}
          </span>

          <span className="mb-1 rounded-full bg-[#EAF8EC] px-2 py-1 text-[10px] font-semibold text-[#2F8F46]">
            {discount}% OFF
          </span>
        </div>

        {/* Mobile Add Button */}

        <button
          onClick={() => onAddToBag?.(product)}
          className="
            mt-6
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#181818]
            text-xs
            font-semibold
            uppercase
            tracking-[2px]
            text-white
            transition
            hover:bg-[#C9A96E]
            lg:hidden
          "
        >
          <ShoppingBag size={16} />
          Add to Bag
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
