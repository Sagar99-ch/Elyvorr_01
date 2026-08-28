function HeroImage() {
  return (
    <div
      className="
        relative
        flex
        min-h-[380px]
        items-center
        justify-center
        sm:min-h-[460px]
        lg:min-h-[560px]
      "
    >
      {/* ================= OUTER CIRCLE ================= */}

      <div
        className="
          absolute
          h-[280px]
          w-[280px]
          rounded-full
          bg-[#F3EBDD]
          sm:h-[360px]
          sm:w-[360px]
          lg:h-[440px]
          lg:w-[440px]
        "
      />

      {/* ================= INNER CIRCLE ================= */}

      <div
        className="
          absolute
          h-[235px]
          w-[235px]
          rounded-full
          border
          border-[#E5D8C4]
          sm:h-[305px]
          sm:w-[305px]
          lg:h-[375px]
          lg:w-[375px]
        "
      />

      {/* ================= LOGO ================= */}

      <div
        className="
          relative
          z-10
          flex
          h-[220px]
          w-[220px]
          flex-col
          items-center
          justify-center
          rounded-full
          bg-[#FAF8F4]
          shadow-[0_20px_50px_rgba(30,25,20,0.10)]
          sm:h-[290px]
          sm:w-[290px]
          lg:h-[355px]
          lg:w-[355px]
        "
      >
        {/* EV MONOGRAM */}

        <div
          className="
            font-serif
            text-[72px]
            leading-none
            tracking-[-8px]
            text-[#C9A96E]
            sm:text-[90px]
            lg:text-[110px]
          "
        >
          E<span className="relative -ml-5">V</span>
        </div>

        {/* BRAND */}

        <p
          className="
            mt-2
            font-serif
            text-3xl
            font-medium
            tracking-[3px]
            text-[#A98242]
            sm:text-4xl
            lg:text-5xl
          "
        >
          ELYVORR
        </p>

        {/* PERFUME */}

        <div className="mt-2 flex items-center gap-3">
          <span className="h-px w-8 bg-[#C9A96E]" />

          <span
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[5px]
              text-[#A98242]
              sm:text-[10px]
            "
          >
            Perfume
          </span>

          <span className="h-px w-8 bg-[#C9A96E]" />
        </div>
      </div>
    </div>
  );
}

export default HeroImage;
