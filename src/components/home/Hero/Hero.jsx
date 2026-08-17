import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

function Hero() {
  return (
    <section className="overflow-hidden bg-[#FAF8F4]">
      <div
        className="
          mx-auto
          max-w-7xl
          px-5
          py-10

          sm:px-8
          sm:py-14

          lg:grid
          lg:min-h-[90vh]
          lg:grid-cols-2
          lg:items-center
          lg:gap-16
          lg:px-6
          lg:py-20
        "
      >
        {/* ================= MOBILE + DESKTOP CONTENT ================= */}

        <div className="min-w-0">
          <HeroContent />
        </div>

        {/* ================= HERO IMAGE ================= */}

        <div className="min-w-0">
          <HeroImage />
        </div>
      </div>
    </section>
  );
}

export default Hero;
