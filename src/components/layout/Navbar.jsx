import { useRef, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { name: "HOME", path: "/" },
  { name: "COLLECTION", path: "/collection" },
  { name: "ABOUT", path: "/about" },
  { name: "CONTACT", path: "/contact" },
];

function Navbar({ bagCount = 0 }) {
  const [openMenu, setOpenMenu] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // SECRET ADMIN LOGO CLICK
  // =====================================================

  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);

  const handleLogoClick = (event) => {
    event.preventDefault();

    logoClickCount.current += 1;

    // Reset previous timer
    clearTimeout(logoClickTimer.current);

    // 5 clicks completed
    if (logoClickCount.current === 5) {
      logoClickCount.current = 0;

      navigate("/admin/login");

      return;
    }

    // Reset counter if user waits too long
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 1500);
  };

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#ECE7DF] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
          {/* =================================================
              LOGO
          ================================================== */}

          <button
            type="button"
            onClick={handleLogoClick}
            aria-label="ELYVORR"
            className="font-serif text-4xl font-semibold tracking-[6px] text-[#181818] transition hover:text-[#C9A96E]"
          >
            ELYVORR
          </button>

          {/* =================================================
              DESKTOP NAV
          ================================================== */}

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

          {/* =================================================
              RIGHT ICONS
          ================================================== */}

          <div className="hidden items-center gap-2 lg:flex">
            {/* SHOPPING BAG */}

            <button
              type="button"
              onClick={() => navigate("/bag")}
              aria-label="Shopping bag"
              className="relative rounded-full p-3 transition hover:bg-[#F6F2EA] hover:text-[#C9A96E]"
            >
              <ShoppingBag size={20} />

              {bagCount > 0 && (
                <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#181818] px-1 text-[10px] font-bold text-white">
                  {bagCount > 99 ? "99+" : bagCount}
                </span>
              )}
            </button>
          </div>

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={() => setOpenMenu(true)}
            aria-label="Open menu"
            className="rounded-full p-2 transition hover:bg-[#F6F2EA] lg:hidden"
          >
            <Menu size={26} />
          </button>
        </div>
      </header>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <div
        className={`fixed inset-0 z-[60] transition ${
          openMenu ? "visible" : "invisible"
        }`}
      >
        {/* =================================================
            OVERLAY
        ================================================== */}

        <div
          onClick={() => setOpenMenu(false)}
          className={`absolute inset-0 bg-black/40 transition ${
            openMenu ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* =================================================
            MENU
        ================================================== */}

        <div
          className={`absolute right-0 top-0 h-full w-[320px] bg-white shadow-2xl transition-transform duration-300 ${
            openMenu ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* =================================================
              MOBILE HEADER
          ================================================== */}

          <div className="flex items-center justify-between border-b border-[#ECE7DF] p-6">
            {/* SECRET LOGO */}

            <button
              type="button"
              onClick={handleLogoClick}
              aria-label="ELYVORR"
              className="font-serif text-2xl font-semibold transition hover:text-[#C9A96E]"
            >
              ELYVORR
            </button>

            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setOpenMenu(false)}
              aria-label="Close menu"
              className="rounded-full p-2 transition hover:bg-[#F6F2EA]"
            >
              <X size={22} />
            </button>
          </div>

          {/* =================================================
              MOBILE NAVIGATION
          ================================================== */}

          <nav className="flex flex-col px-6">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setOpenMenu(false)}
                className="border-b border-[#F0ECE5] py-5 text-sm font-medium tracking-[2px] transition hover:text-[#C9A96E]"
              >
                {item.name}
              </NavLink>
            ))}

            {/* =================================================
                MOBILE BAG
            ================================================== */}

            <button
              type="button"
              onClick={() => {
                setOpenMenu(false);
                navigate("/bag");
              }}
              className="flex items-center justify-between border-b border-[#F0ECE5] py-5 text-left text-sm font-medium tracking-[2px] transition hover:text-[#C9A96E]"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag size={18} />
                SHOPPING BAG
              </span>

              {bagCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#181818] px-2 text-[10px] font-bold text-white">
                  {bagCount > 99 ? "99+" : bagCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Navbar;
