import { CheckCircle2, ArrowRight, ShoppingBag } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const orderNumber = params.get("order");

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-10 text-[#181818]">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-[#E5DED3] bg-white px-6 py-12 text-center shadow-[0_25px_80px_rgba(30,25,20,0.07)] sm:px-12">
          {/* SUCCESS ICON */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#F3F8F1]">
            <CheckCircle2
              size={54}
              strokeWidth={1.7}
              className="text-[#2F8F46]"
            />
          </div>

          {/* BRAND */}
          <p className="mt-8 font-serif text-2xl font-semibold tracking-[5px]">
            ELYVORR
          </p>

          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[4px] text-[#C9A96E]">
            Fragrance
          </p>

          {/* TITLE */}
          <h1 className="mt-8 font-serif text-4xl font-semibold sm:text-5xl">
            Payment Successful
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#777]">
            Thank you for your order. Your payment has been successfully
            received and your order has been confirmed.
          </p>

          {/* ORDER NUMBER */}
          {orderNumber && (
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#E5DED3] bg-[#FCFBF9] px-5 py-4">
              <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#999]">
                Order Number
              </p>

              <p className="mt-2 break-all font-serif text-lg font-semibold">
                {orderNumber}
              </p>
            </div>
          )}

          {/* STATUS */}
          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-xl bg-[#F3F8F1] px-4 py-3 text-xs font-medium text-[#2F8F46]">
            <CheckCircle2 size={16} />
            Payment confirmed
          </div>

          {/* BUTTONS */}
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#DCD4C9] bg-white text-xs font-semibold uppercase tracking-[1.5px] transition hover:border-[#C9A96E] hover:text-[#C9A96E]"
            >
              Continue Shopping
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/collection")}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#181818] text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#C9A96E]"
            >
              <ShoppingBag size={16} />
              Shop Collection
            </button>
          </div>

          {/* FOOTER MESSAGE */}
          <p className="mt-8 text-[11px] leading-5 text-[#999]">
            Please keep your order number for future reference.
          </p>
        </div>
      </div>
    </main>
  );
}

export default OrderSuccessPage;
