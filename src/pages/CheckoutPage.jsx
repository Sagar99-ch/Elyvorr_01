import { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  Lock,
  MapPin,
  Pencil,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";

function CheckoutPage() {
  const navigate = useNavigate();

  const { cartItems, subtotal } = useCart();

  // =====================================================
  // CONVEX
  // =====================================================

  const saveAddress = useMutation(api.addresses.saveAddress);

  // =====================================================
  // SESSION ID
  // =====================================================

  const [sessionId] = useState(() => {
    const storageKey = "elyvorr_session_id";

    let id = localStorage.getItem(storageKey);

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(storageKey, id);
    }

    return id;
  });

  // =====================================================
  // STATE
  // =====================================================

  const [address, setAddress] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [savingAddress, setSavingAddress] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // =====================================================
  // LOAD SAVED ADDRESS
  // =====================================================

  useEffect(() => {
    const saved = localStorage.getItem("elyvorr_address");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        setAddress(parsed);

        setForm({
          fullName: parsed.fullName || "",
          mobile: parsed.mobile || "",
          address: parsed.address || "",
          city: parsed.city || "",
          state: parsed.state || "",
          pincode: parsed.pincode || "",
        });
      } catch {
        localStorage.removeItem("elyvorr_address");
      }
    }
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleInput = (event) => {
    const { name, value } = event.target;

    setError("");

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // SAVE ADDRESS
  // =====================================================

  const handleSaveAddress = async (event) => {
    event.preventDefault();

    setError("");

    // ---------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------

    if (
      !form.fullName.trim() ||
      !form.mobile.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      setError("Please fill all delivery details.");

      return;
    }

    // ---------------------------------------------
    // MOBILE VALIDATION
    // ---------------------------------------------

    if (!/^[0-9]{10}$/.test(form.mobile.trim())) {
      setError("Please enter a valid 10 digit mobile number.");

      return;
    }

    // ---------------------------------------------
    // PINCODE VALIDATION
    // ---------------------------------------------

    if (!/^[0-9]{6}$/.test(form.pincode.trim())) {
      setError("Please enter a valid 6 digit pincode.");

      return;
    }

    setSavingAddress(true);

    try {
      // =============================================
      // SAVE ADDRESS TO CONVEX
      // =============================================

      await saveAddress({
        sessionId,

        fullName: form.fullName.trim(),

        mobile: form.mobile.trim(),

        address: form.address.trim(),

        city: form.city.trim(),

        state: form.state.trim(),

        pincode: form.pincode.trim(),
      });

      // =============================================
      // LOCAL STORAGE BACKUP
      // =============================================

      const newAddress = {
        fullName: form.fullName.trim(),

        mobile: form.mobile.trim(),

        address: form.address.trim(),

        city: form.city.trim(),

        state: form.state.trim(),

        pincode: form.pincode.trim(),

        country: "India",
      };

      localStorage.setItem("elyvorr_address", JSON.stringify(newAddress));

      // =============================================
      // UPDATE UI
      // =============================================

      setAddress(newAddress);

      setShowForm(false);

      setError("");
    } catch (error) {
      console.error("Address save error:", error);

      setError(error?.message || "Unable to save address. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  };

  // =====================================================
  // PROCEED TO PAYMENT
  // =====================================================

  const handleProceedToPay = () => {
    if (!address) {
      setError("Please add your delivery address first.");

      return;
    }

    navigate("/checkout/payment");
  };

  // =====================================================
  // PRICE
  // =====================================================

  const shipping = subtotal >= 5000 ? 0 : 99;

  const gst = Math.round(subtotal * 0.08);

  const total = subtotal + shipping + gst;

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center bg-[#F7F5F0]">
          <div className="text-center">
            <h1 className="font-serif text-4xl font-semibold">
              Your bag is empty
            </h1>

            <p className="mt-3 text-sm text-[#777]">
              Add a fragrance before proceeding to checkout.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <Layout>
      <main className="min-h-screen bg-[#F7F5F0]">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="border-b border-[#E8E2D8] bg-[#FBFAF7]">
          <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[3px]">
              <span className="text-[#C9A96E]">Shopping Bag</span>

              <ChevronRight size={13} className="text-[#999]" />

              <span className="text-[#181818]">Checkout</span>
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[4px] text-[#C9A96E]">
                Secure Checkout
              </p>

              <h1 className="mt-2 font-serif text-[46px] font-semibold leading-[1.05] tracking-[-1px] text-[#181818] sm:text-[60px]">
                Complete Your Order
              </h1>

              <p className="mt-4 max-w-2xl text-sm text-[#777]">
                Enter your delivery details and review your order before
                proceeding to secure payment.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_430px]">
            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <section className="space-y-6">
              {/* =================================================
                  ADDRESS SECTION
              ================================================= */}

              <section className="overflow-hidden rounded-[26px] border border-[#E2DBD0] bg-white">
                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-[#ECE7DF] px-6 py-6 sm:px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F0E7]">
                      <MapPin size={20} className="text-[#C9A96E]" />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
                        Step 01
                      </p>

                      <h2 className="mt-1 font-serif text-2xl font-semibold">
                        Delivery Address
                      </h2>
                    </div>
                  </div>

                  {address && (
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setShowForm(true);
                      }}
                      className="flex items-center gap-2 rounded-full border border-[#DDD5C9] px-4 py-2 text-[10px] font-semibold uppercase tracking-[1.5px] transition hover:border-[#C9A96E] hover:text-[#B08C4C]"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                  )}
                </div>

                {/* ADDRESS CONTENT */}

                <div className="p-6 sm:p-8">
                  {!address || showForm ? (
                    <form onSubmit={handleSaveAddress} className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                          label="Full Name"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleInput}
                          placeholder="Enter your full name"
                        />

                        <Input
                          label="Mobile Number"
                          name="mobile"
                          value={form.mobile}
                          onChange={handleInput}
                          placeholder="10 digit mobile number"
                          maxLength={10}
                        />
                      </div>

                      <Input
                        label="Address"
                        name="address"
                        value={form.address}
                        onChange={handleInput}
                        placeholder="House no., street, area"
                      />

                      <div className="grid gap-5 sm:grid-cols-3">
                        <Input
                          label="City"
                          name="city"
                          value={form.city}
                          onChange={handleInput}
                          placeholder="City"
                        />

                        <Input
                          label="State"
                          name="state"
                          value={form.state}
                          onChange={handleInput}
                          placeholder="State"
                        />

                        <Input
                          label="Pincode"
                          name="pincode"
                          value={form.pincode}
                          onChange={handleInput}
                          placeholder="Pincode"
                          maxLength={6}
                        />
                      </div>

                      {/* ERROR */}

                      {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                          {error}
                        </div>
                      )}

                      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                        <button
                          type="submit"
                          disabled={savingAddress}
                          className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-semibold uppercase tracking-[2px] text-white transition ${
                            savingAddress
                              ? "cursor-not-allowed bg-[#999]"
                              : "bg-[#181818] hover:bg-[#C9A96E]"
                          }`}
                        >
                          <Check size={16} />

                          {savingAddress ? "Saving..." : "Save Address"}
                        </button>

                        {address && (
                          <button
                            type="button"
                            onClick={() => {
                              setError("");
                              setShowForm(false);
                            }}
                            className="h-12 rounded-xl border border-[#DDD5C9] px-7 text-xs font-semibold uppercase tracking-[1.5px] transition hover:border-[#C9A96E]"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-[20px] border border-[#E4DED4] bg-[#FCFBF8] p-5 sm:p-6">
                      <div className="flex gap-4">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E9F6EC]">
                          <Check
                            size={16}
                            strokeWidth={3}
                            className="text-[#2F8F46]"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-base font-semibold">
                              {address.fullName}
                            </h3>

                            <span className="rounded-full bg-[#E9F6EC] px-3 py-1 text-[9px] font-bold uppercase tracking-[1px] text-[#2F8F46]">
                              Selected
                            </span>
                          </div>

                          <p className="mt-2 text-sm font-medium text-[#555]">
                            +91 {address.mobile}
                          </p>

                          <p className="mt-3 text-sm leading-6 text-[#777]">
                            {address.address}
                            <br />
                            {address.city}, {address.state} - {address.pincode}
                            <br />
                            India
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  DELIVERY METHOD
              ================================================= */}

              <section className="overflow-hidden rounded-[26px] border border-[#E2DBD0] bg-white">
                <div className="flex items-center gap-4 border-b border-[#ECE7DF] px-6 py-6 sm:px-8">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F0E7]">
                    <Truck size={20} className="text-[#C9A96E]" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
                      Step 02
                    </p>

                    <h2 className="mt-1 font-serif text-2xl font-semibold">
                      Delivery Method
                    </h2>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between rounded-[18px] border border-[#D8B56F] bg-[#FCF8EF] p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                        <Truck size={19} className="text-[#C9A96E]" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold">
                          Standard Delivery
                        </h3>

                        <p className="mt-1 text-xs text-[#777]">
                          2–4 Business Days
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-[#999]">Shipping</p>

                      <p className="mt-1 text-sm font-semibold text-[#2F8F46]">
                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  BENEFITS
              ================================================= */}

              <div className="grid gap-4 sm:grid-cols-3">
                <Benefit
                  icon={<ShieldCheck size={21} />}
                  title="100% Authentic"
                  text="Original fragrances"
                />

                <Benefit
                  icon={<Truck size={21} />}
                  title="Safe Delivery"
                  text="Secure packaging"
                />

                <Benefit
                  icon={<Lock size={21} />}
                  title="Secure Payment"
                  text="Protected checkout"
                />
              </div>
            </section>

            {/* =================================================
                RIGHT ORDER SUMMARY
            ================================================= */}

            <aside className="xl:sticky xl:top-28 xl:self-start">
              <div className="overflow-hidden rounded-[26px] border border-[#E0D9CE] bg-white shadow-[0_20px_60px_rgba(30,25,15,0.07)]">
                {/* SUMMARY HEADER */}

                <div className="border-b border-[#ECE7DF] px-7 py-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
                    Order Summary
                  </p>

                  <div className="mt-2 flex items-end justify-between">
                    <h2 className="font-serif text-3xl font-semibold">
                      Your Order
                    </h2>

                    <span className="text-xs text-[#888]">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>

                {/* PRODUCTS */}

                <div className="border-b border-[#ECE7DF] px-7 py-6">
                  <div className="space-y-5">
                    {cartItems.map((product) => (
                      <OrderProduct key={product.id} product={product} />
                    ))}
                  </div>
                </div>

                {/* PRICE */}

                <div className="px-7 py-7">
                  <div className="space-y-4">
                    <SummaryRow
                      label="Subtotal"
                      value={`₹${subtotal.toLocaleString("en-IN")}`}
                    />

                    <SummaryRow label="Discount" value="-₹0" green />

                    <SummaryRow
                      label="Shipping"
                      value={shipping === 0 ? "FREE" : `₹${shipping}`}
                      green
                    />

                    <SummaryRow
                      label="GST"
                      value={`₹${gst.toLocaleString("en-IN")}`}
                    />
                  </div>

                  <div className="my-6 border-t border-[#ECE7DF]" />

                  <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#999]">
                    Grand Total
                  </p>

                  <h3 className="mt-2 font-serif text-[46px] font-semibold leading-none text-[#181818]">
                    ₹{total.toLocaleString("en-IN")}
                  </h3>

                  {!address && (
                    <div className="mt-5 rounded-[16px] border border-[#E9D99E] bg-[#FFF9E9] p-4">
                      <p className="text-xs font-semibold text-[#80651E]">
                        Add your delivery address
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#9A8142]">
                        Your address is required before proceeding to payment.
                      </p>
                    </div>
                  )}

                  {error && !showForm && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!address}
                    onClick={handleProceedToPay}
                    className={`mt-5 flex h-[54px] w-full items-center justify-center gap-3 rounded-[14px] text-xs font-semibold uppercase tracking-[2px] text-white transition ${
                      address
                        ? "bg-[#181818] hover:bg-[#C9A96E]"
                        : "cursor-not-allowed bg-[#C8C5BF]"
                    }`}
                  >
                    <Lock size={17} />
                    Proceed To Pay
                  </button>

                  <div className="mt-5 flex items-center justify-center gap-2">
                    <ShieldCheck size={15} className="text-[#2F8F46]" />

                    <span className="text-[10px] text-[#888]">
                      Secure payment powered by Razorpay
                    </span>
                  </div>

                  <p className="mt-3 text-center text-[10px] leading-5 text-[#AAA]">
                    By proceeding, you agree to our Terms & Conditions and
                    Privacy Policy.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </Layout>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({ label, name, value, onChange, placeholder, maxLength }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[1.5px] text-[#777]">
        {label}
      </span>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="h-12 w-full rounded-xl border border-[#DED7CC] bg-white px-4 text-sm text-[#181818] outline-none transition placeholder:text-[#B1AAA0] focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E]"
      />
    </label>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

function Benefit({ icon, title, text }) {
  return (
    <div className="rounded-[20px] border border-[#E2DBD0] bg-white p-5">
      <div className="text-[#C9A96E]">{icon}</div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      <p className="mt-1 text-xs text-[#888]">{text}</p>
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({ label, value, green = false }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#777]">{label}</span>

      <span
        className={
          green ? "font-semibold text-[#2F8F46]" : "font-semibold text-[#333]"
        }
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   ORDER PRODUCT
========================================================= */

function OrderProduct({ product }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex gap-4">
      {/* IMAGE */}

      <div className="relative flex h-[86px] w-[72px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-[#F6F2EA]">
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-2"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center">
            <div className="h-12 w-7 rounded-t-lg rounded-b-md bg-gradient-to-b from-[#D5B16F] to-[#9C783C]" />

            <span className="mt-1 text-[6px] font-bold tracking-[1px] text-[#8E713F]">
              ELYVORR
            </span>
          </div>
        )}

        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#181818] px-1 text-[9px] font-bold text-white">
          {product.quantity}
        </span>
      </div>

      {/* INFO */}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-[18px] font-semibold text-[#181818]">
              {product.name}
            </h3>

            <p className="mt-1 text-xs text-[#888]">Eau de Parfum</p>

            <p className="mt-1 text-xs text-[#999]">
              {product.volume} × {product.quantity}
            </p>
          </div>

          <p className="flex-shrink-0 text-sm font-semibold text-[#181818]">
            ₹{(product.price * product.quantity).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
