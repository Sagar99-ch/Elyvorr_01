import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function AdminDashboard() {
  // =====================================================
  // REAL CONVEX DATA
  // =====================================================

  const dashboard = useQuery(api.adminDashboard.getDashboardStats);

  // =====================================================
  // LOADING
  // =====================================================

  if (dashboard === undefined) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#E7E1D7] border-t-[#C9A96E]" />

          <p className="mt-4 text-sm text-[#888]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // STATS
  // =====================================================

  const stats = [
    {
      title: "Total Orders",
      value: dashboard.totalOrders,
      description: "All time orders",
      icon: ClipboardList,
    },
    {
      title: "Revenue",
      value: `₹${dashboard.revenue.toLocaleString("en-IN")}`,
      description: "Paid orders",
      icon: IndianRupee,
    },
    {
      title: "Products",
      value: dashboard.activeProducts,
      description: "Active fragrances",
      icon: Package,
    },
    {
      title: "Pending Orders",
      value: dashboard.pendingOrders,
      description: "Need attention",
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
            Overview
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Dashboard
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#777]">
            Welcome back. Here's what's happening with your ELYVORR store.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full border border-[#E5DED3] bg-white px-4 py-2.5 text-xs text-[#777]">
          <span className="h-2 w-2 rounded-full bg-[#2F8F46]" />
          Store Active
        </div>
      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group rounded-[22px] border border-[#E7E1D7] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(30,25,20,0.07)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F6F0E5] text-[#C9A96E]">
                  <Icon size={20} strokeWidth={1.8} />
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-[#CFC7BB] transition group-hover:text-[#C9A96E]"
                />
              </div>

              <p className="mt-6 text-xs font-medium text-[#888]">
                {stat.title}
              </p>

              <p className="mt-1 font-serif text-3xl font-semibold">
                {stat.value}
              </p>

              <p className="mt-2 text-[11px] text-[#AAA]">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <section className="rounded-[24px] border border-[#E7E1D7] bg-white">
          <div className="flex items-center justify-between border-b border-[#ECE7DF] px-5 py-5 sm:px-6">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
                Orders
              </p>

              <h2 className="mt-1 font-serif text-2xl font-semibold">
                Recent Orders
              </h2>
            </div>

            <button
              type="button"
              onClick={() => (window.location.href = "/admin/orders")}
              className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#777] transition hover:text-[#C9A96E]"
            >
              View All
              <ArrowUpRight size={14} />
            </button>
          </div>

          {dashboard.recentOrders.length > 0 ? (
            <div className="divide-y divide-[#F0ECE5]">
              {dashboard.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {order.orderNumber}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#888]">
                      {order.customerName}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      ₹{order.total.toLocaleString("en-IN")}
                    </p>

                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[1px] ${
                        order.paymentStatus === "paid"
                          ? "bg-[#EAF7ED] text-[#2F8F46]"
                          : "bg-[#FFF5E6] text-[#C98A2E]"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F6F0E5]">
                <ClipboardList
                  size={23}
                  className="text-[#C9A96E]"
                  strokeWidth={1.7}
                />
              </div>

              <h3 className="mt-5 font-serif text-xl font-semibold">
                No orders yet
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-6 text-[#888]">
                Once customers place orders, your latest orders will appear
                here.
              </p>
            </div>
          )}
        </section>

        {/* =================================================
            INVENTORY
        ================================================= */}

        <section className="rounded-[24px] border border-[#E7E1D7] bg-white">
          <div className="border-b border-[#ECE7DF] px-5 py-5">
            <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
              Stock
            </p>

            <div className="mt-1 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold">Inventory</h2>

              <Package size={19} className="text-[#C9A96E]" />
            </div>
          </div>

          <div className="p-5">
            {/* STOCK STATUS */}

            <div className="rounded-2xl border border-[#E8E2D8] bg-[#FCFBF8] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF7ED]">
                  <TrendingUp size={18} className="text-[#2F8F46]" />
                </div>

                <div>
                  <p className="text-xs font-semibold">Stock Status</p>

                  <p className="mt-1 text-[10px] text-[#888]">
                    Current inventory overview
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="font-serif text-3xl font-semibold">
                    {dashboard.activeProducts}
                  </p>

                  <p className="mt-1 text-[10px] text-[#888]">
                    Active products
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[1px] ${
                    dashboard.lowStockCount > 0
                      ? "bg-[#FFF5E6] text-[#C98A2E]"
                      : "bg-[#EAF7ED] text-[#2F8F46]"
                  }`}
                >
                  {dashboard.lowStockCount > 0 ? "Attention" : "Healthy"}
                </span>
              </div>
            </div>

            {/* LOW STOCK */}

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#EEE7DB] px-4 py-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#FFF5E6]">
                <AlertTriangle size={17} className="text-[#C98A2E]" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold">Low Stock</p>

                <p className="mt-1 text-[10px] text-[#999]">
                  {dashboard.lowStockCount === 0
                    ? "No products need attention"
                    : `${dashboard.lowStockCount} product${
                        dashboard.lowStockCount > 1 ? "s" : ""
                      } need attention`}
                </p>
              </div>
            </div>

            {/* LOW STOCK PRODUCTS */}

            {dashboard.lowStockProducts.length > 0 && (
              <div className="mt-4 space-y-2">
                {dashboard.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl bg-[#FCFBF8] px-4 py-3"
                  >
                    <p className="truncate pr-3 text-xs font-medium">
                      {product.name}
                    </p>

                    <span className="flex-shrink-0 text-xs font-semibold text-[#C98A2E]">
                      {product.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section className="mt-6 rounded-[24px] border border-[#E7E1D7] bg-white p-5 sm:p-6">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
            Quick Actions
          </p>

          <h2 className="mt-1 font-serif text-2xl font-semibold">
            Manage Store
          </h2>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => (window.location.href = "/admin/products")}
            className="flex items-center gap-3 rounded-xl border border-[#E5DED3] px-4 py-4 text-left transition hover:border-[#C9A96E] hover:bg-[#FCF8EF]"
          >
            <Package size={18} className="text-[#C9A96E]" />

            <div>
              <p className="text-xs font-semibold">Add Product</p>

              <p className="mt-1 text-[10px] text-[#999]">Add new fragrance</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "/admin/orders")}
            className="flex items-center gap-3 rounded-xl border border-[#E5DED3] px-4 py-4 text-left transition hover:border-[#C9A96E] hover:bg-[#FCF8EF]"
          >
            <ClipboardList size={18} className="text-[#C9A96E]" />

            <div>
              <p className="text-xs font-semibold">View Orders</p>

              <p className="mt-1 text-[10px] text-[#999]">
                Manage customer orders
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "/admin/inventory")}
            className="flex items-center gap-3 rounded-xl border border-[#E5DED3] px-4 py-4 text-left transition hover:border-[#C9A96E] hover:bg-[#FCF8EF]"
          >
            <Package size={18} className="text-[#C9A96E]" />

            <div>
              <p className="text-xs font-semibold">Inventory</p>

              <p className="mt-1 text-[10px] text-[#999]">
                Manage stock levels
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "/admin/enquiries")}
            className="flex items-center gap-3 rounded-xl border border-[#E5DED3] px-4 py-4 text-left transition hover:border-[#C9A96E] hover:bg-[#FCF8EF]"
          >
            <ShoppingBag size={18} className="text-[#C9A96E]" />

            <div>
              <p className="text-xs font-semibold">Enquiries</p>

              <p className="mt-1 text-[10px] text-[#999]">Customer messages</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
