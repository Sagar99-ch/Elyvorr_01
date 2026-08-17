import { useState } from "react";

import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BagDrawer from "../bag/BagDrawer";

import { useCart } from "../../context/CartContext";

function Layout({ children }) {
  const [openBag, setOpenBag] = useState(false);

  const { totalItems } = useCart();

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#181818]">
      {/* =====================================================
          HEADER AREA

          DESKTOP:
          Announcement → Navbar

          MOBILE:
          Navbar → Announcement
      ===================================================== */}

      <div className="flex flex-col">
        {/* =================================================
            ANNOUNCEMENT BAR

            Mobile  → second
            Desktop → first
        ================================================= */}

        <div className="order-2 lg:order-1">
          <AnnouncementBar />
        </div>

        {/* =================================================
            NAVBAR

            Mobile  → first
            Desktop → second
        ================================================= */}

        <div className="order-1 lg:order-2">
          <Navbar bagCount={totalItems} onOpenBag={() => setOpenBag(true)} />
        </div>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main>{children}</main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />

      {/* =====================================================
          BAG DRAWER
      ===================================================== */}

      <BagDrawer isOpen={openBag} onClose={() => setOpenBag(false)} />
    </div>
  );
}

export default Layout;
