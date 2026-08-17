import { ArrowRight } from "lucide-react";
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
          max-w-[360px]
          whitespace-pre-line
          font-serif
          text-[44px]
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
          mt-6
          max-w-[350px]
          text-[15px]
          font-medium
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

      {/* ================= BUTTONS ================= */}

      <div
        className="
          mt-7
          flex
          flex-col
          gap-3

          sm:mt-10
          sm:flex-row
          sm:flex-wrap
        "
      >
        {/* PRIMARY */}

        <button
          type="button"
          className="
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-full
            bg-[#181818]
            px-7
            py-4
            text-xs
            font-semibold
            uppercase
            tracking-[2px]
            text-white
            transition
            hover:bg-[#C9A96E]

            sm:w-fit
            sm:px-8
            sm:text-sm
          "
        >
          {heroData.primaryButton}

          <ArrowRight size={17} />
        </button>

        {/* SECONDARY */}

        <button
          type="button"
          className="
            w-full
            rounded-full
            border
            border-[#D8D2C8]
            px-7
            py-4
            text-xs
            font-semibold
            uppercase
            tracking-[2px]
            text-[#181818]
            transition
            hover:border-[#C9A96E]
            hover:text-[#C9A96E]

            sm:w-fit
            sm:px-8
            sm:text-sm
          "
        >
          {heroData.secondaryButton}
        </button>
      </div>
    </div>
  );
}

export default HeroContent;
