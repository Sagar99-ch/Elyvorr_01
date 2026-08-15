import { useState } from "react";
import { ArrowLeft, Check, MapPin, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";

// import { api } from "../../convex/_generated/api";
import { api } from "../../../convex/_generated/api";

function getSessionId() {
  const storageKey = "elyvorr_session_id";

  let sessionId = localStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

function AddressPage() {
  const navigate = useNavigate();

  const [sessionId] = useState(() => getSessionId());

  const savedAddress = useQuery(api.addresses.getAddress, {
    sessionId,
  });

  const saveAddress = useMutation(api.addresses.saveAddress);

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      newErrors.mobile = "Enter a valid 10 digit mobile number";
    }

    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!form.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Enter a valid 6 digit pincode";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSaving(true);

    try {
      await saveAddress({
        sessionId,

        fullName: form.fullName.trim(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      });

      navigate("/checkout/payment");
    } catch (error) {
      console.error("Failed to save address:", error);

      setErrors({
        submit: "Unable to save your address. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = (field) =>
    `mt-2 w-full rounded-xl border bg-white px-4 py-4 text-sm text-[#181818] outline-none transition ${
      errors[field]
        ? "border-red-400 focus:border-red-400"
        : "border-[#E4DED4] focus:border-[#C9A96E]"
    }`;

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      {/* ================= TOP BAR ================= */}

      <div className="border-b border-[#E8E2D8] bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-[#555] transition hover:text-[#C9A96E]"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="text-center">
            <p className="font-serif text-2xl font-semibold tracking-[4px]">
              ELYVORR
            </p>

            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
              Secure Checkout
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#777]">
            <ShieldCheck size={16} className="text-[#C9A96E]" />
            Secure
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}

      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          {/* ================= HEADER ================= */}

          <div className="mb-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F3EBDD]">
              <MapPin size={25} className="text-[#C9A96E]" />
            </div>

            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[4px] text-[#C9A96E]">
              Step 01
            </p>

            <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">
              Delivery Address
            </h1>

            <p className="mt-3 text-sm text-[#777]">
              Where should we deliver your fragrance?
            </p>
          </div>

          {/* ================= SAVED ADDRESS ================= */}

          {savedAddress && (
            <div className="mb-6 rounded-[24px] border border-[#E5DED3] bg-white p-6 shadow-[0_20px_70px_rgba(30,25,20,0.05)] sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#EAF7ED]">
                  <Check size={18} className="text-[#2F8F46]" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
                    Saved Address
                  </p>

                  <h2 className="mt-1 font-serif text-2xl font-semibold">
                    {savedAddress.fullName}
                  </h2>

                  <p className="mt-2 text-sm text-[#555]">
                    +91 {savedAddress.mobile}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#777]">
                    {savedAddress.address}
                    <br />
                    {savedAddress.city}, {savedAddress.state} -{" "}
                    {savedAddress.pincode}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= FORM ================= */}

          <form
            onSubmit={handleSaveAddress}
            className="rounded-[28px] border border-[#E5DED3] bg-white p-6 shadow-[0_20px_70px_rgba(30,25,20,0.06)] sm:p-10"
          >
            <div className="grid gap-7 sm:grid-cols-2">
              {/* NAME */}

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[2px] text-[#555]">
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={inputClass("fullName")}
                />

                {errors.fullName && (
                  <p className="mt-2 text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* MOBILE */}

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[2px] text-[#555]">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="10 digit mobile number"
                  className={inputClass("mobile")}
                />

                {errors.mobile && (
                  <p className="mt-2 text-xs text-red-500">{errors.mobile}</p>
                )}
              </div>

              {/* ADDRESS */}

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-[2px] text-[#555]">
                  Complete Address
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={4}
                  placeholder="House no., street, area"
                  className={`${inputClass("address")} resize-none`}
                />

                {errors.address && (
                  <p className="mt-2 text-xs text-red-500">{errors.address}</p>
                )}
              </div>

              {/* CITY */}

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[2px] text-[#555]">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={inputClass("city")}
                />

                {errors.city && (
                  <p className="mt-2 text-xs text-red-500">{errors.city}</p>
                )}
              </div>

              {/* STATE */}

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[2px] text-[#555]">
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={inputClass("state")}
                />

                {errors.state && (
                  <p className="mt-2 text-xs text-red-500">{errors.state}</p>
                )}
              </div>

              {/* PINCODE */}

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-[2px] text-[#555]">
                  Pincode
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="6 digit pincode"
                  className={inputClass("pincode")}
                />

                {errors.pincode && (
                  <p className="mt-2 text-xs text-red-500">{errors.pincode}</p>
                )}
              </div>
            </div>

            {/* SUBMIT ERROR */}

            {errors.submit && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                {errors.submit}
              </div>
            )}

            {/* SAVE */}

            <button
              type="submit"
              disabled={isSaving}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-[#181818] py-4 text-sm font-semibold uppercase tracking-[2px] text-white transition duration-300 hover:bg-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check size={18} />

              {isSaving ? "Saving Address..." : "Save Address & Continue"}
            </button>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#888]">
              <ShieldCheck size={15} className="text-[#2F8F46]" />
              Your information is securely handled
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default AddressPage;
