import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";

import { api } from "../../../convex/_generated/api";

function AdminLoginPage() {
  const navigate = useNavigate();

  const login = useMutation(api.admin.login);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const result = await login({
        email: form.email,
        password: form.password,
      });

      if (!result?.success) {
        throw new Error("Login failed.");
      }

      // =================================================
      // STORE SESSION
      // =================================================

      localStorage.setItem("elyvorr_admin_session", result.sessionToken);

      localStorage.setItem("elyvorr_admin_user", JSON.stringify(result.admin));

      // =================================================
      // ADMIN DASHBOARD
      // =================================================

      navigate("/admin");
    } catch (error) {
      setError(error?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-10 text-[#181818]">
      {/* =================================================
          BACK
      ================================================= */}

      <button
        type="button"
        onClick={() => navigate("/")}
        className="mx-auto flex w-full max-w-md items-center gap-2 text-sm text-[#777] transition hover:text-[#C9A96E]"
      >
        <ArrowLeft size={17} />
        Back to website
      </button>

      {/* =================================================
          CARD
      ================================================= */}

      <div className="mx-auto mt-8 w-full max-w-[460px]">
        <div className="rounded-[28px] border border-[#E5DED3] bg-white px-6 py-8 shadow-[0_25px_80px_rgba(30,25,20,0.07)] sm:px-10 sm:py-10">
          {/* =================================================
              LOGO
          ================================================= */}

          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F6F0E5]">
              <span className="font-serif text-2xl font-semibold text-[#C9A96E]">
                E
              </span>
            </div>

            <p className="mt-5 font-serif text-3xl font-semibold tracking-[5px]">
              ELYVORR
            </p>

            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[4px] text-[#C9A96E]">
              Fragrance
            </p>
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <div className="mt-8 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
              Secure Access
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-[#777]">
              Sign in to manage your ELYVORR store.
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs leading-5 text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* EMAIL */}

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                Email Address
              </label>

              <div className="relative mt-2">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                  className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] pl-11 pr-4 text-sm outline-none transition focus:border-[#C9A96E]"
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                Password
              </label>

              <div className="relative mt-2">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] pl-11 pr-12 text-sm outline-none transition focus:border-[#C9A96E]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] transition hover:text-[#181818]"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#181818] text-xs font-semibold uppercase tracking-[2px] text-white transition hover:bg-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Login"}
            </button>
          </form>

          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="mt-7 flex items-center justify-center gap-2 text-[11px] text-[#888]">
            <ShieldCheck size={15} className="text-[#2F8F46]" />
            Secure admin authentication
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminLoginPage;
