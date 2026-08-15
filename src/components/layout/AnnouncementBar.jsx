import { Truck, ShieldCheck, Sparkles } from "lucide-react";

function AnnouncementBar() {
  return (
    <div className="border-b border-[#E8E2D8] bg-[#181818] text-white">
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-center gap-10 px-6 text-[12px] font-medium tracking-[1.5px]">
        <div className="flex items-center gap-2">
          <Truck size={15} className="text-[#C9A96E]" />
          <span>FAST SHIPPING</span>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ShieldCheck size={15} className="text-[#C9A96E]" />
          <span>100% AUTHENTIC FRAGRANCES</span>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Sparkles size={15} className="text-[#C9A96E]" />
          <span>LUXURY PACKAGING INCLUDED</span>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;
