function HeroImage() {
  return (
    <div className="relative flex items-center justify-center">
      <img
        src="/images/hero/elyvorr-hero.png"
        alt="ELYVORR Eau de Parfum"
        className="
          relative
          z-10
          w-[260px]
          object-contain
          sm:w-[320px]
          lg:w-[420px]
          xl:w-[480px]
        "
      />
    </div>
  );
}

export default HeroImage;