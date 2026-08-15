import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";

import ProductCard from "../product/ProductCard";
import { useCart } from "../../context/CartContext";

function FeaturedProducts() {
  const { addToBag } = useCart();

  // ================= CONVEX PRODUCTS =================

  const products = useQuery(api.products.getAll);

  // ================= LOADING =================

  if (products === undefined) {
    return (
      <section className="bg-[#FAF8F4] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <div className="h-4 w-32 animate-pulse rounded bg-[#E8E1D6]" />

            <div className="mt-5 h-24 w-full max-w-xl animate-pulse rounded bg-[#E8E1D6]" />

            <div className="mt-6 h-16 w-full max-w-xl animate-pulse rounded bg-[#E8E1D6]" />
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[24px] border border-[#E7E1D7] bg-white"
              >
                <div className="h-[380px] animate-pulse bg-[#F0ECE5]" />

                <div className="space-y-4 p-6">
                  <div className="h-7 w-3/4 animate-pulse rounded bg-[#E8E1D6]" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-[#E8E1D6]" />
                  <div className="h-8 w-1/2 animate-pulse rounded bg-[#E8E1D6]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ================= FEATURED PRODUCTS =================

  const featuredProducts = products.slice(0, 4);

  return (
    <section className="bg-[#FAF8F4] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* ================= HEADER ================= */}

        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
              Our Signatures
            </p>

            <h2 className="mt-4 font-serif text-5xl font-semibold leading-tight text-[#181818] md:text-6xl">
              Fragrances That
              <span className="block italic font-normal">Tell Your Story</span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-[#666]">
              Discover our carefully curated collection of fragrances, created
              to become a part of your most memorable moments.
            </p>
          </div>

          {/* ================= VIEW ALL ================= */}

          <Link
            to="/collection"
            className="group flex w-fit items-center gap-3 border-b border-[#181818] pb-2 text-sm font-semibold uppercase tracking-[2px] text-[#181818] transition hover:border-[#C9A96E] hover:text-[#C9A96E]"
          >
            View All Collection
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* ================= PRODUCTS ================= */}

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={{
                ...product,
                id: product._id,
              }}
              onAddToBag={addToBag}
            />
          ))}
        </div>

        {/* ================= BOTTOM CTA ================= */}

        <div className="mt-14 flex justify-center">
          <Link
            to="/collection"
            className="group flex items-center gap-3 rounded-full border border-[#181818] px-7 py-3.5 text-xs font-semibold uppercase tracking-[2px] text-[#181818] transition duration-300 hover:bg-[#181818] hover:text-white"
          >
            Explore All Fragrances
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
