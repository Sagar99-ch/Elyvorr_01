import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";

import ProductCard from "../product/ProductCard";
import { useCart } from "../../context/CartContext";

function FeaturedProducts() {
  const { addToBag } = useCart();

  const products = useQuery(api.products.getAll);

  // =====================================================
  // LOADING
  // =====================================================

  if (products === undefined) {
    return (
      <section className="bg-[#FAF8F4] px-4 py-12 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <div className="h-3 w-28 animate-pulse rounded bg-[#E8E1D6]" />

            <div className="mt-4 h-12 w-full max-w-xl animate-pulse rounded bg-[#E8E1D6] sm:h-24" />

            <div className="mt-5 h-12 w-full max-w-xl animate-pulse rounded bg-[#E8E1D6]" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[18px] border border-[#E7E1D7] bg-white"
              >
                <div className="aspect-[0.82] animate-pulse bg-[#F0ECE5] sm:h-[380px]" />

                <div className="space-y-3 p-3 sm:p-6">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-[#E8E1D6]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-[#E8E1D6]" />
                  <div className="h-6 w-1/2 animate-pulse rounded bg-[#E8E1D6]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // FEATURED PRODUCTS
  // =====================================================

  const featuredProducts = products.slice(0, 4);

  return (
    <section
      id="featured-products"
      className="bg-[#FAF8F4] px-4 py-12 sm:px-8 sm:py-20 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[9px] font-semibold uppercase tracking-[3px] text-[#C9A96E] sm:text-xs sm:tracking-[4px]">
              Our Signatures
            </p>

            <h2 className="mt-3 font-serif text-[34px] font-semibold leading-[1.08] text-[#181818] sm:mt-4 sm:text-5xl md:text-6xl">
              Fragrances That
              <span className="block italic font-normal">Tell Your Story</span>
            </h2>

            <p className="mt-4 max-w-xl text-[13px] leading-6 text-[#666] sm:mt-6 sm:text-base sm:leading-8">
              Discover our carefully curated collection of fragrances, created
              to become a part of your most memorable moments.
            </p>
          </div>

          {/* =================================================
              VIEW ALL
          ================================================= */}

          <Link
            to="/collection"
            className="
              group
              flex
              w-fit
              items-center
              gap-2
              border-b
              border-[#181818]
              pb-1.5
              text-[10px]
              font-semibold
              uppercase
              tracking-[1.8px]
              text-[#181818]
              transition
              hover:border-[#C9A96E]
              hover:text-[#C9A96E]
              sm:gap-3
              sm:pb-2
              sm:text-sm
              sm:tracking-[2px]
            "
          >
            View All Collection
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1 sm:h-[17px] sm:w-[17px]"
            />
          </Link>
        </div>

        {/* =================================================
            PRODUCTS

            MOBILE  → 2 columns
            DESKTOP → 4 columns
        ================================================= */}

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-6 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={{
                ...product,
                id: product._id,
                volume: "50ml",
              }}
              onAddToBag={addToBag}
            />
          ))}
        </div>

        {/* =================================================
            BOTTOM CTA
        ================================================= */}

        <div className="mt-8 flex justify-center sm:mt-14">
          <Link
            to="/collection"
            className="
              group
              flex
              w-full
              max-w-[360px]
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-[#181818]
              px-5
              py-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[1.7px]
              text-[#181818]
              transition
              duration-300
              hover:bg-[#181818]
              hover:text-white
              sm:w-auto
              sm:max-w-none
              sm:gap-3
              sm:px-7
              sm:py-3.5
              sm:text-xs
              sm:tracking-[2px]
            "
          >
            Explore All Fragrances
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
