import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Edit3,
  Eye,
  Image as ImageIcon,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function AdminProductsPage() {
  // =====================================================
  // CONVEX
  // =====================================================

  const products = useQuery(api.products.getAll, {
    includeInactive: true,
  });

  const addProduct = useMutation(api.products.add);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);
  const updateStock = useMutation(api.products.updateStock);

  // =====================================================
  // STATE
  // =====================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [viewingProduct, setViewingProduct] = useState(null);

  const [deleteProduct, setDeleteProduct] = useState(null);

  const [stockProduct, setStockProduct] = useState(null);

  const [stockValue, setStockValue] = useState("");

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // FORM
  // =====================================================

  const emptyForm = {
    name: "",
    volume: "",
    price: "",
    oldPrice: "",
    reviews: "0",
    badge: "",
    image: "",
    stock: "",
    isActive: true,
  };

  const [form, setForm] = useState(emptyForm);

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        product.name.toLowerCase().includes(searchText) ||
        product.volume.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.isActive) ||
        (statusFilter === "inactive" && !product.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  // =====================================================
  // OPEN ADD
  // =====================================================

  const openAddForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEditForm = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name ?? "",
      volume: product.volume ?? "",
      price: String(product.price ?? ""),
      oldPrice: product.oldPrice !== undefined ? String(product.oldPrice) : "",
      reviews: String(product.reviews ?? 0),
      badge: product.badge ?? "",
      image: product.image ?? "",
      stock: String(product.stock ?? 0),
      isActive: product.isActive ?? true,
    });

    setError("");
    setShowForm(true);
  };

  // =====================================================
  // SAVE PRODUCT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.volume.trim()) {
      setError("Volume is required.");
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      setError("Enter a valid price.");
      return;
    }

    if (!form.image.trim()) {
      setError("Product image URL is required.");
      return;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      setError("Enter a valid stock.");
      return;
    }

    setSaving(true);

    try {
      const productData = {
        name: form.name.trim(),
        volume: form.volume.trim(),
        price: Number(form.price),

        oldPrice: form.oldPrice !== "" ? Number(form.oldPrice) : undefined,

        reviews: form.reviews !== "" ? Number(form.reviews) : 0,

        badge: form.badge.trim() || undefined,

        image: form.image.trim(),

        stock: Number(form.stock),
      };

      if (editingProduct) {
        await updateProduct({
          id: editingProduct._id,
          ...productData,
          isActive: form.isActive,
        });
      } else {
        await addProduct(productData);
      }

      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);

      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async () => {
    if (!deleteProduct) return;

    setSaving(true);

    try {
      await removeProduct({
        id: deleteProduct._id,
      });

      setDeleteProduct(null);
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to delete product.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // STOCK UPDATE
  // =====================================================

  const openStockModal = (product) => {
    setStockProduct(product);
    setStockValue(String(product.stock));
    setError("");
  };

  const handleStockUpdate = async () => {
    if (!stockProduct) return;

    const stock = Number(stockValue);

    if (stockValue === "" || !Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a valid whole number.");
      return;
    }

    setSaving(true);

    try {
      await updateStock({
        id: stockProduct._id,
        stock,
      });

      setStockProduct(null);
      setStockValue("");
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to update stock.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (products === undefined) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#E7E1D7] border-t-[#C9A96E]" />

          <p className="mt-4 text-sm text-[#888]">Loading products...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // COUNTS
  // =====================================================

  const activeCount = products.filter((product) => product.isActive).length;

  const inactiveCount = products.length - activeCount;

  const lowStockCount = products.filter(
    (product) => product.stock <= 5 && product.isActive
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
            Catalogue
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Products
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#777]">
            Manage your ELYVORR fragrances, pricing and stock.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex w-fit items-center justify-center gap-2 rounded-xl bg-[#181818] px-5 py-3.5 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#C9A96E]"
        >
          <Plus size={17} />
          Add Product
        </button>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[20px] border border-[#E7E1D7] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#888]">Total Products</p>

            <Package size={18} className="text-[#C9A96E]" />
          </div>

          <p className="mt-2 font-serif text-3xl font-semibold">
            {products.length}
          </p>
        </div>

        <div className="rounded-[20px] border border-[#E7E1D7] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#888]">Active</p>

            <Check size={18} className="text-[#2F8F46]" />
          </div>

          <p className="mt-2 font-serif text-3xl font-semibold">
            {activeCount}
          </p>
        </div>

        <div className="rounded-[20px] border border-[#E7E1D7] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#888]">Low Stock</p>

            <AlertTriangle size={18} className="text-[#C98A2E]" />
          </div>

          <p className="mt-2 font-serif text-3xl font-semibold">
            {lowStockCount}
          </p>
        </div>
      </div>

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="mt-6 rounded-[22px] border border-[#E7E1D7] bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* Search */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAA]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product or volume..."
              className="h-12 w-full rounded-xl border border-[#E5DED3] bg-[#FCFBF8] pl-11 pr-4 text-sm outline-none transition focus:border-[#C9A96E]"
            />
          </div>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-12 rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-4 text-sm outline-none focus:border-[#C9A96E]"
          >
            <option value="all">All Products</option>

            <option value="active">Active</option>

            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* =================================================
          PRODUCT TABLE
      ================================================= */}

      <div className="mt-6 overflow-hidden rounded-[24px] border border-[#E7E1D7] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#ECE7DF] bg-[#FCFBF8]">
                <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                  Product
                </th>

                <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                  Price
                </th>

                <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                  Stock
                </th>

                <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-[9px] font-bold uppercase tracking-[1.5px] text-[#999]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-20 text-center">
                    <Package size={30} className="mx-auto text-[#C9A96E]" />

                    <p className="mt-4 font-serif text-xl font-semibold">
                      No products found
                    </p>

                    <p className="mt-2 text-xs text-[#999]">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-[#F0ECE5] last:border-b-0"
                  >
                    {/* PRODUCT */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-[#E8E2D8] bg-[#F7F4EE]">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ImageIcon size={20} className="text-[#AAA]" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#181818]">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-[#888]">
                            {product.volume}
                          </p>

                          {product.badge && (
                            <span className="mt-2 inline-block rounded-full bg-[#F6F0E5] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[1px] text-[#A6813F]">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* PRICE */}

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold">
                        ₹{product.price.toLocaleString("en-IN")}
                      </p>

                      {product.oldPrice && (
                        <p className="mt-1 text-xs text-[#AAA] line-through">
                          ₹{product.oldPrice.toLocaleString("en-IN")}
                        </p>
                      )}
                    </td>

                    {/* STOCK */}

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => openStockModal(product)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                          product.stock <= 5
                            ? "bg-[#FFF5E6] text-[#C98A2E] hover:bg-[#FFECCF]"
                            : "bg-[#F3F6F3] text-[#2F8F46] hover:bg-[#EAF7ED]"
                        }`}
                      >
                        {product.stock} units
                      </button>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      {product.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7ED] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[1px] text-[#2F8F46]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#2F8F46]" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1EFEC] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[1px] text-[#888]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#999]" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingProduct(product)}
                          title="View"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5DED3] text-[#777] transition hover:border-[#C9A96E] hover:text-[#C9A96E]"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditForm(product)}
                          title="Edit"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5DED3] text-[#777] transition hover:border-[#C9A96E] hover:text-[#C9A96E]"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteProduct(product)}
                          title="Delete"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5DED3] text-[#777] transition hover:border-red-300 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}

        <div className="border-t border-[#ECE7DF] px-5 py-4">
          <p className="text-xs text-[#999]">
            Showing{" "}
            <span className="font-semibold text-[#555]">
              {filteredProducts.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#555]">{products.length}</span>{" "}
            products
          </p>
        </div>
      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[26px] bg-white shadow-2xl">
            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ECE7DF] bg-white px-6 py-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
                  {editingProduct ? "Edit Catalogue" : "New Catalogue"}
                </p>

                <h2 className="mt-1 font-serif text-2xl font-semibold">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DED3] transition hover:bg-[#181818] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              {/* NAME */}

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                  Product Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Elyvorr Noir"
                  className="mt-2 h-12 w-full rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-4 text-sm outline-none focus:border-[#C9A96E]"
                />
              </div>

              {/* VOLUME + STOCK */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                    Volume
                  </label>

                  <input
                    name="volume"
                    value={form.volume}
                    onChange={handleChange}
                    placeholder="e.g. 50ml"
                    className="mt-2 h-12 w-full rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-4 text-sm outline-none focus:border-[#C9A96E]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="mt-2 h-12 w-full rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-4 text-sm outline-none focus:border-[#C9A96E]"
                  />
                </div>
              </div>

              {/* PRICE */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                    Selling Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="₹ 0"
                    className="mt-2 h-12 w-full rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-4 text-sm outline-none focus:border-[#C9A96E]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                    Old Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="oldPrice"
                    value={form.oldPrice}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="mt-2 h-12 w-full rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-4 text-sm outline-none focus:border-[#C9A96E]"
                  />
                </div>
              </div>

              {/* REVIEWS + BADGE */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                    Reviews
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="reviews"
                    value={form.reviews}
                    onChange={handleChange}
                    className="mt-2 h-12 w-full rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-4 text-sm outline-none focus:border-[#C9A96E]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                    Badge
                  </label>

                  <input
                    name="badge"
                    value={form.badge}
                    onChange={handleChange}
                    placeholder="e.g. BESTSELLER"
                    className="mt-2 h-12 w-full rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-4 text-sm outline-none focus:border-[#C9A96E]"
                  />
                </div>
              </div>

              {/* IMAGE */}

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                  Product Image URL
                </label>

                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="mt-2 h-12 w-full rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-4 text-sm outline-none focus:border-[#C9A96E]"
                />

                {form.image && (
                  <div className="mt-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-[#E5DED3] bg-[#F7F4EE]">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                )}
              </div>

              {/* ACTIVE */}

              {editingProduct && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E5DED3] bg-[#FCFBF8] p-4">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#C9A96E]"
                  />

                  <div>
                    <p className="text-xs font-semibold">Product Active</p>

                    <p className="mt-1 text-[10px] text-[#999]">
                      Active products are visible in the customer collection.
                    </p>
                  </div>
                </label>
              )}

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-[#ECE7DF] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-[#E5DED3] px-5 py-3 text-xs font-semibold uppercase tracking-[1px] text-[#666] hover:bg-[#F8F5EF]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#181818] px-6 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          VIEW PRODUCT MODAL
      ================================================= */}

      {viewingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[26px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ECE7DF] px-6 py-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
                  Product Details
                </p>

                <h2 className="mt-1 font-serif text-2xl font-semibold">
                  {viewingProduct.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DED3]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-center rounded-2xl bg-[#F7F4EE] p-6">
                {viewingProduct.image ? (
                  <img
                    src={viewingProduct.image}
                    alt={viewingProduct.name}
                    className="h-48 w-48 object-contain"
                  />
                ) : (
                  <ImageIcon size={40} className="text-[#AAA]" />
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#FCFBF8] p-4">
                  <p className="text-[9px] uppercase tracking-[1px] text-[#999]">
                    Volume
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {viewingProduct.volume}
                  </p>
                </div>

                <div className="rounded-xl bg-[#FCFBF8] p-4">
                  <p className="text-[9px] uppercase tracking-[1px] text-[#999]">
                    Stock
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {viewingProduct.stock}
                  </p>
                </div>

                <div className="rounded-xl bg-[#FCFBF8] p-4">
                  <p className="text-[9px] uppercase tracking-[1px] text-[#999]">
                    Price
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    ₹{viewingProduct.price.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-xl bg-[#FCFBF8] p-4">
                  <p className="text-[9px] uppercase tracking-[1px] text-[#999]">
                    Reviews
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {viewingProduct.reviews}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          STOCK MODAL
      ================================================= */}

      {stockProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#C9A96E]">
                  Inventory
                </p>

                <h2 className="mt-1 font-serif text-2xl font-semibold">
                  Update Stock
                </h2>

                <p className="mt-2 text-xs text-[#888]">{stockProduct.name}</p>
              </div>

              <button
                type="button"
                onClick={() => setStockProduct(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DED3]"
              >
                <X size={17} />
              </button>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="mt-6">
              <label className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                New Stock Quantity
              </label>

              <input
                type="number"
                min="0"
                value={stockValue}
                onChange={(event) => {
                  setStockValue(event.target.value);
                  setError("");
                }}
                className="mt-2 h-13 w-full rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-4 text-lg font-semibold outline-none focus:border-[#C9A96E]"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStockProduct(null)}
                className="flex-1 rounded-xl border border-[#E5DED3] py-3 text-xs font-semibold uppercase tracking-[1px]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleStockUpdate}
                className="flex-1 rounded-xl bg-[#181818] py-3 text-xs font-semibold uppercase tracking-[1px] text-white hover:bg-[#C9A96E]"
              >
                {saving ? "Updating..." : "Update Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Trash2 size={21} />
            </div>

            <h2 className="mt-5 font-serif text-2xl font-semibold">
              Delete Product?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#777]">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-[#181818]">
                {deleteProduct.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteProduct(null)}
                className="flex-1 rounded-xl border border-[#E5DED3] py-3 text-xs font-semibold uppercase tracking-[1px]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-500 py-3 text-xs font-semibold uppercase tracking-[1px] text-white hover:bg-red-600"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;
