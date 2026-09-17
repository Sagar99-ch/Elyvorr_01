import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F4] text-[#181818]">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="border-b border-[#E7E1D7] bg-[#FAF8F4] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-7xl">
          {/* LABEL */}

          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[4px]
              text-[#C9A96E]
              sm:text-xs
              sm:tracking-[5px]
            "
          >
            About ELYVORR
          </p>

          {/* HEADING */}

          <h1
            className="
              mt-12
              max-w-6xl
              font-serif
              text-[58px]
              font-medium
              leading-[0.95]
              tracking-[-2px]
              text-[#181818]

              sm:mt-14
              sm:text-7xl
              sm:tracking-[-3px]

              lg:mt-16
              lg:text-[110px]
              lg:leading-[0.9]
              lg:tracking-[-5px]
            "
          >
            Fragrance is
            <br />
            <span className="italic font-normal">more than a</span>
            <br />
            scent.
          </h1>
        </div>
      </section>

      {/* =====================================================
          BRAND STORY
      ===================================================== */}

      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          {/* VISUAL */}

          <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden rounded-[32px] bg-[#EDE7DC]">
            <div className="absolute left-8 top-8 h-24 w-24 rounded-full border border-[#C9A96E]/40" />

            <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full border border-[#C9A96E]/30" />

            <div className="relative text-center">
              <Sparkles
                size={32}
                strokeWidth={1}
                className="mx-auto text-[#C9A96E]"
              />

              <p className="mt-6 font-serif text-6xl font-semibold tracking-[6px]">
                ELYVORR
              </p>

              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[5px] text-[#777]">
                Scent • Identity • Memory
              </p>
            </div>
          </div>

          {/* STORY */}

          <div className="lg:pl-8">
            <p className="text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
              Our Story
            </p>

            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Created to become
              <span className="block italic font-normal">
                part of your story.
              </span>
            </h2>

            <div className="mt-7 space-y-5 text-sm leading-8 text-[#666]">
              <p>
                At ELYVORR, we believe a fragrance should feel personal. It
                should complement your presence, reflect your mood, and create
                memories that last.
              </p>

              <p>
                Our collection brings together carefully selected fragrances
                designed for different personalities, occasions and moments.
              </p>

              <p>
                From a quiet evening to an unforgettable occasion, ELYVORR is
                made to accompany you wherever your story takes you.
              </p>
            </div>

            <Link
              to="/collection"
              className="
                group
                mt-8
                inline-flex
                items-center
                gap-3
                border-b
                border-[#181818]
                pb-2
                text-xs
                font-semibold
                uppercase
                tracking-[2px]
                transition
                hover:border-[#C9A96E]
                hover:text-[#C9A96E]
              "
            >
              Explore Our Fragrances
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          SIGNATURE FRAGRANCE
      ===================================================== */}

      <section
        className="
          bg-[#F4E8EA]
          px-5
          py-24
          sm:px-8
          sm:py-28
          lg:px-12
          lg:py-36
        "
      >
        <div className="mx-auto max-w-7xl text-center">
          <h2
            className="
              mx-auto
              max-w-6xl
              font-sans
              text-5xl
              font-extrabold
              uppercase
              leading-[0.95]
              tracking-[-2px]
              text-[#65708A]

              sm:text-6xl

              lg:text-8xl
              lg:tracking-[-4px]
            "
          >
            Creating a fragrance
            <br />
            that becomes your
            <br />
            signature
          </h2>
        </div>
      </section>

      {/* =====================================================
          VALUES
      ===================================================== */}

      <section className="border-y border-[#E7E1D7] bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
              What We Believe
            </p>

            <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
              Simple principles.
              <span className="block italic font-normal">
                Meaningful fragrance.
              </span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {/* QUALITY */}

            <div className="rounded-[24px] border border-[#E7E1D7] bg-[#FAF8F4] p-8">
              <span className="font-serif text-4xl text-[#C9A96E]">01</span>

              <h3 className="mt-8 font-serif text-2xl font-semibold">
                Quality
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#777]">
                Every fragrance is selected with attention to character, quality
                and the experience it creates.
              </p>
            </div>

            {/* INDIVIDUALITY */}

            <div className="rounded-[24px] border border-[#E7E1D7] bg-[#FAF8F4] p-8">
              <span className="font-serif text-4xl text-[#C9A96E]">02</span>

              <h3 className="mt-8 font-serif text-2xl font-semibold">
                Individuality
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#777]">
                Your fragrance should feel like you — distinctive, memorable and
                effortless.
              </p>
            </div>

            {/* SIMPLICITY */}

            <div className="rounded-[24px] border border-[#E7E1D7] bg-[#FAF8F4] p-8">
              <span className="font-serif text-4xl text-[#C9A96E]">03</span>

              <h3 className="mt-8 font-serif text-2xl font-semibold">
                Simplicity
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#777]">
                Luxury doesn't need to be complicated. We focus on beautiful
                fragrances and a thoughtful experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COLLECTION
      ===================================================== */}

      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
            The Collection
          </p>

          <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
            Four fragrances.
            <span className="block italic font-normal">
              Four personalities.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#777]">
            Discover the four signature fragrances currently available from
            ELYVORR.
          </p>

          <Link
            to="/collection"
            className="
              group
              mt-8
              inline-flex
              items-center
              gap-3
              rounded-full
              bg-[#181818]
              px-7
              py-4
              text-xs
              font-semibold
              uppercase
              tracking-[2px]
              text-white
              transition
              hover:bg-[#C9A96E]
            "
          >
            Explore Collection
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="bg-[#181818] px-5 py-20 text-center text-white sm:px-8 lg:py-28">
        <p className="text-xs font-semibold uppercase tracking-[4px] text-[#C9A96E]">
          Find Your Signature
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">
          Let your fragrance
          <span className="block italic font-normal text-[#D0AD72]">
            tell your story.
          </span>
        </h2>

        <Link
          to="/collection"
          className="
            mt-9
            inline-flex
            items-center
            gap-3
            rounded-full
            bg-white
            px-8
            py-4
            text-xs
            font-semibold
            uppercase
            tracking-[2px]
            text-[#181818]
            transition
            hover:bg-[#C9A96E]
            hover:text-white
          "
        >
          Shop ELYVORR
          <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}

export default AboutPage;
