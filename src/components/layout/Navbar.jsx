import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { name: "HOME", path: "/" },
  { name: "SHOP", path: "/shop" },
  { name: "COLLECTION", path: "/collection" },
  { name: "ABOUT", path: "/about" },
  { name: "CONTACT", path: "/contact" },
];

function Navbar({ bagCount = 0 }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-[#ECE7DF] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:h-24 sm:px-6">
        {/* ================= LOGO ================= */}

        <NavLink
          to="/"
          className="flex-shrink-0 font-serif text-[27px] font-semibold tracking-[4px] text-[#181818] sm:text-4xl sm:tracking-[6px]"
        >
          ELYVORR
        </NavLink>

        {/* ================= DESKTOP NAV ================= */}

        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `text-[13px] font-medium tracking-[2px] transition duration-300 ${
                  isActive
                    ? "text-[#C9A96E]"
                    : "text-[#181818] hover:text-[#C9A96E]"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* ================= RIGHT ICONS ================= */}

        <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-2">
          {/* ================= SEARCH ================= */}

          <button
            type="button"
            aria-label="Search"
            className="rounded-full p-2.5 transition hover:bg-[#F6F2EA] hover:text-[#C9A96E] sm:p-3"
          >
            <Search size={21} strokeWidth={1.9} />
          </button>

          {/* ================= WISHLIST ================= */}

          <button
            type="button"
            aria-label="Wishlist"
            className="rounded-full p-2.5 transition hover:bg-[#F6F2EA] hover:text-[#C9A96E] sm:p-3"
          >
            <Heart size={21} strokeWidth={1.9} />
          </button>

          {/* ================= SHOPPING BAG ================= */}

          <button
            type="button"
            onClick={() => navigate("/bag")}
            aria-label={`Shopping bag${
              bagCount > 0 ? `, ${bagCount} items` : ""
            }`}
            className="relative rounded-full p-2.5 transition hover:bg-[#F6F2EA] hover:text-[#C9A96E] sm:p-3"
          >
            <ShoppingBag size={21} strokeWidth={1.9} />

            {/* BAG COUNT */}

            {bagCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#181818] px-1 text-[9px] font-bold leading-none text-white sm:right-1 sm:top-1 sm:h-5 sm:min-w-5 sm:text-[10px]">
                {bagCount > 99 ? "99+" : bagCount}
              </span>
            )}
          </button>

          {/* ================= USER ================= */}

          <button
            type="button"
            aria-label="Account"
            className="rounded-full p-2.5 transition hover:bg-[#F6F2EA] hover:text-[#C9A96E] sm:p-3"
          >
            <User size={21} strokeWidth={1.9} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
