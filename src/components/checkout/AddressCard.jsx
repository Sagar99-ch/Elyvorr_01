import { MapPin, Plus } from "lucide-react";

function AddressCard({ address, onChange, onAddAddress }) {
  /* =========================================
     NO SAVED ADDRESS
  ========================================= */

  if (!address) {
    return (
      <div className="rounded-[26px] border border-[#E5DFD5] bg-white p-6 shadow-[0_10px_40px_rgba(40,30,10,0.04)] sm:p-8">
        {/* Header */}

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#F5F0E7]">
            <MapPin size={21} strokeWidth={1.8} className="text-[#C9A96E]" />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
              Delivery
            </p>

            <h2 className="mt-1 font-serif text-2xl font-semibold leading-tight text-[#181818]">
              Delivery Address
            </h2>

            <p className="mt-1 text-xs text-[#888]">
              Choose where you want your order delivered.
            </p>
          </div>
        </div>

        {/* Add Address */}

        <button
          type="button"
          onClick={onAddAddress}
          className="
            mt-7
            flex
            min-h-[52px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-[#D8D0C4]
            bg-white
            px-5
            py-4
            text-xs
            font-semibold
            uppercase
            tracking-[2px]
            text-[#181818]
            transition-all
            duration-300
            hover:border-[#C9A96E]
            hover:bg-[#FCF8EF]
            hover:text-[#A6813F]
          "
        >
          <Plus size={16} />
          Add New Address
        </button>
      </div>
    );
  }

  /* =========================================
     SAVED ADDRESS
  ========================================= */

  return (
    <div className="rounded-[26px] border border-[#E5DFD5] bg-white p-6 shadow-[0_10px_40px_rgba(40,30,10,0.04)] sm:p-8">
      {/* Header */}

      <div className="flex items-start justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#F5F0E7]">
            <MapPin size={21} strokeWidth={1.8} className="text-[#C9A96E]" />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
              Delivery
            </p>

            <h2 className="mt-1 font-serif text-2xl font-semibold leading-tight">
              Deliver To
            </h2>

            <p className="mt-1 text-xs text-[#888]">
              Your saved delivery address
            </p>
          </div>
        </div>

        {/* Change */}

        <button
          type="button"
          onClick={onChange}
          className="
            flex
            min-h-[40px]
            items-center
            gap-2
            rounded-full
            border
            border-[#E2DBD0]
            px-4
            py-2
            text-[11px]
            font-semibold
            uppercase
            tracking-[1px]
            text-[#555]
            transition
            hover:border-[#C9A96E]
            hover:text-[#A6813F]
          "
        >
          Change
        </button>
      </div>

      {/* Saved Address */}

      <div className="mt-7 rounded-[20px] border border-[#E8E2D8] bg-[#FCFBF8] p-5 sm:p-6">
        <div className="flex gap-4">
          {/* Selected */}

          <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#EAF7ED]">
            <span className="text-sm font-bold text-[#2F8F46]">✓</span>
          </div>

          {/* Details */}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-base font-semibold text-[#181818]">
                {address.fullName}
              </h3>

              <span className="rounded-full bg-[#EAF7ED] px-3 py-1 text-[9px] font-bold uppercase tracking-[1px] text-[#2F8F46]">
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
              {address.country}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressCard;
