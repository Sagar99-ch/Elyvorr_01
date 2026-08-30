import { Mail, MapPin, Phone } from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

function Footer() {
  const phoneNumber = "+91 95220 42144";
  const whatsappNumber = "919522042144";
  const email = "elyvorrperfume@gmail.com";

  return (
    <footer className="mt-12 bg-[#181818] text-white sm:mt-24">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-20 lg:px-6">
        {/* =================================================
            MAIN FOOTER
        ================================================= */}

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* =================================================
              BRAND
          ================================================= */}

          <div className="lg:col-span-1">
            <h2 className="font-serif text-3xl font-semibold tracking-[3px] text-[#C9A96E] sm:text-4xl sm:tracking-[4px]">
              ELYVORR
            </h2>

            <p className="mt-4 max-w-xs text-xs leading-6 text-gray-400 sm:mt-6 sm:text-sm sm:leading-7">
              Crafted for those who appreciate timeless luxury, elegance and
              unforgettable fragrances.
            </p>

            {/* SOCIAL */}
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
              {/* FACEBOOK */}
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#444] transition hover:border-[#C9A96E] hover:text-[#C9A96E] sm:h-11 sm:w-11"
              >
                <FaFacebookF size={14} />
              </a>

              {/* INSTAGRAM */}
              <a
                href="https://www.instagram.com/YOUR_USERNAME/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#444] transition hover:border-[#C9A96E] hover:text-[#C9A96E] sm:h-11 sm:w-11"
              >
                <FaInstagram size={16} />
              </a>

              {/* WHATSAPP */}
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#444] transition hover:border-[#C9A96E] hover:text-[#C9A96E] sm:h-11 sm:w-11"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          {/* =================================================
              SHOP
          ================================================= */}

          <div>
            <h3 className="mb-4 text-sm font-semibold sm:mb-6 sm:text-lg">
              Shop
            </h3>

            <div className="flex flex-col gap-3 text-xs text-gray-400 sm:gap-4 sm:text-sm">
              <NavLink to="/shop" className="transition hover:text-[#C9A96E]">
                All Perfumes
              </NavLink>

              <NavLink
                to="/collection"
                className="transition hover:text-[#C9A96E]"
              >
                Collections
              </NavLink>

              <NavLink
                to="/new-arrivals"
                className="transition hover:text-[#C9A96E]"
              >
                New Arrivals
              </NavLink>

              <NavLink
                to="/best-sellers"
                className="transition hover:text-[#C9A96E]"
              >
                Best Sellers
              </NavLink>
            </div>
          </div>

          {/* =================================================
              COMPANY
          ================================================= */}

          <div>
            <h3 className="mb-4 text-sm font-semibold sm:mb-6 sm:text-lg">
              Company
            </h3>

            <div className="flex flex-col gap-3 text-xs text-gray-400 sm:gap-4 sm:text-sm">
              <NavLink to="/about" className="transition hover:text-[#C9A96E]">
                About Us
              </NavLink>

              <NavLink
                to="/contact"
                className="transition hover:text-[#C9A96E]"
              >
                Contact
              </NavLink>

              <NavLink
                to="/privacy-policy"
                className="transition hover:text-[#C9A96E]"
              >
                Privacy Policy
              </NavLink>

              <NavLink to="/terms" className="transition hover:text-[#C9A96E]">
                Terms & Conditions
              </NavLink>
            </div>
          </div>

          {/* =================================================
              CONTACT
          ================================================= */}

          <div>
            <h3 className="mb-4 text-sm font-semibold sm:mb-6 sm:text-lg">
              Contact
            </h3>

            <div className="space-y-4 text-xs text-gray-400 sm:space-y-5 sm:text-sm">
              {/* LOCATION */}
              <div className="flex gap-3">
                <MapPin
                  size={17}
                  className="mt-0.5 flex-shrink-0 text-[#C9A96E]"
                />

                <span>Ujjain, Madhya Pradesh</span>
              </div>

              {/* PHONE */}
              <a
                href="tel:+919522042144"
                className="flex gap-3 transition hover:text-[#C9A96E]"
                aria-label="Call ELYVORR"
              >
                <Phone
                  size={17}
                  className="mt-0.5 flex-shrink-0 text-[#C9A96E]"
                />

                <span>{phoneNumber}</span>
              </a>

              {/* EMAIL */}
              <a
                href="mailto:elyvorrperfume@gmail.com"
                className="flex gap-3 transition hover:text-[#C9A96E]"
                aria-label="Email ELYVORR"
              >
                <Mail
                  size={17}
                  className="mt-0.5 flex-shrink-0 text-[#C9A96E]"
                />

                <span className="break-all">{email}</span>
              </a>

              {/* WHATSAPP */}
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 transition hover:text-[#C9A96E]"
                aria-label="Chat with ELYVORR on WhatsApp"
              >
                <FaWhatsapp
                  size={18}
                  className="mt-0.5 flex-shrink-0 text-[#C9A96E]"
                />

                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          BOTTOM
      ================================================= */}

      <div className="border-t border-[#2D2D2D]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-center text-[10px] text-gray-500 sm:flex-row sm:px-6 sm:py-6 sm:text-sm">
          <p>© {new Date().getFullYear()} ELYVORR. All rights reserved.</p>

          <p className="hidden sm:block">
            Designed with love for luxury fragrance lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
