import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

function Hero() {
  return (
    <section className="overflow-hidden bg-[#FAF8F4]">
      <div
        className="
          mx-auto
          grid
          max-w-7xl
          items-center
          gap-8
          px-5
          py-10
          sm:gap-10
          sm:px-8
          sm:py-14
          lg:min-h-[90vh]
          lg:grid-cols-2
          lg:gap-16
          lg:px-6
          lg:py-20
        "
      >
        <HeroContent />

        <HeroImage />
      </div>
    </section>
  );
}

export default Hero;
