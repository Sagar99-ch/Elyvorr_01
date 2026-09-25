import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
const AdminInventoryPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingProduct, setEditingProduct] = useState(null);
  const [newStock, setNewStock] = useState("");

  const products = useQuery(api.products.getAll) || [];

  const updateStock = useMutation(api.products.updateStock);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        product.name?.toLowerCase().includes(searchText) ||
        product.category?.toLowerCase().includes(searchText) ||
        product.volume?.toLowerCase().includes(searchText);

      const stock = Number(product.stock || 0);
      const minimumStock = Number(product.minimumStock || 5);

      let status = "in-stock";

      if (stock <= 0) {
        status = "out-of-stock";
      } else if (stock <= minimumStock) {
        status = "low-stock";
      }

      const matchesStatus = statusFilter === "all" || statusFilter === status;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stock || 0);
    const minimumStock = Number(product.minimumStock || 5);

    return stock > 0 && stock <= minimumStock;
  }).length;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock || 0) <= 0
  ).length;

  const getStockStatus = (product) => {
    const stock = Number(product.stock || 0);
    const minimumStock = Number(product.minimumStock || 5);

    if (stock <= 0) {
      return {
        label: "Out of Stock",
        className: "inventory-status out",
      };
    }

    if (stock <= minimumStock) {
      return {
        label: "Low Stock",
        className: "inventory-status low",
      };
    }

    return {
      label: "In Stock",
      className: "inventory-status in",
    };
  };

  const openStockEditor = (product) => {
    setEditingProduct(product);
    setNewStock(String(product.stock || 0));
  };

  const closeStockEditor = () => {
    setEditingProduct(null);
    setNewStock("");
  };

  const handleUpdateStock = async () => {
    if (!editingProduct) return;

    const stock = Number(newStock);

    if (!Number.isInteger(stock) || stock < 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    try {
      const sessionToken = localStorage.getItem("elyvorr_admin_session");

      if (!sessionToken) {
        alert("Admin session expired. Please login again.");
        return;
      }

      await updateStock({
        id: editingProduct._id,
        stock,
        sessionToken,
      });

      closeStockEditor();
    } catch (error) {
      console.error("Stock update error:", error);
      alert(error?.message || "Failed to update stock.");
    }
  };

  return (
    <div className="inventory-page">
      {/* ================= HEADER ================= */}

      <div className="inventory-header">
        <div>
          <h1>Inventory</h1>
          <p>Manage your product stock and availability.</p>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}

      <div className="inventory-stats">
        <div className="inventory-stat-card">
          <div className="stat-icon">📦</div>

          <div>
            <p>Total Products</p>
            <h2>{totalProducts}</h2>
          </div>
        </div>

        <div className="inventory-stat-card">
          <div className="stat-icon">📊</div>

          <div>
            <p>Total Stock Units</p>
            <h2>{totalStock}</h2>
          </div>
        </div>

        <div className="inventory-stat-card warning">
          <div className="stat-icon">⚠️</div>

          <div>
            <p>Low Stock</p>
            <h2>{lowStockProducts}</h2>
          </div>
        </div>

        <div className="inventory-stat-card danger">
          <div className="stat-icon">❌</div>

          <div>
            <p>Out of Stock</p>
            <h2>{outOfStockProducts}</h2>
          </div>
        </div>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="inventory-toolbar">
        <div className="inventory-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="inventory-filter"
        >
          <option value="all">All Stock</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Volume</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="inventory-empty">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const status = getStockStatus(product);

                return (
                  <tr key={product._id}>
                    {/* PRODUCT */}

                    <td>
                      <div className="inventory-product">
                        <div className="inventory-product-image">
                          {product.image ? (
                            <img src={product.image} alt={product.name} />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>

                        <div>
                          <strong>{product.name}</strong>

                          {product.category && (
                            <small>{product.category}</small>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* VOLUME */}

                    <td>{product.volume || "-"}</td>

                    {/* PRICE */}

                    <td>
                      ₹{Number(product.price || 0).toLocaleString("en-IN")}
                    </td>

                    {/* STOCK */}

                    <td>
                      <strong>{Number(product.stock || 0)}</strong>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span className={status.className}>{status.label}</span>
                    </td>

                    {/* ACTIVE */}

                    <td>
                      {product.isActive ? (
                        <span className="availability-active">Active</span>
                      ) : (
                        <span className="availability-inactive">Inactive</span>
                      )}
                    </td>

                    {/* ACTION */}

                    <td>
                      <button
                        type="button"
                        className="edit-stock-btn"
                        onClick={() => openStockEditor(product)}
                      >
                        Edit Stock
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= STOCK MODAL ================= */}

      {editingProduct && (
        <div className="inventory-modal-overlay" onClick={closeStockEditor}>
          <div className="inventory-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inventory-modal-header">
              <div>
                <h2>Edit Stock</h2>
                <p>{editingProduct.name}</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeStockEditor}
              >
                ×
              </button>
            </div>

            <div className="inventory-modal-body">
              <div className="current-stock">
                <span>Current Stock</span>

                <strong>{Number(editingProduct.stock || 0)}</strong>
              </div>

              <label htmlFor="newStock">New Stock Quantity</label>

              <input
                id="newStock"
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                autoFocus
              />
            </div>

            <div className="inventory-modal-footer">
              <button
                type="button"
                className="cancel-btn"
                onClick={closeStockEditor}
              >
                Cancel
              </button>

              <button
                type="button"
                className="update-stock-btn"
                onClick={handleUpdateStock}
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STYLES ================= */}

      <style>{`
        .inventory-page {
          padding: 24px;
          width: 100%;
          box-sizing: border-box;
        }

        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .inventory-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }

        .inventory-header p {
          margin: 6px 0 0;
          color: #777;
          font-size: 14px;
        }

        .inventory-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .inventory-stat-card {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .inventory-stat-card.warning {
          border-color: #f1dfb0;
        }

        .inventory-stat-card.danger {
          border-color: #f0caca;
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          font-size: 20px;
        }

        .inventory-stat-card p {
          margin: 0 0 5px;
          color: #777;
          font-size: 13px;
        }

        .inventory-stat-card h2 {
          margin: 0;
          font-size: 23px;
        }

        .inventory-toolbar {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
        }

        .inventory-search {
          flex: 1;
          height: 42px;
          border: 1px solid #ddd;
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          gap: 8px;
        }

        .inventory-search input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          background: transparent;
        }

        .inventory-filter {
          min-width: 170px;
          height: 42px;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 0 12px;
          background: #fff;
          outline: none;
          cursor: pointer;
        }

        .inventory-table-container {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          overflow-x: auto;
        }

        .inventory-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        .inventory-table th {
          text-align: left;
          padding: 15px;
          background: #fafafa;
          border-bottom: 1px solid #e8e8e8;
          color: #666;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .inventory-table td {
          padding: 15px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }

        .inventory-table tbody tr:last-child td {
          border-bottom: none;
        }

        .inventory-product {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 220px;
        }

        .inventory-product-image {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          overflow: hidden;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .inventory-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .inventory-product strong {
          display: block;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .inventory-product small {
          display: block;
          color: #888;
          font-size: 12px;
        }

        .inventory-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .inventory-status.in {
          background: #e9f8ef;
          color: #16834a;
        }

        .inventory-status.low {
          background: #fff5d9;
          color: #a66a00;
        }

        .inventory-status.out {
          background: #fdeaea;
          color: #c62828;
        }

        .availability-active {
          color: #16834a;
          font-size: 13px;
          font-weight: 600;
        }

        .availability-inactive {
          color: #999;
          font-size: 13px;
        }

        .edit-stock-btn {
          border: 1px solid #ddd;
          background: #fff;
          padding: 7px 11px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 12px;
        }

        .edit-stock-btn:hover {
          background: #f7f7f7;
        }

        .inventory-empty {
          text-align: center;
          padding: 50px !important;
          color: #888;
        }

        .inventory-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .inventory-modal {
          width: 100%;
          max-width: 430px;
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
        }

        .inventory-modal-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #eee;
        }

        .inventory-modal-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .inventory-modal-header p {
          margin: 5px 0 0;
          color: #777;
          font-size: 13px;
        }

        .modal-close {
          border: none;
          background: transparent;
          font-size: 26px;
          cursor: pointer;
          color: #777;
        }

        .inventory-modal-body {
          padding: 20px;
        }

        .current-stock {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f7f7f7;
          border-radius: 9px;
          padding: 14px;
          margin-bottom: 20px;
        }

        .current-stock span {
          color: #666;
          font-size: 13px;
        }

        .current-stock strong {
          font-size: 20px;
        }

        .inventory-modal-body label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        .inventory-modal-body input {
          width: 100%;
          height: 44px;
          box-sizing: border-box;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 0 12px;
          outline: none;
          font-size: 15px;
        }

        .inventory-modal-body input:focus {
          border-color: #999;
        }

        .inventory-modal-footer {
          padding: 16px 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .cancel-btn,
        .update-stock-btn {
          height: 40px;
          padding: 0 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
        }

        .cancel-btn {
          border: 1px solid #ddd;
          background: #fff;
        }

        .update-stock-btn {
          border: none;
          background: #111;
          color: #fff;
        }

        @media (max-width: 900px) {
          .inventory-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .inventory-page {
            padding: 16px;
          }

          .inventory-stats {
            grid-template-columns: 1fr;
          }

          .inventory-toolbar {
            flex-direction: column;
          }

          .inventory-filter {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminInventoryPage;
