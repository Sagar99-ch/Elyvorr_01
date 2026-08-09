import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { name: "HOME", path: "/" },
  { name: "SHOP", path: "/shop" },
  { name: "COLLECTION", path: "/collection" },
  { name: "ABOUT", path: "/about" },
  { name: "CONTACT", path: "/contact" },
];

function Navbar({ bagCount = 0 }) {
  const [openMenu, setOpenMenu] = useState(false);

  const navigate = useNavigate();

  return (
    <>
      {/* ================= NAVBAR ================= */}

      <header className="sticky top-0 z-50 border-b border-[#ECE7DF] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
          {/* Logo */}

          <NavLink
            to="/"
            className="font-serif text-4xl font-semibold tracking-[6px] text-[#181818]"
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

          <div className="hidden items-center gap-2 lg:flex">
            {/* Search */}

            <button
              type="button"
              aria-label="Search"
              className="rounded-full p-3 transition hover:bg-[#F6F2EA] hover:text-[#C9A96E]"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}

            <button
              type="button"
              aria-label="Wishlist"
              className="rounded-full p-3 transition hover:bg-[#F6F2EA] hover:text-[#C9A96E]"
            >
              <Heart size={20} />
            </button>

            {/* ================= BAG ================= */}

            <button
              type="button"
              onClick={() => navigate("/bag")}
              aria-label="Shopping bag"
              className="relative rounded-full p-3 transition hover:bg-[#F6F2EA] hover:text-[#C9A96E]"
            >
              <ShoppingBag size={20} />

              {/* Bag Count */}

              {bagCount > 0 && (
                <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#181818] px-1 text-[10px] font-bold text-white">
                  {bagCount > 99 ? "99+" : bagCount}
                </span>
              )}
            </button>

            {/* User */}

            <button
              type="button"
              aria-label="Account"
              className="rounded-full p-3 transition hover:bg-[#F6F2EA] hover:text-[#C9A96E]"
            >
              <User size={20} />
            </button>
          </div>

          {/* ================= MOBILE MENU BUTTON ================= */}

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

      {/* ================= MOBILE MENU ================= */}

      <div
        className={`fixed inset-0 z-[60] transition ${
          openMenu ? "visible" : "invisible"
        }`}
      >
        {/* Overlay */}

        <div
          onClick={() => setOpenMenu(false)}
          className={`absolute inset-0 bg-black/40 transition ${
            openMenu ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Menu */}

        <div
          className={`absolute right-0 top-0 h-full w-[320px] bg-white shadow-2xl transition-transform duration-300 ${
            openMenu ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Mobile Header */}

          <div className="flex items-center justify-between border-b border-[#ECE7DF] p-6">
            <h2 className="font-serif text-2xl font-semibold">ELYVORR</h2>

            <button
              type="button"
              onClick={() => setOpenMenu(false)}
              aria-label="Close menu"
              className="rounded-full p-2 transition hover:bg-[#F6F2EA]"
            >
              <X size={22} />
            </button>
          </div>

          {/* Mobile Navigation */}

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

            {/* Mobile Bag */}

            <button
              type="button"
              onClick={() => {
                setOpenMenu(false);
                navigate("/bag");
              }}
              className="flex items-center justify-between border-b border-[#F0ECE5] py-5 text-left text-sm font-medium tracking-[2px] transition hover:text-[#C9A96E]"
            >
              <span>SHOPPING BAG</span>

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
