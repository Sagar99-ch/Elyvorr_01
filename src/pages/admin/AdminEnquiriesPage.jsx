import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  Mail,
  MessageSquare,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";

function AdminEnquiriesPage() {
  const enquiries = useQuery(api.contacts.getAll);

  const updateStatus = useMutation(api.contacts.updateStatus);

  const removeContact = useMutation(api.contacts.remove);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const [updatingId, setUpdatingId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredEnquiries = useMemo(() => {
    if (!enquiries) return [];

    const query = search.trim().toLowerCase();

    return enquiries.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, search, statusFilter]);

  // =====================================================
  // STATUS UPDATE
  // =====================================================

  const handleStatusChange = async (id, status) => {
    try {
      setUpdatingId(id);

      await updateStatus({
        id,
        status,
      });

      if (selectedEnquiry?._id === id) {
        setSelectedEnquiry((current) =>
          current
            ? {
                ...current,
                status,
              }
            : current
        );
      }
    } catch (error) {
      console.error("Failed to update enquiry:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this enquiry?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await removeContact({
        id,
      });

      if (selectedEnquiry?._id === id) {
        setSelectedEnquiry(null);
      }
    } catch (error) {
      console.error("Failed to delete enquiry:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // HELPERS
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

  const getStatusStyle = (status) => {
    switch (status) {
      case "new":
        return "bg-[#FDF3E2] text-[#A6813F]";

      case "read":
        return "bg-[#EEF4FF] text-[#4169A1]";

      case "replied":
        return "bg-[#EEF8F0] text-[#347A45]";

      case "resolved":
        return "bg-[#F1F1F1] text-[#666]";

      default:
        return "bg-[#F5F5F5] text-[#666]";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (enquiries === undefined) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#E5DED3] border-t-[#C9A96E]" />

          <p className="mt-4 text-sm text-[#777]">Loading enquiries...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // COUNTS
  // =====================================================

  const totalCount = enquiries.length;

  const newCount = enquiries.filter((item) => item.status === "new").length;

  const repliedCount = enquiries.filter(
    (item) => item.status === "replied"
  ).length;

  const resolvedCount = enquiries.filter(
    (item) => item.status === "resolved"
  ).length;

  return (
    <div className="mx-auto max-w-7xl">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
            Customer Communication
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">
            Inquiries
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#777]">
            Manage customer questions, messages and support enquiries received
            through ELYVORR.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#E5DED3] bg-white px-4 py-2.5 text-xs text-[#666]">
          <MessageSquare size={15} className="text-[#C9A96E]" />
          {totalCount} Total
        </div>
      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Enquiries"
          value={totalCount}
          icon={MessageSquare}
        />

        <StatCard label="New" value={newCount} icon={Clock3} />

        <StatCard label="Replied" value={repliedCount} icon={Mail} />

        <StatCard label="Resolved" value={resolvedCount} icon={Check} />
      </div>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="mt-8 rounded-[20px] border border-[#E5DED3] bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, subject..."
              className="h-11 w-full rounded-xl border border-[#E3DDD3] bg-[#FCFBF9] pl-11 pr-4 text-sm outline-none transition focus:border-[#C9A96E]"
            />
          </div>

          {/* STATUS */}

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-[#E3DDD3] bg-[#FCFBF9] px-4 pr-10 text-xs font-medium text-[#555] outline-none transition focus:border-[#C9A96E] sm:w-[180px]"
            >
              <option value="all">All Status</option>

              <option value="new">New</option>

              <option value="read">Read</option>

              <option value="replied">Replied</option>

              <option value="resolved">Resolved</option>
            </select>

            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#999]"
            />
          </div>
        </div>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="mt-5 overflow-hidden rounded-[22px] border border-[#E5DED3] bg-white">
        {/* Desktop header */}

        <div className="hidden border-b border-[#ECE7DF] bg-[#FCFBF9] px-6 py-4 lg:grid lg:grid-cols-[1.4fr_1.4fr_1.5fr_0.8fr_1fr] lg:gap-5">
          <TableHeading>Customer</TableHeading>

          <TableHeading>Email</TableHeading>

          <TableHeading>Subject</TableHeading>

          <TableHeading>Status</TableHeading>

          <TableHeading>Date</TableHeading>
        </div>

        {/* Empty */}

        {filteredEnquiries.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F6F0E5]">
              <MessageSquare size={25} className="text-[#C9A96E]" />
            </div>

            <h2 className="mt-5 font-serif text-2xl font-semibold">
              No enquiries found
            </h2>

            <p className="mt-2 max-w-md text-sm text-[#888]">
              No customer enquiries match your current search or filter.
            </p>
          </div>
        ) : (
          <div>
            {filteredEnquiries.map((item) => (
              <div
                key={item._id}
                className="border-b border-[#F0ECE5] px-5 py-5 last:border-b-0 sm:px-6"
              >
                {/* MOBILE / DESKTOP */}

                <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1.4fr_1.4fr_1.5fr_0.8fr_1fr] lg:items-center lg:gap-5">
                  {/* CUSTOMER */}

                  <button
                    type="button"
                    onClick={() => setSelectedEnquiry(item)}
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F6F0E5]">
                      <User size={17} className="text-[#A6813F]" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#181818]">
                        {item.name}
                      </p>

                      {item.phone && (
                        <p className="mt-1 text-[11px] text-[#999]">
                          {item.phone}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* EMAIL */}

                  <a
                    href={`mailto:${item.email}`}
                    className="truncate text-sm text-[#666] transition hover:text-[#C9A96E]"
                  >
                    {item.email}
                  </a>

                  {/* SUBJECT */}

                  <button
                    type="button"
                    onClick={() => setSelectedEnquiry(item)}
                    className="truncate text-left text-sm font-medium text-[#444] hover:text-[#C9A96E]"
                  >
                    {item.subject}
                  </button>

                  {/* STATUS */}

                  <div className="relative">
                    <select
                      value={item.status}
                      disabled={updatingId === item._id}
                      onChange={(event) =>
                        handleStatusChange(item._id, event.target.value)
                      }
                      className={`h-9 w-full appearance-none rounded-full border-0 px-3 pr-7 text-[10px] font-bold uppercase tracking-[1px] outline-none ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      <option value="new">New</option>

                      <option value="read">Read</option>

                      <option value="replied">Replied</option>

                      <option value="resolved">Resolved</option>
                    </select>

                    <ChevronDown
                      size={12}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-50"
                    />
                  </div>

                  {/* DATE + ACTION */}

                  <div className="flex items-center justify-between gap-3 lg:block">
                    <div>
                      <p className="text-xs font-medium text-[#555]">
                        {formatDate(item.createdAt)}
                      </p>

                      <p className="mt-1 text-[10px] text-[#999]">
                        {formatTime(item.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 lg:mt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedEnquiry(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#777] transition hover:bg-[#F6F0E5] hover:text-[#A6813F]"
                        title="View enquiry"
                      >
                        <MessageSquare size={15} />
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === item._id}
                        onClick={() => handleDelete(item._id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#999] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Delete enquiry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================================================
          DETAIL MODAL
      ================================================= */}

      {selectedEnquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedEnquiry(null)}
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[26px] bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-[#ECE7DF] p-6 sm:p-7">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[3px] text-[#C9A96E]">
                  Customer Enquiry
                </p>

                <h2 className="mt-2 font-serif text-2xl font-semibold">
                  {selectedEnquiry.subject}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DED3] text-[#777] transition hover:bg-[#181818] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            {/* DETAILS */}

            <div className="space-y-6 p-6 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={User}
                  label="Customer"
                  value={selectedEnquiry.name}
                />

                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={selectedEnquiry.email}
                />

                {selectedEnquiry.phone && (
                  <DetailItem
                    icon={MessageSquare}
                    label="Phone"
                    value={selectedEnquiry.phone}
                  />
                )}

                <DetailItem
                  icon={Clock3}
                  label="Received"
                  value={`${formatDate(
                    selectedEnquiry.createdAt
                  )} • ${formatTime(selectedEnquiry.createdAt)}`}
                />
              </div>

              {/* MESSAGE */}

              <div className="rounded-2xl border border-[#E8E2D8] bg-[#FCFBF9] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#999]">
                  Message
                </p>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#555]">
                  {selectedEnquiry.message}
                </p>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative">
                  <select
                    value={selectedEnquiry.status}
                    onChange={(event) =>
                      handleStatusChange(
                        selectedEnquiry._id,
                        event.target.value
                      )
                    }
                    className={`h-11 appearance-none rounded-xl px-4 pr-10 text-xs font-semibold uppercase tracking-[1px] outline-none ${getStatusStyle(
                      selectedEnquiry.status
                    )}`}
                  >
                    <option value="new">New</option>

                    <option value="read">Read</option>

                    <option value="replied">Replied</option>

                    <option value="resolved">Resolved</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-50"
                  />
                </div>

                <div className="flex gap-2">
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#181818] px-5 py-3 text-xs font-semibold uppercase tracking-[1px] text-white transition hover:bg-[#C9A96E] sm:flex-none"
                  >
                    <Mail size={15} />
                    Reply
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedEnquiry._id)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-xs font-semibold uppercase tracking-[1px] text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[20px] border border-[#E5DED3] bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#999]">
            {label}
          </p>

          <p className="mt-3 font-serif text-3xl font-semibold">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F0E5]">
          <Icon size={18} className="text-[#C9A96E]" />
        </div>
      </div>
    </div>
  );
}

// =====================================================
// TABLE HEADING
// =====================================================

function TableHeading({ children }) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
      {children}
    </p>
  );
}

// =====================================================
// DETAIL ITEM
// =====================================================

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-[#E8E2D8] bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-[#C9A96E]" />

        <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#999]">
          {label}
        </p>
      </div>

      <p className="mt-2 break-all text-sm font-medium text-[#444]">{value}</p>
    </div>
  );
}

export default AdminEnquiriesPage;
