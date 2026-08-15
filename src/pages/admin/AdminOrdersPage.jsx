import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Eye,
  IndianRupee,
  MapPin,
  Package,
  Search,
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

  // =====================================================
  // STATE
  // =====================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [updatingOrder, setUpdatingOrder] = useState(null);

  const [error, setError] = useState("");

  // =====================================================
  // STATUS OPTIONS
  // =====================================================

  const statusOptions = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  // =====================================================
  // FILTER ORDERS
  // =====================================================

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    const searchText = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !searchText ||
        order.orderNumber.toLowerCase().includes(searchText) ||
        order.customerName.toLowerCase().includes(searchText) ||
        order.mobile.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" || order.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleStatusChange = async (order, newStatus) => {
    if (order.orderStatus === newStatus) {
      return;
    }

    setUpdatingOrder(order._id);
    setError("");

    try {
      await updateOrderStatus({
        orderId: order._id,
        orderStatus: newStatus,
      });
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to update order status.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-[#FFF5E6] text-[#C98A2E]";

      case "confirmed":
        return "bg-[#EAF2FF] text-[#4672B8]";

      case "processing":
        return "bg-[#F3EEFF] text-[#7553B3]";

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
  // PAYMENT STYLE
  // =====================================================

  const getPaymentStyle = (status) => {
    if (status === "paid") {
      return "bg-[#EAF7ED] text-[#2F8F46]";
    }

    if (status === "cancelled") {
      return "bg-[#FFF0F0] text-[#C65353]";
    }

    return "bg-[#FFF5E6] text-[#C98A2E]";
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
  // COUNTS
  // =====================================================

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.orderStatus === "pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "delivered"
  ).length;

  const paidOrders = orders.filter(
    (order) => order.paymentStatus === "paid"
  ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mx-auto max-w-7xl">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
            Store Management
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Orders
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#777]">
            Manage customer orders, payments and delivery status.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#E5DED3] bg-white px-4 py-2.5 text-xs text-[#777]">
          <ClipboardList size={15} className="text-[#C9A96E]" />
          {totalOrders} Total Orders
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
          SUMMARY
      ================================================= */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-[#E7E1D7] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#888]">Total Orders</p>

            <ClipboardList size={18} className="text-[#C9A96E]" />
          </div>

          <p className="mt-2 font-serif text-3xl font-semibold">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-[20px] border border-[#E7E1D7] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#888]">Pending</p>

            <CalendarDays size={18} className="text-[#C98A2E]" />
          </div>

          <p className="mt-2 font-serif text-3xl font-semibold">
            {pendingOrders}
          </p>
        </div>

        <div className="rounded-[20px] border border-[#E7E1D7] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#888]">Paid</p>

            <IndianRupee size={18} className="text-[#2F8F46]" />
          </div>

          <p className="mt-2 font-serif text-3xl font-semibold">{paidOrders}</p>
        </div>

        <div className="rounded-[20px] border border-[#E7E1D7] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#888]">Delivered</p>

            <CheckCircle2 size={18} className="text-[#2F8F46]" />
          </div>

          <p className="mt-2 font-serif text-3xl font-semibold">
            {deliveredOrders}
          </p>
        </div>
      </div>

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="mt-6 rounded-[22px] border border-[#E7E1D7] bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
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

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-12 rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-4 text-sm outline-none focus:border-[#C9A96E]"
          >
            <option value="all">All Orders</option>

            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =================================================
          ORDERS TABLE
      ================================================= */}

      <div className="mt-6 overflow-hidden rounded-[24px] border border-[#E7E1D7] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-[#ECE7DF] bg-[#FCFBF8]">
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
                  Status
                </th>

                <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                  Date
                </th>

                <th className="px-5 py-4 text-right text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-20 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F6F0E5]">
                      <ClipboardList size={24} className="text-[#C9A96E]" />
                    </div>

                    <p className="mt-4 font-serif text-xl font-semibold">
                      No orders found
                    </p>

                    <p className="mt-2 text-xs text-[#999]">
                      Customer orders will appear here after checkout.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-[#F0ECE5] last:border-b-0"
                  >
                    {/* ORDER */}

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-[10px] text-[#999]">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </td>

                    {/* CUSTOMER */}

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">
                        {order.customerName}
                      </p>

                      <p className="mt-1 text-xs text-[#999]">{order.mobile}</p>
                    </td>

                    {/* TOTAL */}

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold">
                        ₹{order.total.toLocaleString("en-IN")}
                      </p>
                    </td>

                    {/* PAYMENT */}

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[1px] ${getPaymentStyle(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <div className="relative w-fit">
                        <select
                          value={order.orderStatus}
                          disabled={updatingOrder === order._id}
                          onChange={(event) =>
                            handleStatusChange(order, event.target.value)
                          }
                          className={`appearance-none rounded-full border-0 py-1.5 pl-3 pr-8 text-[9px] font-bold uppercase tracking-[1px] outline-none ${getStatusStyle(
                            order.orderStatus
                          )}`}
                        >
                          {statusOptions.map((status) => (
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
                      <p className="text-xs font-medium">
                        {formatDate(order.createdAt)}
                      </p>

                      <p className="mt-1 text-[10px] text-[#999]">
                        {formatTime(order.createdAt)}
                      </p>
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="flex h-9 items-center gap-2 rounded-lg border border-[#E5DED3] px-3 text-[10px] font-semibold uppercase tracking-[1px] text-[#666] transition hover:border-[#C9A96E] hover:text-[#C9A96E]"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#ECE7DF] px-5 py-4">
          <p className="text-xs text-[#999]">
            Showing{" "}
            <span className="font-semibold text-[#555]">
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#555]">{orders.length}</span>{" "}
            orders
          </p>
        </div>
      </div>

      {/* =================================================
          ORDER DETAILS MODAL
      ================================================= */}

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[26px] bg-white shadow-2xl">
            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ECE7DF] bg-white px-6 py-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
                  Order Details
                </p>

                <h2 className="mt-1 font-serif text-2xl font-semibold">
                  {selectedOrder.orderNumber}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DED3] transition hover:bg-[#181818] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* CUSTOMER + DELIVERY */}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#E7E1D7] bg-[#FCFBF8] p-5">
                  <div className="flex items-center gap-2">
                    <User size={17} className="text-[#C9A96E]" />

                    <h3 className="text-xs font-semibold uppercase tracking-[1px]">
                      Customer
                    </h3>
                  </div>

                  <p className="mt-4 text-sm font-semibold">
                    {selectedOrder.customerName}
                  </p>

                  <p className="mt-1 text-xs text-[#888]">
                    {selectedOrder.mobile}
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
                    {selectedOrder.address}
                    <br />
                    {selectedOrder.city}, {selectedOrder.state}
                    <br />
                    {selectedOrder.pincode}
                  </p>
                </div>
              </div>

              {/* STATUS */}

              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E7E1D7] p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#999]">
                    Order Status
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[1px] ${getStatusStyle(
                      selectedOrder.orderStatus
                    )}`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#999]">
                    Payment
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[1px] ${getPaymentStyle(
                      selectedOrder.paymentStatus
                    )}`}
                  >
                    {selectedOrder.paymentStatus}
                  </span>
                </div>

                {selectedOrder.paymentId && (
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#999]">
                      Payment ID
                    </p>

                    <p className="mt-2 max-w-[180px] truncate text-xs font-medium">
                      {selectedOrder.paymentId}
                    </p>
                  </div>
                )}
              </div>

              {/* ITEMS */}

              <div>
                <div className="flex items-center gap-2">
                  <Package size={17} className="text-[#C9A96E]" />

                  <h3 className="font-serif text-xl font-semibold">
                    Order Items
                  </h3>
                </div>

                <div className="mt-4 divide-y divide-[#F0ECE5] rounded-2xl border border-[#E7E1D7]">
                  {selectedOrder.items.map((item, index) => (
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

              {/* TOTALS */}

              <div className="ml-auto max-w-sm rounded-2xl bg-[#FCFBF8] p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#888]">Subtotal</span>

                    <span>
                      ₹{selectedOrder.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#888]">Discount</span>

                    <span>
                      - ₹{selectedOrder.discount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#888]">Shipping</span>

                    <span>
                      ₹{selectedOrder.shipping.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#888]">GST</span>

                    <span>₹{selectedOrder.gst.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="border-t border-[#E5DED3] pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>

                      <span className="font-serif text-xl font-semibold">
                        ₹{selectedOrder.total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DATE */}

              <div className="flex items-center justify-between border-t border-[#ECE7DF] pt-5 text-xs text-[#999]">
                <span>Order placed</span>

                <span>
                  {formatDate(selectedOrder.createdAt)} at{" "}
                  {formatTime(selectedOrder.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;
