import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Eye,
  IndianRupee,
  MapPin,
  Package,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function AdminOrdersPage() {
  // =====================================================
  // CONVEX
  // =====================================================

  const orders = useQuery(api.orders.getAllOrders);

  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  const deleteOrder = useMutation(api.orders.deleteOrder);

  // =====================================================
  // FILTER STATE
  // =====================================================

  const [search, setSearch] = useState("");

  const [paymentFilter, setPaymentFilter] = useState("all");

  const [selectedYear, setSelectedYear] = useState("all");

  const [selectedDate, setSelectedDate] = useState("");

  // =====================================================
  // MODAL / ACTION STATE
  // =====================================================

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [updatingOrder, setUpdatingOrder] = useState(null);

  const [deletingOrder, setDeletingOrder] = useState(null);

  const [error, setError] = useState("");

  // =====================================================
  // PAYMENT FILTER OPTIONS
  // =====================================================

  const paymentOptions = [
    {
      value: "all",
      label: "All Payments",
    },
    {
      value: "paid",
      label: "Paid",
    },
    {
      value: "pending",
      label: "Pending",
    },
    {
      value: "failed",
      label: "Failed",
    },
    {
      value: "cancelled",
      label: "Cancelled",
    },
    {
      value: "refunded",
      label: "Refunded",
    },
  ];

  // =====================================================
  // ORDER STATUS OPTIONS
  // =====================================================

  const orderStatusOptions = [
    "pending",
    "confirmed",
    "processing",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  // =====================================================
  // AVAILABLE YEARS
  // =====================================================

  const availableYears = useMemo(() => {
    if (!orders) {
      return [];
    }

    const years = new Set();

    orders.forEach((order) => {
      if (!order.createdAt) return;

      years.add(new Date(order.createdAt).getFullYear());
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);

  // =====================================================
  // FILTERED ORDERS
  // =====================================================

  const filteredOrders = useMemo(() => {
    if (!orders) {
      return [];
    }

    const searchText = search.trim().toLowerCase();

    return orders.filter((order) => {
      // ================= SEARCH =================

      const matchesSearch =
        !searchText ||
        order.orderNumber?.toLowerCase().includes(searchText) ||
        order.customerName?.toLowerCase().includes(searchText) ||
        order.mobile?.toLowerCase().includes(searchText);

      // ================= PAYMENT =================

      const matchesPayment =
        paymentFilter === "all" ||
        order.paymentStatus?.toLowerCase() === paymentFilter;

      // ================= YEAR =================

      const orderDate = new Date(order.createdAt);

      const matchesYear =
        selectedYear === "all" ||
        orderDate.getFullYear() === Number(selectedYear);

      // ================= DATE =================

      const localDate = `${orderDate.getFullYear()}-${String(
        orderDate.getMonth() + 1
      ).padStart(2, "0")}-${String(orderDate.getDate()).padStart(2, "0")}`;

      const matchesDate = !selectedDate || localDate === selectedDate;

      return matchesSearch && matchesPayment && matchesYear && matchesDate;
    });
  }, [orders, search, paymentFilter, selectedYear, selectedDate]);

  // =====================================================
  // GROUP ORDERS BY DATE
  // =====================================================

  const groupedOrders = useMemo(() => {
    const groups = {};

    filteredOrders.forEach((order) => {
      const date = new Date(order.createdAt);

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;

      if (!groups[key]) {
        groups[key] = {
          key,
          timestamp: order.createdAt,
          orders: [],
          revenue: 0,
        };
      }

      groups[key].orders.push(order);

      // Revenue only from paid orders
      if (order.paymentStatus?.toLowerCase() === "paid") {
        groups[key].revenue += order.total || 0;
      }
    });

    return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
  }, [filteredOrders]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalOrders = filteredOrders.length;

  const paidOrders = filteredOrders.filter(
    (order) => order.paymentStatus?.toLowerCase() === "paid"
  );

  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  const customers = new Set(filteredOrders.map((order) => order.mobile)).size;

  const averageOrderValue =
    paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // TIME FORMAT
  // =====================================================

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // PAYMENT STATUS STYLE
  // =====================================================

  const getPaymentStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-[#EAF7ED] text-[#2F8F46]";

      case "pending":
        return "bg-[#FFF6E5] text-[#B78325]";

      case "failed":
        return "bg-[#FFF0F0] text-[#C65353]";

      case "cancelled":
        return "bg-[#F1EFEC] text-[#777]";

      case "refunded":
        return "bg-[#F3EEFF] text-[#7553B3]";

      default:
        return "bg-[#F1EFEC] text-[#777]";
    }
  };

  // =====================================================
  // ORDER STATUS STYLE
  // =====================================================

  const getOrderStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-[#FFF6E5] text-[#B78325]";

      case "confirmed":
        return "bg-[#EAF7ED] text-[#2F8F46]";

      case "processing":
        return "bg-[#F3EEFF] text-[#7553B3]";

      case "packed":
        return "bg-[#F6F0E5] text-[#9A7137]";

      case "shipped":
        return "bg-[#EEF7F7] text-[#347C7C]";

      case "delivered":
        return "bg-[#EAF7ED] text-[#2F8F46]";

      case "cancelled":
        return "bg-[#FFF0F0] text-[#C65353]";

      default:
        return "bg-[#F1EFEC] text-[#777]";
    }
  };

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const handleStatusChange = async (order, newStatus) => {
    const normalizedStatus = String(newStatus || "")
      .trim()
      .toLowerCase();
    const currentStatus = String(order.orderStatus || "")
      .trim()
      .toLowerCase();

    if (!normalizedStatus || currentStatus === normalizedStatus) {
      return;
    }

    setUpdatingOrder(order._id);
    setError("");

    try {
      await updateOrderStatus({
        orderId: order._id,
        orderStatus: normalizedStatus,
      });
    } catch (err) {
      console.error("ELYVORR: Failed to update order status:", err);

      setError(err?.message || "Unable to update order status.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // =====================================================
  // DELETE ORDER
  // =====================================================

  const handleDeleteOrder = async (order) => {
    const confirmed = window.confirm(
      `Delete ${order.orderNumber}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingOrder(order._id);
    setError("");

    try {
      await deleteOrder({
        orderId: order._id,
      });

      if (selectedOrder?._id === order._id) {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to delete order.");
    } finally {
      setDeletingOrder(null);
    }
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setPaymentFilter("all");
    setSelectedYear("all");
    setSelectedDate("");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (orders === undefined) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#E7E1D7] border-t-[#C9A96E]" />

          <p className="mt-4 text-sm text-[#888]">Loading orders...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="mx-auto max-w-[1450px]">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
            Store Management
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Order History
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#777]">
            Search, filter and manage customer orders by payment status and
            date.
          </p>
        </div>

        {/* YEAR */}

        <div className="flex items-center gap-2 rounded-xl border border-[#E5DED3] bg-white px-4 py-3">
          <CalendarDays size={18} className="text-[#C9A96E]" />

          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="bg-transparent text-sm font-semibold outline-none"
          >
            <option value="all">All Years</option>

            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <ChevronDown size={15} className="text-[#777]" />
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Orders"
          value={totalOrders}
          icon={<ClipboardList size={19} />}
        />

        <SummaryCard
          title="Paid Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={<IndianRupee size={19} />}
        />

        <SummaryCard
          title="Average Paid Order"
          value={`₹${averageOrderValue.toLocaleString("en-IN")}`}
          icon={<CheckCircle2 size={19} />}
        />

        <SummaryCard
          title="Customers"
          value={customers}
          icon={<User size={19} />}
        />
      </div>

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="mt-6 rounded-[22px] border border-[#E7E1D7] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_200px_200px_auto]">
          {/* SEARCH */}

          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAA]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order number, customer or mobile..."
              className="h-12 w-full rounded-xl border border-[#E5DED3] bg-[#FCFBF8] pl-11 pr-4 text-sm outline-none transition focus:border-[#C9A96E]"
            />
          </div>

          {/* PAYMENT FILTER */}

          <div className="relative">
            <select
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-4 pr-10 text-sm font-medium outline-none transition focus:border-[#C9A96E]"
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Payment: {option.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#999]"
            />
          </div>

          {/* DATE */}

          <div className="relative">
            <CalendarDays
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
            />

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#E5DED3] bg-[#FCFBF8] pl-11 pr-4 text-sm outline-none transition focus:border-[#C9A96E]"
            />
          </div>

          {/* CLEAR */}

          <button
            type="button"
            onClick={clearFilters}
            className="h-12 rounded-xl border border-[#C9A96E] px-5 text-xs font-semibold uppercase tracking-[1px] text-[#A47A36] transition hover:bg-[#C9A96E] hover:text-white"
          >
            Clear
          </button>
        </div>
      </div>

      {/* =================================================
          ACTIVE FILTER INFO
      ================================================= */}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#777]">
          Showing{" "}
          <span className="font-semibold text-[#181818]">
            {filteredOrders.length}
          </span>{" "}
          orders
        </p>

        <div className="flex flex-wrap gap-2">
          {paymentFilter !== "all" && (
            <FilterBadge
              label={`Payment: ${
                paymentFilter.charAt(0).toUpperCase() + paymentFilter.slice(1)
              }`}
            />
          )}

          {selectedYear !== "all" && (
            <FilterBadge label={`Year: ${selectedYear}`} />
          )}

          {selectedDate && (
            <FilterBadge
              label={`Date: ${new Date(
                `${selectedDate}T00:00:00`
              ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}`}
            />
          )}
        </div>
      </div>

      {/* =================================================
          DATE GROUPS
      ================================================= */}

      <div className="mt-5 space-y-5">
        {groupedOrders.length === 0 ? (
          <div className="rounded-[24px] border border-[#E7E1D7] bg-white px-5 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F6F0E5]">
              <ClipboardList size={24} className="text-[#C9A96E]" />
            </div>

            <h2 className="mt-5 font-serif text-2xl font-semibold">
              No orders found
            </h2>

            <p className="mt-2 text-sm text-[#999]">
              Try another payment status, date or search.
            </p>
          </div>
        ) : (
          groupedOrders.map((group) => (
            <DateOrderGroup
              key={group.key}
              group={group}
              onView={setSelectedOrder}
              onDelete={handleDeleteOrder}
              onStatusChange={handleStatusChange}
              updatingOrder={updatingOrder}
              deletingOrder={deletingOrder}
              orderStatusOptions={orderStatusOptions}
              getPaymentStyle={getPaymentStyle}
              getOrderStatusStyle={getOrderStatusStyle}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ))
        )}
      </div>

      {/* =================================================
          ORDER MODAL
      ================================================= */}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          getPaymentStyle={getPaymentStyle}
          getOrderStatusStyle={getOrderStatusStyle}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      )}
    </div>
  );
}

// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({ title, value, icon }) {
  return (
    <div className="rounded-[20px] border border-[#E7E1D7] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#888]">{title}</p>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F0E5] text-[#C9A96E]">
          {icon}
        </div>
      </div>

      <p className="mt-3 font-serif text-3xl font-semibold">{value}</p>
    </div>
  );
}

// =====================================================
// FILTER BADGE
// =====================================================

function FilterBadge({ label }) {
  return (
    <span className="rounded-full bg-[#F6F0E5] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[1px] text-[#9A7137]">
      {label}
    </span>
  );
}

// =====================================================
// DATE ORDER GROUP
// =====================================================

function DateOrderGroup({
  group,
  onView,
  onDelete,
  onStatusChange,
  updatingOrder,
  deletingOrder,
  orderStatusOptions,
  getPaymentStyle,
  getOrderStatusStyle,
  formatDate,
  formatTime,
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E7E1D7] bg-white">
      {/* DATE HEADER */}

      <div className="flex flex-col gap-4 border-b border-[#ECE7DF] bg-[#FCFBF8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F0E5]">
            <CalendarDays size={18} className="text-[#C9A96E]" />
          </div>

          <div>
            <h2 className="font-serif text-xl font-semibold">
              {formatDate(group.timestamp)}
            </h2>

            <p className="mt-0.5 text-xs text-[#999]">
              {group.orders.length}{" "}
              {group.orders.length === 1 ? "order" : "orders"} on this date
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#999]">
            Paid Revenue
          </p>

          <p className="mt-1 font-serif text-xl font-semibold">
            ₹{group.revenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="border-b border-[#ECE7DF]">
              <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                Order
              </th>

              <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                Customer
              </th>

              <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                Total
              </th>

              <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                Payment
              </th>

              <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                Order Status
              </th>

              <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                Date & Time
              </th>

              <th className="px-5 py-4 text-right text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {group.orders.map((order) => (
              <tr
                key={order._id}
                className="border-b border-[#F0ECE5] last:border-b-0 hover:bg-[#FCFBF8]"
              >
                {/* ORDER */}

                <td className="px-5 py-4">
                  <p className="text-sm font-semibold">{order.orderNumber}</p>

                  <p className="mt-1 text-[10px] text-[#999]">
                    {order.items?.length || 0}{" "}
                    {order.items?.length === 1 ? "item" : "items"}
                  </p>
                </td>

                {/* CUSTOMER */}

                <td className="px-5 py-4">
                  <p className="text-sm font-medium">{order.customerName}</p>

                  <p className="mt-1 text-xs text-[#999]">{order.mobile}</p>
                </td>

                {/* TOTAL */}

                <td className="px-5 py-4">
                  <p className="text-sm font-semibold">
                    ₹{(order.total || 0).toLocaleString("en-IN")}
                  </p>
                </td>

                {/* PAYMENT */}

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[1px] ${getPaymentStyle(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus || "unknown"}
                  </span>
                </td>

                {/* ORDER STATUS */}

                <td className="px-5 py-4">
                  <div className="relative w-fit">
                    <select
                      value={String(
                        order.orderStatus || "pending"
                      ).toLowerCase()}
                      disabled={updatingOrder === order._id}
                      onChange={(event) =>
                        onStatusChange(order, event.target.value)
                      }
                      className={`appearance-none rounded-full border-0 py-1.5 pl-3 pr-8 text-[9px] font-bold uppercase tracking-[1px] outline-none ${getOrderStatusStyle(
                        order.orderStatus
                      )}`}
                    >
                      {orderStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={12}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </td>

                {/* DATE */}

                <td className="px-5 py-4">
                  <p className="text-xs font-semibold">
                    {formatDate(order.createdAt)}
                  </p>

                  <p className="mt-1 text-[10px] text-[#888]">
                    {formatTime(order.createdAt)}
                  </p>
                </td>

                {/* ACTION */}

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    {/* VIEW */}

                    <button
                      type="button"
                      onClick={() => onView(order)}
                      className="flex h-9 items-center gap-2 rounded-lg border border-[#E5DED3] px-3 text-[10px] font-semibold uppercase tracking-[1px] text-[#666] transition hover:border-[#C9A96E] hover:text-[#C9A96E]"
                    >
                      <Eye size={15} />
                      View
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      disabled={deletingOrder === order._id}
                      onClick={() => onDelete(order)}
                      className="flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-[10px] font-semibold uppercase tracking-[1px] text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={15} />

                      {deletingOrder === order._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =====================================================
// ORDER DETAILS MODAL
// =====================================================

function OrderDetailsModal({
  order,
  onClose,
  getPaymentStyle,
  getOrderStatusStyle,
  formatDate,
  formatTime,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[26px] bg-white shadow-2xl">
        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ECE7DF] bg-white px-6 py-5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
              Order Details
            </p>

            <h2 className="mt-1 font-serif text-2xl font-semibold">
              {order.orderNumber}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DED3] transition hover:bg-[#181818] hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* CUSTOMER + ADDRESS */}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E7E1D7] bg-[#FCFBF8] p-5">
              <div className="flex items-center gap-2">
                <User size={17} className="text-[#C9A96E]" />

                <h3 className="text-xs font-semibold uppercase tracking-[1px]">
                  Customer
                </h3>
              </div>

              <p className="mt-4 text-sm font-semibold">{order.customerName}</p>

              <p className="mt-1 text-xs text-[#888]">{order.mobile}</p>

              <p className="mt-1 text-xs text-[#888]">
                {order.email || "No email provided"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E7E1D7] bg-[#FCFBF8] p-5">
              <div className="flex items-center gap-2">
                <MapPin size={17} className="text-[#C9A96E]" />

                <h3 className="text-xs font-semibold uppercase tracking-[1px]">
                  Delivery Address
                </h3>
              </div>

              <p className="mt-4 text-sm leading-6 text-[#555]">
                {order.address}
                <br />
                {order.city}, {order.state}
                <br />
                {order.pincode}
              </p>
            </div>
          </div>

          {/* PAYMENT */}

          <div className="rounded-2xl border border-[#E7E1D7] p-5">
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#999]">
                  Payment
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[1px] ${getPaymentStyle(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#999]">
                  Order Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[1px] ${getOrderStatusStyle(
                    order.orderStatus
                  )}`}
                >
                  {String(order.orderStatus || "pending").toUpperCase()}
                </span>
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#999]">
                  Date & Time
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {formatDate(order.createdAt)}
                </p>

                <p className="mt-1 text-xs text-[#888]">
                  {formatTime(order.createdAt)}
                </p>
              </div>
            </div>

            {order.paymentId && (
              <div className="mt-5 border-t border-[#ECE7DF] pt-5">
                <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#999]">
                  Payment ID
                </p>

                <p className="mt-2 break-all text-xs font-medium text-[#555]">
                  {order.paymentId}
                </p>
              </div>
            )}
          </div>

          {/* ITEMS */}

          <div>
            <div className="flex items-center gap-2">
              <Package size={17} className="text-[#C9A96E]" />

              <h3 className="font-serif text-xl font-semibold">Order Items</h3>
            </div>

            <div className="mt-4 divide-y divide-[#F0ECE5] rounded-2xl border border-[#E7E1D7]">
              {order.items?.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex items-center gap-4 p-4"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#F7F4EE]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package size={20} className="text-[#AAA]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-[#888]">
                      {item.volume} × {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* TOTAL */}

          <div className="ml-auto max-w-sm rounded-2xl bg-[#FCFBF8] p-5">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#888]">Subtotal</span>

                <span>₹{(order.subtotal || 0).toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#888]">Discount</span>

                <span>- ₹{(order.discount || 0).toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#888]">Shipping</span>

                <span>₹{(order.shipping || 0).toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#888]">GST</span>

                <span>₹{(order.gst || 0).toLocaleString("en-IN")}</span>
              </div>

              <div className="border-t border-[#E5DED3] pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>

                  <span className="font-serif text-xl font-semibold">
                    ₹{(order.total || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrdersPage;
