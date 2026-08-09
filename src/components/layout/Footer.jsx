import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { NavLink } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-24 bg-[#181818] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <h2 className="font-serif text-4xl font-semibold tracking-[4px] text-[#C9A96E]">
            ELYVORR
          </h2>

          <p className="mt-6 max-w-xs text-sm leading-7 text-gray-400">
            Crafted for those who appreciate timeless luxury, elegance and
            unforgettable fragrances.
          </p>

          <div className="mt-8 flex gap-4">
            <button className="rounded-full border border-[#444] p-3 transition hover:border-[#C9A96E] hover:text-[#C9A96E]">
              <FaFacebookF size={16} />
            </button>

            <button className="rounded-full border border-[#444] p-3 transition hover:border-[#C9A96E] hover:text-[#C9A96E]">
              <FaInstagram size={18} />
            </button>

            <button className="rounded-full border border-[#444] p-3 transition hover:border-[#C9A96E] hover:text-[#C9A96E]">
              <FaLinkedinIn size={18} />
            </button>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="mb-6 text-lg font-semibold">Shop</h3>

          <div className="flex flex-col gap-4 text-sm text-gray-400">
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

        {/* Company */}
        <div>
          <h3 className="mb-6 text-lg font-semibold">Company</h3>

          <div className="flex flex-col gap-4 text-sm text-gray-400">
            <NavLink to="/about" className="transition hover:text-[#C9A96E]">
              About Us
            </NavLink>

            <NavLink to="/contact" className="transition hover:text-[#C9A96E]">
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

        {/* Contact */}
        <div>
          <h3 className="mb-6 text-lg font-semibold">Contact</h3>

          <div className="space-y-5 text-sm text-gray-400">
            <div className="flex gap-3">
              <MapPin
                size={18}
                className="mt-0.5 flex-shrink-0 text-[#C9A96E]"
              />
              <span>Indore, Madhya Pradesh</span>
            </div>

            <div className="flex gap-3">
              <Phone
                size={18}
                className="mt-0.5 flex-shrink-0 text-[#C9A96E]"
              />
              <span>+91 98765 43210</span>
            </div>

            <div className="flex gap-3">
              <Mail size={18} className="mt-0.5 flex-shrink-0 text-[#C9A96E]" />
              <span>support@elyvorr.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-[#2D2D2D]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} ELYVORR. All rights reserved.</p>

          <p>Designed with love for luxury fragrance lovers.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
