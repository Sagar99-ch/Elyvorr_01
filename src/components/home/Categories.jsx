import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import categories from "../../data/categories";

function Categories() {
  return (
    <section className="bg-[#181818] px-6 py-24 text-white lg:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
              Explore ELYVORR
            </p>

            <h2 className="mt-4 max-w-2xl font-serif text-5xl font-semibold leading-tight md:text-6xl">
              Find Your
              <span className="block italic font-normal">Signature Scent</span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-[#A8A8A8]">
            Explore fragrances crafted for different personalities, moods and
            moments. Find the scent that feels uniquely yours.
          </p>
        </div>

        {/* Categories */}

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.path}
              className="group relative overflow-hidden rounded-[28px]"
            >
              {/* Image */}

              <div className="relative aspect-[3/4] overflow-hidden bg-[#292929]">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-serif text-5xl text-[#C9A96E]/40">
                      E
                    </span>
                  </div>
                )}

                {/* Overlay */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Content */}

                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="text-[11px] font-medium uppercase tracking-[3px] text-[#C9A96E]">
                    {category.subtitle}
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-4">
                    <h3 className="font-serif text-3xl font-semibold">
                      {category.title}
                    </h3>

                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md transition duration-300 group-hover:bg-[#C9A96E] group-hover:text-[#181818]">
                      <ArrowUpRight size={19} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
