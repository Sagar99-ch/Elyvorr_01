function HeroImage() {
  return (
    <div
      className="
        relative
        mt-8
        flex
        min-h-[340px]
        items-center
        justify-center

        sm:mt-14
        sm:min-h-[400px]

        lg:mt-0
        lg:min-h-[560px]
      "
    >
      {/* ================= BACKGROUND CIRCLE ================= */}

      <div
        className="
          absolute
          h-[270px]
          w-[270px]
          rounded-full
          bg-[#F3EBDD]

          sm:h-[340px]
          sm:w-[340px]

          lg:h-[420px]
          lg:w-[420px]
        "
      />

      {/* ================= SOFT DECORATION ================= */}

      <div
        className="
          absolute
          h-[215px]
          w-[215px]
          rounded-full
          border
          border-[#E5D8C4]

          sm:h-[280px]
          sm:w-[280px]

          lg:h-[350px]
          lg:w-[350px]
        "
      />

      {/* ================= PERFUME ================= */}

      <img
        src="/images/elyvorr-hero.png"
        alt="ELYVORR luxury perfume"
        className="
          relative
          z-10
          h-[330px]
          w-auto
          max-w-[290px]
          object-contain
          drop-shadow-[0_25px_35px_rgba(30,25,20,0.18)]
          transition-transform
          duration-700
          hover:scale-105

          sm:h-[420px]
          sm:max-w-[360px]

          lg:h-[540px]
          lg:max-w-[480px]
        "
      />

      {/* ================= BRAND DECORATION ================= */}

      <div
        className="
          absolute
          bottom-0
          left-1/2
          z-20
          -translate-x-1/2
          text-center
          lg:hidden
        "
      >
        <p className="text-[9px] font-semibold uppercase tracking-[5px] text-[#C9A96E]">
          ELYVORR
        </p>

        <div className="mx-auto mt-2 h-px w-16 bg-[#C9A96E]" />
      </div>
    </div>
  );
}

export default HeroImage;
