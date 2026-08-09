import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import BagPage from "../pages/BagPage";
import CheckoutPage from "../pages/CheckoutPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/bag" element={<BagPage />} />

      <Route path="/checkout" element={<CheckoutPage />} />

      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center">
            <h1 className="font-serif text-4xl">Page Not Found</h1>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
