import { useState } from "react";
import { MapPin, X } from "lucide-react";

function AddressForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave(formData);
  };

  return (
    <div className="rounded-[24px] border border-[#E7E1D7] bg-white p-6 sm:p-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F0E7]">
            <MapPin size={20} className="text-[#C9A96E]" />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold">
              Add Delivery Address
            </h2>

            <p className="mt-1 text-xs text-[#888]">
              Enter your delivery details.
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DED3] transition hover:bg-[#181818] hover:text-white"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Form */}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {/* Name */}

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#555]">
            Full Name
          </label>

          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
            className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] px-4 text-sm outline-none transition focus:border-[#C9A96E]"
          />
        </div>

        {/* Mobile */}

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#555]">
            Mobile Number
          </label>

          <input
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
            maxLength={10}
            inputMode="numeric"
            placeholder="10 digit mobile number"
            className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] px-4 text-sm outline-none transition focus:border-[#C9A96E]"
          />
        </div>

        {/* Address */}

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#555]">
            Address
          </label>

          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows="3"
            placeholder="House no., street, area"
            className="w-full resize-none rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] px-4 py-3 text-sm outline-none transition focus:border-[#C9A96E]"
          />
        </div>

        {/* City + State */}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#555]">
              City
            </label>

            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="City"
              className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] px-4 text-sm outline-none transition focus:border-[#C9A96E]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#555]">
              State
            </label>

            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              placeholder="State"
              className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] px-4 text-sm outline-none transition focus:border-[#C9A96E]"
            />
          </div>
        </div>

        {/* Pincode + Country */}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#555]">
              Pincode
            </label>

            <input
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
              maxLength={6}
              inputMode="numeric"
              placeholder="Enter pincode"
              className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] px-4 text-sm outline-none transition focus:border-[#C9A96E]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#555]">
              Country
            </label>

            <input
              name="country"
              value={formData.country}
              readOnly
              className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#F4F1EB] px-4 text-sm text-[#777] outline-none"
            />
          </div>
        </div>

        {/* Save */}

        <button
          type="submit"
          className="w-full rounded-xl bg-[#181818] py-4 text-xs font-semibold uppercase tracking-[2px] text-white transition hover:bg-[#C9A96E]"
        >
          Save & Continue
        </button>
      </form>
    </div>
  );
}

export default AddressForm;
