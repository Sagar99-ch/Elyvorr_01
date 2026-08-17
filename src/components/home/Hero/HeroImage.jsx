function HeroImage() {
  return (
    <div
      className="
        relative
        mt-10
        flex
        min-h-[300px]
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
          h-[250px]
          w-[250px]
          rounded-full
          bg-[#F3EBDD]

          sm:h-[340px]
          sm:w-[340px]

          lg:h-[420px]
          lg:w-[420px]
        "
      />

      {/* ================= PERFUME IMAGE ================= */}

      <div
        className="
          relative
          z-10
          flex
          items-center
          justify-center
        "
      >
        <img
          src="/images/elyvorr-hero.png"
          alt="Elyvorr luxury perfume"
          className="
            h-[300px]
            w-auto
            max-w-[280px]
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
      </div>
    </div>
  );
}

export default HeroImage;
