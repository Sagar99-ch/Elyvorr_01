import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";

import ProductCard from "../components/product/ProductCard";
import { useCart } from "../context/CartContext";

function CollectionPage() {
  const { addToBag } = useCart();

  // ================= CONVEX PRODUCTS =================

  const products = useQuery(api.products.getAll);

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const filters = ["ALL", "BESTSELLER", "NEW", "POPULAR"];

  // ================= LOADING =================

  if (products === undefined) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="h-4 w-40 animate-pulse rounded bg-[#E8E1D6]" />

          <div className="mt-6 h-20 w-full max-w-3xl animate-pulse rounded bg-[#E8E1D6]" />

          <div className="mt-6 h-5 w-full max-w-2xl animate-pulse rounded bg-[#E8E1D6]" />

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      </main>
    );
  }

  // ================= FILTER + SEARCH + SORT =================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter
    if (activeFilter !== "ALL") {
      result = result.filter(
        (product) => product.badge?.toUpperCase() === activeFilter
      );
    }

    // Search
    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((product) =>
        `${product.name} ${product.volume}`.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, activeFilter, search, sortBy]);

  // ================= CLEAR FILTERS =================

  const clearFilters = () => {
    setActiveFilter("ALL");
    setSearch("");
    setSortBy("featured");
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] text-[#181818]">
      {/* ================= HERO ================= */}

      <section className="border-b border-[#E7E1D7] px-5 pb-16 pt-16 sm:px-8 lg:px-12 lg:pb-20 lg:pt-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
            ELYVORR COLLECTION
          </p>

          <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h1 className="font-serif text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
                Find the fragrance
                <span className="block italic font-normal">
                  that feels like you.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[#777]">
                Explore our carefully selected collection of signature
                fragrances, created for different personalities, moods and
                moments.
              </p>
            </div>

            <p className="text-sm text-[#777]">{products.length} fragrances</p>
          </div>
        </div>
      </section>

      {/* ================= COLLECTION CONTENT ================= */}

      <section className="px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          {/* ================= TOOLBAR ================= */}

          <div className="flex flex-col gap-5 border-b border-[#E7E1D7] pb-7 lg:flex-row lg:items-center lg:justify-between">
            {/* FILTERS */}

            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal size={17} className="mr-2 text-[#999]" />

              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[1.5px] transition ${
                    activeFilter === filter
                      ? "bg-[#181818] text-white"
                      : "border border-[#DED7CC] bg-white text-[#666] hover:border-[#C9A96E] hover:text-[#C9A96E]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* SEARCH + SORT */}

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* SEARCH */}

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search fragrance..."
                  className="h-11 w-full rounded-full border border-[#DED7CC] bg-white pl-11 pr-10 text-sm outline-none transition focus:border-[#C9A96E] sm:w-[230px]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] transition hover:text-[#181818]"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* SORT */}

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-11 rounded-full border border-[#DED7CC] bg-white px-5 text-xs font-medium text-[#555] outline-none focus:border-[#C9A96E]"
              >
                <option value="featured">Featured</option>

                <option value="price-low">Price: Low to High</option>

                <option value="price-high">Price: High to Low</option>

                <option value="name">Name: A–Z</option>
              </select>
            </div>
          </div>

          {/* ================= RESULT INFO ================= */}

          <div className="flex items-center justify-between py-7">
            <p className="text-sm text-[#777]">
              Showing{" "}
              <span className="font-semibold text-[#181818]">
                {filteredProducts.length}
              </span>{" "}
              of {products.length} fragrances
            </p>

            {(activeFilter !== "ALL" || search || sortBy !== "featured") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold uppercase tracking-[1.5px] text-[#777] underline underline-offset-4 transition hover:text-[#C9A96E]"
              >
                Clear All
              </button>
            )}
          </div>

          {/* ================= PRODUCTS ================= */}

          {filteredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
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
          ) : (
            /* ================= NO RESULTS ================= */

            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[28px] border border-[#E7E1D7] bg-white px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F0E7]">
                <Search size={25} className="text-[#C9A96E]" />
              </div>

              <h2 className="mt-6 font-serif text-3xl font-semibold">
                No fragrance found
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-[#777]">
                We couldn't find a fragrance matching your current search or
                filter.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-7 rounded-xl bg-[#181818] px-7 py-3.5 text-xs font-semibold uppercase tracking-[2px] text-white transition hover:bg-[#C9A96E]"
              >
                View All Fragrances
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= BOTTOM BRAND MESSAGE ================= */}

      <section className="border-t border-[#E7E1D7] bg-[#181818] px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
            Discover Your Signature
          </p>

          <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
            Four fragrances.
            <span className="block italic font-normal text-[#D0AD72]">
              Endless impressions.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#B8B8B8]">
            Every ELYVORR fragrance is created to leave a memorable impression
            and become part of your story.
          </p>
        </div>
      </section>
    </main>
  );
}

export default CollectionPage;
