// src/pages/Products.jsx
import { useState, useMemo, useEffect } from "react";
import { FiSearch, FiFilter, FiBox, FiArchive } from "react-icons/fi";

import { GetProducts } from "../components/api/admin";
import ProductCard from "../components/ProductCard";
import AddProductModal from "../components/modals/AddProductModal";
import EditProductModal from "../components/modals/EditProductModal";
import ProductDetailModal from "../components/modals/ProductDetailModal";

import "../styles/products.css";
import "../styles/modal.css";

const STOCK_PAGE_SIZE = 10;

// ==== ข้อมูล mock สำหรับคลังสินค้า (รวมผ้า + อุปกรณ์) ====
const INITIAL_STOCKS = [
  // ผ้า (Fabric)
  {
    id: "F001",
    name: "ผ้าไหมมัดหมี่ลายโบราณ",
    category: "ผ้า (Fabric)",
    quantity: 20,
    location: "คลังผ้า - ชั้น F1",
    status: "พร้อมใช้",
  },
  {
    id: "F002",
    name: "ผ้าฝ้ายทอมือย้อมคราม",
    category: "ผ้า (Fabric)",
    quantity: 15,
    location: "คลังผ้า - ชั้น F2",
    status: "พร้อมใช้",
  },
  {
    id: "F003",
    name: "ผ้าไหมยกดอกทอง",
    category: "ผ้า (Fabric)",
    quantity: 8,
    location: "คลังผ้า - ชั้น F3",
    status: "ต้องตรวจสอบ",
  },
  {
    id: "F004",
    name: "ผ้าขิดลายดอกแก้ว",
    category: "ผ้า (Fabric)",
    quantity: 12,
    location: "คลังผ้า - ชั้น F4",
    status: "พร้อมใช้",
  },
  // อุปกรณ์ / บรรจุภัณฑ์ ฯลฯ
  {
    id: "S001",
    name: "เสื้อแขวนไม้",
    category: "อุปกรณ์หน้าร้าน",
    quantity: 50,
    location: "คลังหลัก - ชั้น A1",
    status: "เพียงพอ",
  },
  {
    id: "S002",
    name: "ถุงกระดาษลายร้าน (ใหญ่)",
    category: "บรรจุภัณฑ์",
    quantity: 25,
    location: "คลังหลัก - ชั้น B2",
    status: "ใกล้หมด",
  },
  {
    id: "S003",
    name: "ถุงกระดาษลายร้าน (เล็ก)",
    category: "บรรจุภัณฑ์",
    quantity: 0,
    location: "คลังหลัก - ชั้น B3",
    status: "หมด",
  },
  {
    id: "S004",
    name: "ริบบิ้นผูกของขวัญ สีทอง",
    category: "อุปกรณ์แพ็กของ",
    quantity: 12,
    location: "คลังย่อยหน้าร้าน",
    status: "ใกล้หมด",
  },
];

const STOCK_STATUS_OPTIONS = [
  "เพียงพอ",
  "ใกล้หมด",
  "หมด",
  "พร้อมใช้",
  "ต้องตรวจสอบ",
];

export default function Products() {
  // ---------- TAB ----------
  const [activeTab, setActiveTab] = useState("products");

  // ---------- PRODUCTS ----------
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // ---------- STOCK ----------
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [loadingStocks] = useState(false);
  const [showStockAdd, setShowStockAdd] = useState(false);
  const [showStockEdit, setShowStockEdit] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const [stockSearch, setStockSearch] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("ทั้งหมด");
  const [stockPage, setStockPage] = useState(1);

  // ---------- LOAD PRODUCTS FROM API ----------
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await GetProducts();
        setProducts(res || []);
      } catch (err) {
        console.error("GetProducts error:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchData();
  }, []);

  // ---------- CRUD PRODUCTS ----------
  const handleAddProduct = (newProduct) => {
    const id = newProduct.id || `P${Date.now()}`;
    const created = { ...newProduct, id };
    setProducts((prev) => [...prev, created]);
    setShowAdd(false);
  };

  const handleEditProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setShowEdit(false);
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm("ต้องการลบผลิตภัณฑ์นี้หรือไม่?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ---------- FILTER PRODUCTS ----------
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;

    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const type = (p.type || "").toLowerCase();
      const pattern = (p.pattern || "").toLowerCase();
      return (
        name.includes(term) || type.includes(term) || pattern.includes(term)
      );
    });
  }, [products, searchTerm]);

  // ---------- SUMMARY (ใช้ข้อมูลจาก products) ----------
  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.stock || 0),
    0
  );

  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.stock || 0) * Number(p.price || 0),
    0
  );

  const lowStockCount = products.filter(
    (p) => Number(p.stock || 0) < 10
  ).length;

  // ---------- CRUD STOCK ----------
  const handleAddStock = (data) => {
    const id = (data.id || "").trim() || `S${Date.now()}`;
    const newItem = {
      id,
      name: data.name || "",
      category: data.category || "",
      quantity: Number(data.quantity || 0),
      location: data.location || "",
      status: data.status || "เพียงพอ",
    };
    setStocks((prev) => [...prev, newItem]);
    setShowStockAdd(false);
  };

  const handleEditStock = (data) => {
    setStocks((prev) =>
      prev.map((s) =>
        s.id === data.id
          ? {
              ...s,
              name: data.name || "",
              category: data.category || "",
              quantity: Number(data.quantity || 0),
              location: data.location || "",
              status: data.status || "เพียงพอ",
            }
          : s
      )
    );
    setShowStockEdit(false);
    setSelectedStock(null);
  };

  const handleDeleteStock = (id) => {
    if (!window.confirm("ต้องการลบรายการคลังสินค้านี้หรือไม่?")) return;
    setStocks((prev) => prev.filter((s) => s.id !== id));
  };

  // ---------- FILTER + PAGINATION STOCK ----------
  const filteredStocks = useMemo(() => {
    const term = stockSearch.trim().toLowerCase();

    return stocks.filter((s) => {
      const matchTerm =
        !term ||
        s.id.toLowerCase().includes(term) ||
        (s.name || "").toLowerCase().includes(term) ||
        (s.category || "").toLowerCase().includes(term) ||
        (s.location || "").toLowerCase().includes(term);

      const matchStatus =
        stockStatusFilter === "ทั้งหมด" || s.status === stockStatusFilter;

      return matchTerm && matchStatus;
    });
  }, [stocks, stockSearch, stockStatusFilter]);

  const stockTotalPages = Math.max(
    1,
    Math.ceil(filteredStocks.length / STOCK_PAGE_SIZE)
  );

  const pagedStocks = useMemo(() => {
    const startIndex = (stockPage - 1) * STOCK_PAGE_SIZE;
    return filteredStocks.slice(startIndex, startIndex + STOCK_PAGE_SIZE);
  }, [filteredStocks, stockPage]);

  const handlePrevStockPage = () =>
    setStockPage((p) => Math.max(1, p - 1));

  const handleNextStockPage = () =>
    setStockPage((p) => Math.min(stockTotalPages, p + 1));

  const getStatusClass = (status) => {
    if (status === "หมด") return "wh-danger";
    if (status === "ใกล้หมด") return "wh-warning";
    if (status === "ต้องตรวจสอบ") return "wh-check";
    return "wh-ok"; // เพียงพอ / พร้อมใช้
  };

  // =========================== RENDER ===========================
  return (
    <div className="products-wrapper">
      {/* HEADER */}
      <div className="products-header">
        <div>
          <h2 className="prod-title">จัดการผลิตภัณฑ์และคลังสินค้า</h2>
          <span className="prod-sub">
            ดูภาพรวมสินค้า สต็อก และรายการในคลังของร้านผ้าทอพื้นเมือง
          </span>
        </div>

        {activeTab === "products" && (
          <button
            className="add-product-btn"
            onClick={() => setShowAdd(true)}
          >
            + เพิ่มผลิตภัณฑ์
          </button>
        )}
        {activeTab === "stock" && (
          <button
            className="add-stock-btn"
            onClick={() => setShowStockAdd(true)}
          >
            + เพิ่มรายการคลัง
          </button>
        )}
      </div>

      {/* SUMMARY CARDS */}
      <div className="products-summary-grid">
        <div className="prod-summary-card">
          <div className="prod-summary-icon purple">
            <span>📦</span>
          </div>
          <div className="prod-summary-text">
            <p className="prod-summary-title">ผลิตภัณฑ์ทั้งหมด</p>
            <h2 className="prod-summary-value">{products.length}</h2>
          </div>
        </div>

        <div className="prod-summary-card">
          <div className="prod-summary-icon green">
            <span>📊</span>
          </div>
          <div className="prod-summary-text">
            <p className="prod-summary-title">สต็อกรวม (ชิ้น)</p>
            <h2 className="prod-summary-value">{totalStock}</h2>
          </div>
        </div>

        <div className="prod-summary-card">
          <div className="prod-summary-icon blue">
            <span>💰</span>
          </div>
          <div className="prod-summary-text">
            <p className="prod-summary-title">มูลค่าสต็อกสินค้า</p>
            <h2 className="prod-summary-value">
              ฿{totalValue.toLocaleString()}
            </h2>
          </div>
        </div>

        <div className="prod-summary-card">
          <div className="prod-summary-icon yellow">
            <span>⚠️</span>
          </div>
          <div className="prod-summary-text">
            <p className="prod-summary-title">สินค้าใกล้หมด</p>
            <h2 className="prod-summary-value">{lowStockCount}</h2>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="prod-tabs">
        <button
          className={activeTab === "products" ? "active" : ""}
          onClick={() => setActiveTab("products")}
        >
          <FiBox /> ผลิตภัณฑ์
        </button>
        <button
          className={activeTab === "stock" ? "active" : ""}
          onClick={() => setActiveTab("stock")}
        >
          <FiArchive /> รวมสต็อก (Fabric + Stock)
        </button>
      </div>

      {/* ========== TAB : ผลิตภัณฑ์สำเร็จรูป ========== */}
      {activeTab === "products" && (
        <>
          <div className="filter-bar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า (ชื่อ, ประเภท, ลาย)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-right">
              <button className="filter-btn">
                <FiFilter /> ทุกประเภท
              </button>
              <button className="filter-btn">
                <FiFilter /> ทุกคลัง
              </button>
            </div>
          </div>

          {loadingProducts ? (
            <div className="loading-text">
              กำลังโหลดข้อมูลผลิตภัณฑ์...
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onDetail={() => {
                    setSelectedProduct(p);
                    setShowDetail(true);
                  }}
                  onEdit={() => {
                    setSelectedProduct(p);
                    setShowEdit(true);
                  }}
                  onDelete={() => handleDeleteProduct(p.id)}
                />
              ))}

              {filteredProducts.length === 0 && (
                <div className="empty-state">
                  ยังไม่มีข้อมูลผลิตภัณฑ์
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ========== TAB : รวมคลังสินค้า (ผ้า + อุปกรณ์) ========== */}
      {activeTab === "stock" && (
        <div className="warehouse-section">
          <div className="stock-header">
            <div className="stock-search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="ค้นหารายการในคลัง (รหัส, ชื่อ, ประเภท, ตำแหน่งเก็บ)"
                value={stockSearch}
                onChange={(e) => {
                  setStockSearch(e.target.value);
                  setStockPage(1);
                }}
              />
            </div>

            <div className="stock-header-right">
              <select
                className="stock-filter-select"
                value={stockStatusFilter}
                onChange={(e) => {
                  setStockStatusFilter(e.target.value);
                  setStockPage(1);
                }}
              >
                <option value="ทั้งหมด">สถานะทั้งหมด</option>
                {STOCK_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
             
            </div>
          </div>

          {loadingStocks ? (
            <div className="loading-text">
              กำลังโหลดข้อมูลคลังสินค้า...
            </div>
          ) : (
            <>
              <div className="warehouse-table-wrapper">
                <table className="warehouse-table">
                  <thead>
                    <tr>
                      <th>รหัสสต็อก</th>
                      <th>ชื่อรายการ</th>
                      <th>ประเภท</th>
                      <th>จำนวนคงเหลือ</th>
                      <th>ตำแหน่งเก็บ</th>
                      <th>สถานะ</th>
                      <th>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedStocks.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.name}</td>
                        <td>{s.category}</td>
                        <td>{s.quantity}</td>
                        <td>{s.location}</td>
                        <td>
                          <span
                            className={`wh-status ${getStatusClass(
                              s.status
                            )}`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <div className="stock-actions">
                            <button
                              className="stock-action-btn edit"
                              onClick={() => {
                                setSelectedStock(s);
                                setShowStockEdit(true);
                              }}
                            >
                              แก้ไข
                            </button>
                            <button
                              className="stock-action-btn delete"
                              onClick={() => handleDeleteStock(s.id)}
                            >
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {pagedStocks.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          style={{ textAlign: "center", padding: "18px" }}
                        >
                          ยังไม่มีข้อมูลในรายการสต็อก
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {stockTotalPages > 1 && (
                <div className="warehouse-pagination">
                  <button
                    className="wh-page-btn"
                    onClick={handlePrevStockPage}
                    disabled={stockPage === 1}
                  >
                    ก่อนหน้า
                  </button>
                  <span className="wh-page-info">
                    หน้า {stockPage} / {stockTotalPages}
                  </span>
                  <button
                    className="wh-page-btn"
                    onClick={handleNextStockPage}
                    disabled={stockPage === stockTotalPages}
                  >
                    ถัดไป
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* MODALS : PRODUCTS */}
      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onSave={handleAddProduct}
        />
      )}

      {showEdit && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setShowEdit(false)}
          onSave={handleEditProduct}
        />
      )}

      {showDetail && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setShowDetail(false)}
        />
      )}

      {/* MODALS : STOCK */}
      {showStockAdd && (
        <StockModal
          mode="add"
          onClose={() => setShowStockAdd(false)}
          onSave={handleAddStock}
        />
      )}

      {showStockEdit && selectedStock && (
        <StockModal
          mode="edit"
          initial={selectedStock}
          onClose={() => {
            setShowStockEdit(false);
            setSelectedStock(null);
          }}
          onSave={handleEditStock}
        />
      )}
    </div>
  );
}

// ===== Modal สำหรับเพิ่ม/แก้ไขคลังสินค้า =====
function StockModal({ mode, initial, onClose, onSave }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    id: initial?.id || "",
    name: initial?.name || "",
    category: initial?.category || "",
    quantity: initial?.quantity ?? 0,
    location: initial?.location || "",
    status: initial?.status || "เพียงพอ",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity" ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("กรุณากรอกชื่อรายการ");
      return;
    }
    if (!isEdit && !form.id.trim()) {
      alert("กรุณากรอกรหัสสต็อก");
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2 className="modal-title">
          {isEdit ? "แก้ไขรายการคลังสินค้า" : "เพิ่มรายการคลังสินค้า"}
        </h2>
        <p className="modal-sub">
          {isEdit
            ? "ปรับข้อมูลรายการสต็อกให้ถูกต้องและเป็นปัจจุบัน"
            : "กรอกรายละเอียดสต็อกใหม่ เช่น ผ้า อุปกรณ์หน้าร้าน หรือบรรจุภัณฑ์"}
        </p>

        <div className="modal-form">
          <div className="modal-field">
            <label>รหัสสต็อก</label>
            <input
              name="id"
              placeholder="เช่น F005 หรือ S005"
              value={form.id}
              onChange={handleChange}
              disabled={isEdit}
            />
          </div>

          <div className="modal-field">
            <label>ชื่อรายการ</label>
            <input
              name="name"
              placeholder="เช่น ผ้าไหมมัดหมี่ลายใหม่"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="modal-field">
            <label>ประเภท</label>
            <input
              name="category"
              placeholder="เช่น ผ้า (Fabric), บรรจุภัณฑ์, อุปกรณ์หน้าร้าน"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div className="modal-field">
            <label>จำนวนคงเหลือ</label>
            <input
              type="number"
              name="quantity"
              min="0"
              value={form.quantity}
              onChange={handleChange}
            />
          </div>

          <div className="modal-field">
            <label>ตำแหน่งเก็บ</label>
            <input
              name="location"
              placeholder="เช่น คลังผ้า - ชั้น F1"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div className="modal-field">
            <label>สถานะ</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              {STOCK_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="btn-save" onClick={handleSubmit}>
            {isEdit ? "บันทึกการแก้ไข" : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}