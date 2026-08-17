function HeroImage() {
  return (
    <div
      className="
        relative
        flex
        min-h-[360px]
        items-center
        justify-center
        sm:min-h-[450px]
        lg:min-h-0
      "
    >
      {/* =====================================================
          BACKGROUND CIRCLE
      ===================================================== */}

      <div
        className="
          absolute
          h-[280px]
          w-[280px]
          rounded-full
          bg-[#F3EBDD]
          sm:h-[360px]
          sm:w-[360px]
          lg:h-[420px]
          lg:w-[420px]
        "
      />

      {/* =====================================================
          PERFUME BOTTLE CARD
      ===================================================== */}

      <div
        className="
          relative
          flex
          h-[330px]
          w-[190px]
          items-center
          justify-center
          rounded-[28px]
          bg-white
          shadow-[0_20px_60px_rgba(0,0,0,.08)]
          sm:h-[420px]
          sm:w-[240px]
          sm:rounded-[35px]
          lg:h-[500px]
          lg:w-[280px]
          lg:rounded-[40px]
          lg:shadow-[0_30px_80px_rgba(0,0,0,.08)]
        "
      >
        <div className="text-center">
          {/* =================================================
              BOTTLE
          ================================================= */}

          <div
            className="
              mx-auto
              h-40
              w-16
              rounded-xl
              bg-[#C9A96E]
              shadow-[0_15px_30px_rgba(30,25,20,.15)]
              sm:h-52
              sm:w-20
              lg:h-60
              lg:w-24
            "
          />

          {/* =================================================
              BRAND
          ================================================= */}

          <h3
            className="
              mt-5
              font-serif
              text-2xl
              font-semibold
              text-[#181818]
              sm:mt-7
              sm:text-3xl
              lg:mt-8
            "
          >
            ELYVORR
          </h3>

          {/* =================================================
              TYPE
          ================================================= */}

          <p
            className="
              mt-1
              text-[9px]
              uppercase
              tracking-[2.5px]
              text-[#666]
              sm:mt-2
              sm:text-xs
              sm:tracking-[3px]
              lg:text-sm
              lg:tracking-[4px]
            "
          >
            Eau de Parfum
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeroImage;
