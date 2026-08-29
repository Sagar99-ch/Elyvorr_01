import { useEffect, useState } from "react";

import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  X,
} from "lucide-react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";

// =====================================================
// NAVIGATION
// =====================================================

const navItems = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: ClipboardList,
  },
  {
    name: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    name: "Inventory",
    path: "/admin/inventory",
    icon: BarChart3,
  },
  {
    name: "Inquiries",
    path: "/admin/inquiries",
    icon: ShoppingBag,
  },
];

// =====================================================
// ADMIN LAYOUT
// =====================================================

function AdminLayout() {
  const navigate = useNavigate();

  // ===================================================
  // SESSION
  // ===================================================

  const [sessionToken, setSessionToken] = useState(() =>
    localStorage.getItem("elyvorr_admin_session")
  );

  // ===================================================
  // ADMIN SESSION QUERY
  // ===================================================

  const admin = useQuery(
    api.admin.verifySession,
    sessionToken
      ? {
          sessionToken,
        }
      : "skip"
  );

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = useMutation(api.admin.logout);

  // ===================================================
  // UI STATE
  // ===================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  // ===================================================
  // KEEP LOCAL ADMIN DATA UPDATED
  // ===================================================

  useEffect(() => {
    if (!admin) {
      return;
    }

    const updatedAdmin = {
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
    };

    localStorage.setItem("elyvorr_admin_user", JSON.stringify(updatedAdmin));
  }, [admin]);

  // ===================================================
  // SESSION INVALID / EXPIRED
  // ===================================================

  useEffect(() => {
    if (sessionToken && admin === null) {
      localStorage.removeItem("elyvorr_admin_session");

      localStorage.removeItem("elyvorr_admin_user");

      setSessionToken(null);

      navigate("/admin/login");
    }
  }, [admin, sessionToken, navigate]);

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = async () => {
    const currentSessionToken = localStorage.getItem("elyvorr_admin_session");

    try {
      if (currentSessionToken) {
        await logout({
          sessionToken: currentSessionToken,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("elyvorr_admin_session");

      localStorage.removeItem("elyvorr_admin_user");

      setSessionToken(null);

      navigate("/admin/login");
    }
  };

  // ===================================================
  // ADMIN DISPLAY DATA
  // ===================================================

  const adminName = admin?.fullName || "Administrator";

  const adminEmail = admin?.email || "";

  const adminInitial = adminName.trim().charAt(0).toUpperCase() || "A";

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#181818]">
      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          flex-col
          border-r
          border-[#E7E1D7]
          bg-white
          transition-all
          duration-300
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "w-[82px]" : "w-[260px]"}
        `}
      >
        {/* =================================================
            LOGO
        ================================================= */}

        <div className="flex h-24 items-center justify-between border-b border-[#ECE7DF] px-5">
          {!collapsed && (
            <div>
              <p className="font-serif text-2xl font-semibold tracking-[4px]">
                ELYVORR
              </p>

              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
                Admin Panel
              </p>
            </div>
          )}

          {collapsed && (
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F0E5]">
              <span className="font-serif text-xl font-semibold text-[#C9A96E]">
                E
              </span>
            </div>
          )}

          {/* Mobile close */}

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-full p-2 text-[#777] transition hover:bg-[#F6F2EA] hover:text-[#181818] lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 space-y-1 px-3 py-6">
          {!collapsed && (
            <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[2px] text-[#AAA]">
              Management
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-medium
                    transition
                    ${
                      isActive
                        ? "bg-[#F6F0E5] text-[#A6813F]"
                        : "text-[#666] hover:bg-[#FAF7F1] hover:text-[#181818]"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `
                }
              >
                <Icon size={19} strokeWidth={1.8} />

                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}

          {!collapsed && (
            <p className="mb-3 mt-8 px-3 text-[9px] font-semibold uppercase tracking-[2px] text-[#AAA]">
              System
            </p>
          )}

          {/* =================================================
              SETTINGS
          ================================================= */}

          <NavLink
            to="/admin/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `
              flex
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-sm
              font-medium
              transition
              ${
                isActive
                  ? "bg-[#F6F0E5] text-[#A6813F]"
                  : "text-[#666] hover:bg-[#FAF7F1] hover:text-[#181818]"
              }
              ${collapsed ? "justify-center" : ""}
            `
            }
          >
            <Settings size={19} strokeWidth={1.8} />

            {!collapsed && <span>Settings</span>}
          </NavLink>
        </nav>

        {/* =================================================
            COLLAPSE
        ================================================= */}

        <div className="hidden border-t border-[#ECE7DF] p-3 lg:block">
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs text-[#777] transition hover:bg-[#F8F5EF] hover:text-[#181818]"
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                Collapse
              </>
            )}
          </button>
        </div>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="border-t border-[#ECE7DF] p-3">
          <button
            type="button"
            onClick={handleLogout}
            className={`
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-sm
              font-medium
              text-[#777]
              transition
              hover:bg-red-50
              hover:text-red-600
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={19} strokeWidth={1.8} />

            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <div
        className={`
          min-h-screen
          transition-all
          duration-300
          ${collapsed ? "lg:pl-[82px]" : "lg:pl-[260px]"}
        `}
      >
        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="sticky top-0 z-30 border-b border-[#E7E1D7] bg-white/95 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-5 sm:px-8">
            {/* Mobile menu */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-full p-2 text-[#555] transition hover:bg-[#F6F2EA] lg:hidden"
            >
              <Menu size={23} />
            </button>

            {/* Page title */}

            <div className="hidden sm:block">
              <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
                ELYVORR
              </p>

              <p className="mt-1 font-serif text-xl font-semibold">
                Admin Panel
              </p>
            </div>

            {/* =================================================
                RIGHT ADMIN PROFILE
            ================================================= */}

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold">{adminName}</p>

                <p className="mt-0.5 text-[10px] text-[#999]">Administrator</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181818] text-sm font-semibold text-white">
                {adminInitial}
              </div>
            </div>
          </div>
        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main className="px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
