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
      {/* Announcement */}

      <AnnouncementBar />

      {/* Navbar */}

      <Navbar bagCount={totalItems} onOpenBag={() => setOpenBag(true)} />

      {/* Main */}

      <main>{children}</main>

      {/* Footer */}

      <Footer />

      {/* Bag Drawer */}

      <BagDrawer isOpen={openBag} onClose={() => setOpenBag(false)} />
    </div>
  );
}

export default Layout;
