import { useEffect, useState } from "react";

import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Pencil,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { useMutation } from "convex/react";

import { api } from "../../../convex/_generated/api";

function AdminSettingsPage() {
  const updateCredentials = useMutation(api.admin.updateCredentials);

  const [admin, setAdmin] = useState(null);

  const [adminName, setAdminName] = useState("");

  const [adminEdit, setAdminEdit] = useState(false);

  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  // =====================================================
  // LOAD ADMIN
  // =====================================================

  useEffect(() => {
    try {
      const savedAdmin = localStorage.getItem("elyvorr_admin_user");

      if (!savedAdmin) {
        return;
      }

      const parsed = JSON.parse(savedAdmin);

      setAdmin(parsed);

      setAdminName(parsed.fullName || "");

      setEmail(parsed.email || "");
    } catch (error) {
      console.error("Failed to load admin:", error);
    }
  }, []);

  // =====================================================
  // UPDATE ADMIN
  // =====================================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const sessionToken = localStorage.getItem("elyvorr_admin_session");

    if (!sessionToken) {
      setError("Your session has expired. Please login again.");

      return;
    }

    if (!currentPassword) {
      setError("Please enter your current password.");

      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const currentEmail = admin?.email?.trim().toLowerCase() || "";

    const currentName = admin?.fullName?.trim() || "";

    const nameChanged = adminName.trim() !== currentName;

    const emailChanged = normalizedEmail !== currentEmail;

    const passwordChanged = newPassword.length > 0;

    if (!nameChanged && !emailChanged && !passwordChanged) {
      setError("Please change your name, email or password.");

      return;
    }

    if (nameChanged && adminName.trim().length < 2) {
      setError("Name must be at least 2 characters.");

      return;
    }

    if (passwordChanged && newPassword.length < 8) {
      setError("New password must be at least 8 characters.");

      return;
    }

    if (passwordChanged && newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");

      return;
    }

    setLoading(true);

    try {
      const result = await updateCredentials({
        sessionToken,

        currentPassword,

        ...(nameChanged
          ? {
              fullName: adminName.trim(),
            }
          : {}),

        ...(emailChanged
          ? {
              newEmail: normalizedEmail,
            }
          : {}),

        ...(passwordChanged
          ? {
              newPassword,
            }
          : {}),
      });

      if (!result?.success) {
        throw new Error("Unable to update admin details.");
      }

      // =================================================
      // UPDATE LOCAL ADMIN
      // =================================================

      const updatedAdmin = result.admin;

      localStorage.setItem("elyvorr_admin_user", JSON.stringify(updatedAdmin));

      setAdmin(updatedAdmin);

      setAdminName(updatedAdmin.fullName);

      setEmail(updatedAdmin.email);

      setCurrentPassword("");

      setNewPassword("");

      setConfirmPassword("");

      setAdminEdit(false);

      setSuccess("Admin details updated successfully.");
    } catch (error) {
      console.error("Credential update error:", error);

      setError(error?.message || "Unable to update admin details.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CANCEL NAME EDIT
  // =====================================================

  const handleCancelNameEdit = () => {
    setAdminName(admin?.fullName || "");

    setAdminEdit(false);

    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF9F6] px-5 py-8 text-[#181818] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
            Account Settings
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">
            Settings
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#777]">
            Manage your administrator profile, email address and password.
          </p>
        </div>

        {/* =================================================
            ADMINISTRATOR CARD
        ================================================= */}

        <div className="mb-6 rounded-[24px] border border-[#E5DED3] bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* AVATAR */}

              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#F6F0E5]">
                <span className="font-serif text-2xl font-semibold text-[#C9A96E]">
                  {admin?.fullName?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>

              {/* DETAILS */}

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
                  Administrator
                </p>

                <h2 className="mt-1 font-serif text-2xl font-semibold">
                  {admin?.fullName || "Admin"}
                </h2>

                <p className="mt-1 text-sm text-[#777]">{admin?.email || ""}</p>
              </div>
            </div>

            {/* CHANGE BUTTON */}

            <button
              type="button"
              onClick={() => {
                if (adminEdit) {
                  handleCancelNameEdit();
                } else {
                  setAdminEdit(true);
                  setError("");
                  setSuccess("");
                }
              }}
              className="flex items-center justify-center gap-2 rounded-lg border border-[#DDD5C9] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#666] transition hover:border-[#C9A96E] hover:text-[#C9A96E]"
            >
              {adminEdit ? (
                <>
                  <X size={14} />
                  Cancel
                </>
              ) : (
                <>
                  <Pencil size={14} />
                  Change
                </>
              )}
            </button>
          </div>

          {/* =================================================
              NAME EDIT
          ================================================= */}

          {adminEdit && (
            <div className="mt-6 border-t border-[#ECE7DF] pt-6">
              <div className="flex items-center gap-2">
                <UserRound size={16} className="text-[#C9A96E]" />

                <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                  Full Name
                </label>
              </div>

              <div className="relative mt-2">
                <UserRound
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
                />

                <input
                  type="text"
                  value={adminName}
                  onChange={(event) => {
                    setAdminName(event.target.value);

                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] pl-11 pr-4 text-sm outline-none transition focus:border-[#C9A96E]"
                />
              </div>

              <p className="mt-2 text-xs text-[#999]">
                Your current password is required when saving this change.
              </p>
            </div>
          )}
        </div>

        {/* =================================================
            SETTINGS FORM
        ================================================= */}

        <form
          onSubmit={handleUpdate}
          className="rounded-[24px] border border-[#E5DED3] bg-white p-6 sm:p-8"
        >
          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="mb-7 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
              <Check size={18} className="mt-0.5 flex-shrink-0" />

              <p>{success}</p>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-7 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-5 text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              EMAIL
          ================================================= */}

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F0E5]">
                <Mail size={18} className="text-[#C9A96E]" />
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Email Address
                </h2>

                <p className="text-xs text-[#888]">
                  This email will be used for your next admin login.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                Admin Gmail
              </label>

              <div className="relative mt-2">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);

                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter new email address"
                  autoComplete="email"
                  className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] pl-11 pr-4 text-sm outline-none transition focus:border-[#C9A96E]"
                />
              </div>
            </div>
          </div>

          {/* DIVIDER */}

          <div className="my-9 border-t border-[#ECE7DF]" />

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F0E5]">
                <KeyRound size={18} className="text-[#C9A96E]" />
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Change Password
                </h2>

                <p className="text-xs text-[#888]">
                  Use at least 8 characters.
                </p>
              </div>
            </div>

            {/* CURRENT PASSWORD */}

            <div className="mt-5">
              <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                Current Password
              </label>

              <div className="relative mt-2">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
                />

                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);

                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] pl-11 pr-12 text-sm outline-none transition focus:border-[#C9A96E]"
                />

                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] transition hover:text-[#181818]"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* NEW PASSWORD */}

            <div className="mt-5">
              <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                New Password
              </label>

              <div className="relative mt-2">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
                />

                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);

                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] pl-11 pr-12 text-sm outline-none transition focus:border-[#C9A96E]"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] transition hover:text-[#181818]"
                >
                  {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="mt-5">
              <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                Confirm New Password
              </label>

              <div className="relative mt-2">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
                />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);

                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="h-13 w-full rounded-xl border border-[#E1DAD0] bg-[#FCFBF9] pl-11 pr-12 text-sm outline-none transition focus:border-[#C9A96E]"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] transition hover:text-[#181818]"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="mt-8 flex items-start gap-3 rounded-xl bg-[#F9F7F3] p-4">
            <ShieldCheck
              size={18}
              className="mt-0.5 flex-shrink-0 text-[#2F8F46]"
            />

            <p className="text-xs leading-5 text-[#777]">
              Your current password is required to make account changes.
              Passwords are securely hashed and are never stored as plain text.
            </p>
          </div>

          {/* =================================================
              SAVE
          ================================================= */}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#181818] text-xs font-semibold uppercase tracking-[2px] text-white transition hover:bg-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
          >
            <Save size={17} />

            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminSettingsPage;
