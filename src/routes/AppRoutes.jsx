import React from "react";
import { Routes, Route } from "react-router-dom";

// ==================== Customer Pages ====================
import HomePage from "../pages/customer/HomePage";
import AboutPage from "../pages/customer/AboutPage";
import CollectionPage from "../pages/customer/CollectionPage";
// import ShopPage from "../pages/customer/ShopPage";
import ContactPage from "../pages/checkout/ContactPage";
import ProductDetailsPage from "../pages/customer/ProductDetailsPage";
import BagPage from "../pages/customer/BagPage";
import OrderSuccessPage from "../pages/customer/OrderSuccessPage";
import TrackOrderPage from "../pages/customer/TrackOrderPage";

// ==================== Checkout Pages ====================
import CheckoutPage from "../pages/customer/CheckoutPage";
import AddressPage from "../pages/checkout/AddressPage";
import PaymentPage from "../pages/checkout/PaymentPage";

// ==================== Admin Pages ====================
import AdminLayout from "../pages/admin/AdminLayout";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminEnquiriesPage from "../pages/admin/AdminEnquiriesPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ==================== CUSTOMER ROUTES ==================== */}

      <Route path="/" element={<HomePage />} />

      <Route path="/about" element={<AboutPage />} />

      <Route path="/collection" element={<CollectionPage />} />

      {/* <Route path="/shop" element={<ShopPage />} /> */}

      <Route path="/contact" element={<ContactPage />} />

      <Route path="/product/:id" element={<ProductDetailsPage />} />

      <Route path="/bag" element={<BagPage />} />

      {/* ==================== CHECKOUT ROUTES ==================== */}

      <Route path="/checkout" element={<CheckoutPage />} />

      <Route path="/checkout/address" element={<AddressPage />} />

      <Route path="/checkout/payment" element={<PaymentPage />} />

      <Route path="/order-success" element={<OrderSuccessPage />} />

      <Route path="/track-order" element={<TrackOrderPage />} />

      {/* ==================== ADMIN ROUTES ==================== */}

      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />

        <Route path="products" element={<AdminProductsPage />} />

        <Route path="orders" element={<AdminOrdersPage />} />

        <Route path="enquiries" element={<AdminEnquiriesPage />} />

        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
