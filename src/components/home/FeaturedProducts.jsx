import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import ProductCard from "../product/ProductCard";
import products from "../../data/products";
import { useCart } from "../../context/CartContext";

function FeaturedProducts() {
  const { addToBag } = useCart();

  const featuredProducts = products.slice(0, 3);

  return (
    <section className="bg-[#FAF8F4] px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

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

          {/* View All */}

          <Link
            to="/shop"
            className="group flex w-fit items-center gap-3 border-b border-[#181818] pb-2 text-sm font-semibold uppercase tracking-[2px] text-[#181818] transition hover:border-[#C9A96E] hover:text-[#C9A96E]"
          >
            View All Collection
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Products */}

        <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToBag={addToBag}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
