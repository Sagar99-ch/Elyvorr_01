import { Routes, Route } from "react-router-dom";

// =====================================================
// CUSTOMER PAGES
// =====================================================

import HomePage from "../pages/HomePage";
import BagPage from "../pages/BagPage";
import CheckoutPage from "../pages/CheckoutPage";
import AddressPage from "../pages/checkout/AddressPage";
import PaymentPage from "../pages/checkout/PaymentPage";
import AboutPage from "../pages/AboutPage";
import CollectionPage from "../pages/CollectionPage";
import ContactPage from "../pages/ContactPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import OrderSuccessPage from "../pages/OrderSuccessPage";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminEnquiriesPage from "../pages/admin/AdminEnquiriesPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";

function AppRoutes() {
  return (
    <Routes>
      {/* =================================================
          ADMIN LOGIN
      ================================================= */}

      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* =================================================
          ADMIN PANEL
      ================================================= */}

      <Route path="/admin" element={<AdminLayout />}>
        {/* Dashboard */}
        <Route index element={<AdminDashboard />} />

        {/* Orders */}
        <Route path="orders" element={<AdminOrdersPage />} />

        {/* Products */}
        <Route path="products" element={<AdminProductsPage />} />

        {/* Inventory */}
        <Route
          path="inventory"
          element={
            <div className="flex min-h-[500px] items-center justify-center">
              <h1 className="font-serif text-3xl font-semibold">Inventory</h1>
            </div>
          }
        />

        {/* Enquiries */}
        <Route path="inquiries" element={<AdminEnquiriesPage />} />

        {/* Settings */}
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* =================================================
          CUSTOMER WEBSITE
      ================================================= */}

      <Route path="/" element={<HomePage />} />

      <Route path="/about" element={<AboutPage />} />

      <Route path="/contact" element={<ContactPage />} />

      <Route path="/collection" element={<CollectionPage />} />

      <Route path="/product/:id" element={<ProductDetailsPage />} />

      {/* =================================================
          BAG
      ================================================= */}

      <Route path="/bag" element={<BagPage />} />

      {/* =================================================
          CHECKOUT
      ================================================= */}

      <Route path="/checkout" element={<CheckoutPage />} />

      <Route path="/checkout/address" element={<AddressPage />} />

      <Route path="/checkout/payment" element={<PaymentPage />} />

      {/* =================================================
          ORDER SUCCESS
      ================================================= */}

      <Route path="/order-success" element={<OrderSuccessPage />} />

      {/* =================================================
          404
      ================================================= */}

      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
            <h1 className="font-serif text-4xl font-semibold">
              Page Not Found
            </h1>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
