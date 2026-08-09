import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

function Hero() {
  return (
    <section className="overflow-hidden bg-[#FAF8F4]">
      <div className="mx-auto grid min-h-[90vh] max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2">
        <HeroContent />

        <HeroImage />
      </div>
    </section>
  );
}

export default Hero;
