import { heroData } from "./heroData";

function HeroContent() {
  return (
    <div
      className="
        relative
        z-10
        max-w-xl
        lg:max-w-2xl
      "
    >
      {/* ================= BADGE ================= */}

      <span
        className="
          inline-block
          rounded-full
          bg-[#F4EFE5]
          px-3
          py-2
          text-[9px]
          font-semibold
          uppercase
          tracking-[2px]
          text-[#C9A96E]

          sm:px-4
          sm:text-xs
          sm:tracking-[3px]
        "
      >
        {heroData.subtitle}
      </span>

      {/* ================= TITLE ================= */}

      <h1
        className="
          mt-6
          max-w-[370px]
          whitespace-pre-line
          font-serif
          text-[43px]
          font-semibold
          leading-[0.98]
          text-[#181818]

          sm:mt-8
          sm:text-5xl

          lg:max-w-xl
          lg:text-7xl
          lg:leading-[1.05]
        "
      >
        {heroData.title}
      </h1>

      {/* ================= DESCRIPTION ================= */}

      <p
        className="
          mt-5
          max-w-[350px]
          text-[14px]
          leading-7
          text-[#666]

          sm:mt-8
          sm:text-lg
          sm:leading-8

          lg:max-w-xl
        "
      >
        {heroData.description}
      </p>

      {/* =====================================================
          MOBILE TRUST INFORMATION
      ===================================================== */}

      <div
        className="
          mt-7
          grid
          grid-cols-3
          border-y
          border-[#E5DED2]
          py-4

          sm:mt-8
          sm:py-5

          lg:hidden
        "
      >
        {/* 50ML */}

        <div className="text-center">
          <p className="font-serif text-lg font-semibold text-[#181818]">
            50ml
          </p>

          <p className="mt-1 text-[8px] font-semibold uppercase tracking-[1.2px] text-[#999]">
            Eau de Parfum
          </p>
        </div>

        {/* LONG LASTING */}

        <div className="border-x border-[#E5DED2] text-center">
          <p className="font-serif text-lg font-semibold text-[#181818]">
            Long
          </p>

          <p className="mt-1 text-[8px] font-semibold uppercase tracking-[1.2px] text-[#999]">
            Lasting
          </p>
        </div>

        {/* PREMIUM */}

        <div className="text-center">
          <p className="font-serif text-lg font-semibold text-[#181818]">
            Premium
          </p>

          <p className="mt-1 text-[8px] font-semibold uppercase tracking-[1.2px] text-[#999]">
            Fragrance
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeroContent;
