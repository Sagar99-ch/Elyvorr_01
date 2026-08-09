function HeroImage() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute h-[420px] w-[420px] rounded-full bg-[#F3EBDD]" />

      <div className="relative flex h-[500px] w-[280px] items-center justify-center rounded-[40px] bg-white shadow-[0_30px_80px_rgba(0,0,0,.08)]">
        <div className="text-center">
          <div className="mx-auto h-60 w-24 rounded-2xl bg-[#C9A96E]" />

          <h3 className="mt-8 font-serif text-3xl font-semibold">ELYVORR</h3>

          <p className="mt-2 text-sm tracking-[4px] text-[#666] uppercase">
            Eau de Parfum
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeroImage;
