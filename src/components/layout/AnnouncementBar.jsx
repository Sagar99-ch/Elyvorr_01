import { Truck, ShieldCheck, Sparkles } from "lucide-react";

function AnnouncementBar() {
  return (
    <div className="border-b border-[#E8E2D8] bg-[#181818] text-white">
      <div
        className="
          mx-auto
          flex
          h-9
          max-w-7xl
          items-center
          justify-center
          px-4
          text-[9px]
          font-semibold
          tracking-[1.5px]
          sm:h-11
          sm:px-6
          sm:text-[12px]
        "
      >
        {/* =================================================
            MOBILE
        ================================================= */}

        <div className="flex items-center gap-2 lg:hidden">
          <Truck size={13} className="text-[#C9A96E]" />

          <span>FAST SHIPPING</span>
        </div>

        {/* =================================================
            DESKTOP
        ================================================= */}

        <div className="hidden items-center gap-10 lg:flex">
          <div className="flex items-center gap-2">
            <Truck size={15} className="text-[#C9A96E]" />

            <span>FAST SHIPPING</span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-[#C9A96E]" />

            <span>100% AUTHENTIC FRAGRANCES</span>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[#C9A96E]" />

            <span>LUXURY PACKAGING INCLUDED</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;
