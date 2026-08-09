import { ArrowRight } from "lucide-react";
import { heroData } from "./heroData";

function HeroContent() {
  return (
    <div className="max-w-xl">
      <span className="inline-block rounded-full bg-[#F4EFE5] px-4 py-2 text-xs font-semibold uppercase tracking-[3px] text-[#C9A96E]">
        {heroData.subtitle}
      </span>

      <h1 className="mt-8 whitespace-pre-line font-serif text-6xl font-semibold leading-[1.05] text-[#181818] lg:text-7xl">
        {heroData.title}
      </h1>

      <p className="mt-8 text-lg leading-8 text-[#666]">
        {heroData.description}
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <button className="flex items-center gap-3 rounded-full bg-[#181818] px-8 py-4 text-sm font-semibold uppercase tracking-[2px] text-white transition hover:bg-[#C9A96E]">
          {heroData.primaryButton}
          <ArrowRight size={18} />
        </button>

        <button className="rounded-full border border-[#D8D2C8] px-8 py-4 text-sm font-semibold uppercase tracking-[2px] transition hover:border-[#C9A96E] hover:text-[#C9A96E]">
          {heroData.secondaryButton}
        </button>
      </div>
    </div>
  );
}

export default HeroContent;
