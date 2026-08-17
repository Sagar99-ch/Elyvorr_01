import { useRef, useState } from "react";
import { Menu, ShoppingBag, X, Search } from "lucide-react";
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

    clearTimeout(logoClickTimer.current);

    if (logoClickCount.current === 5) {
      logoClickCount.current = 0;

      navigate("/admin/login");

      return;
    }

    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 1500);
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    navigate("/collection");
  };

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#ECE7DF] bg-white/95 backdrop-blur-xl">
        {/* =================================================
            DESKTOP
        ================================================= */}

        <div className="mx-auto hidden h-24 max-w-7xl items-center justify-between px-6 lg:flex">
          {/* LOGO */}

          <button
            type="button"
            onClick={handleLogoClick}
            aria-label="ELYVORR"
            className="font-serif text-4xl font-semibold tracking-[6px] text-[#181818] transition hover:text-[#C9A96E]"
          >
            ELYVORR
          </button>

          {/* DESKTOP NAV */}

          <nav className="flex items-center gap-10">
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

          {/* DESKTOP BAG */}

          <div className="flex items-center gap-2">
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
        </div>

        {/* =================================================
            MOBILE
        ================================================= */}

        <div className="flex h-[68px] items-center justify-between px-4 lg:hidden">
          {/* =================================================
              LEFT — MENU
          ================================================= */}

          <button
            type="button"
            onClick={() => setOpenMenu(true)}
            aria-label="Open menu"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              transition
              hover:bg-[#F6F2EA]
            "
          >
            <Menu size={24} strokeWidth={1.8} />
          </button>

          {/* =================================================
              CENTER — LOGO
          ================================================= */}

          <button
            type="button"
            onClick={handleLogoClick}
            aria-label="ELYVORR"
            className="
              absolute
              left-1/2
              -translate-x-1/2
              font-serif
              text-[25px]
              font-semibold
              tracking-[4px]
              text-[#181818]
            "
          >
            ELYVORR
          </button>

          {/* =================================================
              RIGHT — SEARCH + BAG
          ================================================= */}

          <div className="ml-auto flex items-center gap-1">
            {/* SEARCH */}

            <button
              type="button"
              onClick={handleSearch}
              aria-label="Search perfumes"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                transition
                hover:bg-[#F6F2EA]
              "
            >
              <Search size={21} strokeWidth={1.8} />
            </button>

            {/* BAG */}

            <button
              type="button"
              onClick={() => navigate("/bag")}
              aria-label="Shopping bag"
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                transition
                hover:bg-[#F6F2EA]
              "
            >
              <ShoppingBag size={21} strokeWidth={1.8} />

              {bagCount > 0 && (
                <span
                  className="
                    absolute
                    right-0
                    top-0
                    flex
                    h-[17px]
                    min-w-[17px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#181818]
                    px-1
                    text-[8px]
                    font-bold
                    text-white
                  "
                >
                  {bagCount > 99 ? "99+" : bagCount}
                </span>
              )}
            </button>
          </div>
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
          className={`absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl transition-transform duration-300 ${
            openMenu ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* =================================================
              MOBILE MENU HEADER
          ================================================= */}

          <div className="flex items-center justify-between border-b border-[#ECE7DF] p-5">
            {/* SECRET LOGO */}

            <button
              type="button"
              onClick={handleLogoClick}
              aria-label="ELYVORR"
              className="font-serif text-2xl font-semibold tracking-[3px] transition hover:text-[#C9A96E]"
            >
              ELYVORR
            </button>

            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setOpenMenu(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#F6F2EA]"
            >
              <X size={22} />
            </button>
          </div>

          {/* =================================================
              MOBILE NAVIGATION
          ================================================= */}

          <nav className="flex flex-col px-5">
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
            ================================================= */}

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
