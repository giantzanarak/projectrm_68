// src/pages/Products.jsx
import { useState, useEffect, useMemo } from "react";
import { FiSearch, FiFilter, FiBox, FiArchive, FiLayers } from "react-icons/fi";

import ProductCard from "../components/ProductCard";
import AddProductModal from "../components/modals/AddProductModal";
import EditProductModal from "../components/modals/EditProductModal";
import ProductDetailModal from "../components/modals/ProductDetailModal";

/* API */
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/productsApi";

import { fetchFabrics } from "../api/fabricApi"; // ดึงจากตาราง Fabric
import { fetchStocks } from "../api/stocksApi";   // ดึงจากตาราง Stock

/* STYLES */
import "../styles/products.css";
import "../styles/modal.css";

export default function Products() {
  // ---------- TAB ----------
  const [activeTab, setActiveTab] = useState("products");

  // ---------- PRODUCTS (ตาราง products) ----------
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // ---------- FABRIC (ตาราง Fabric) ----------
  const [fabrics, setFabrics] = useState([]);
  const [loadingFabrics, setLoadingFabrics] = useState(true);

  // ---------- STOCK (ตาราง Stock) ----------
  const [stocks, setStocks] = useState([]);
  const [loadingStocks, setLoadingStocks] = useState(true);

  // โหลดข้อมูลครั้งแรก
  useEffect(() => {
    loadProducts();
    loadFabrics();
    loadStocks();
  }, []);

  // ---------------- PRODUCTS ----------------
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await fetchProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("โหลดข้อมูล products ผิดพลาด:", err);
      alert("โหลดข้อมูลผลิตภัณฑ์ไม่สำเร็จ");
    } finally {
      setLoadingProducts(false);
    }
  };

  // ---------------- FABRICS ----------------
  const loadFabrics = async () => {
    try {
      setLoadingFabrics(true);
      const data = await fetchFabrics(); // raw จาก PHP

      // 👇 แมป field ให้ตรงกับที่ JSX ใช้
      const mapped = (data || []).map((row) => ({
        id: row.id || row.idFabric || row.fabric_id,
        name: row.name || row.fabric_name || row.details || "-",
        type: row.type || row.category || row.fabric_type || "-",
        width_cm:
          row.width_cm ||
          row.width ||
          row.fabric_width_cm ||
          row.fabric_width ||
          "-",
        status:
          row.status ||
          (row.active === 0 || row.active === "0"
            ? "ไม่พร้อมใช้"
            : "พร้อมใช้"),
      }));

      setFabrics(mapped);
    } catch (err) {
      console.error("โหลดข้อมูล Fabric ผิดพลาด:", err);
      alert("โหลดข้อมูลสต็อกผ้าไม่สำเร็จ");
    } finally {
      setLoadingFabrics(false);
    }
  };

  // ---------------- STOCKS ----------------
  const loadStocks = async () => {
    try {
      setLoadingStocks(true);
      const data = await fetchStocks(); // raw จาก PHP
      console.log("stocks from API:", data);

      const mapped = (data || []).map((row) => {
        // แปลงจำนวนให้เป็นตัวเลขก่อน
        const qty = Number(
          row.quantity ||
            row.qty ||
            row.amount ||
            row.remain_qty ||
            0
        );
        const minQty = Number(row.min_qty || row.minimum || 0);

        let status = row.status;
        if (!status) {
          if (qty <= 0) status = "หมด";
          else if (qty <= minQty && minQty > 0) status = "ใกล้หมด";
          else status = "เพียงพอ";
        }

        return {
          id: row.id || row.idStock || row.stock_id,
          name:
            row.name ||
            row.product_name ||
            row.item_name ||
            `Stock #${row.id || row.idStock}`,
          category: row.category || row.type || row.stock_type || "-",
          quantity: qty,
          location: row.location || row.warehouse || row.position || "-",
          status,
        };
      });

      setStocks(mapped);
    } catch (err) {
      console.error("โหลดข้อมูล Stock ผิดพลาด:", err);
      alert("โหลดข้อมูลคลังสินค้าไม่สำเร็จ");
    } finally {
      setLoadingStocks(false);
    }
  };

  // ---------- CRUD PRODUCTS ----------
  const handleAddProduct = async (newProduct) => {
    try {
      const res = await createProduct(newProduct);
      const created = {
        ...newProduct,
        id: res.id ? res.id.toString() : newProduct.id,
      };
      setProducts((prev) => [...prev, created]);
      setShowAdd(false);
    } catch (err) {
      console.error("เพิ่มผลิตภัณฑ์ผิดพลาด:", err);
      alert("เพิ่มผลิตภัณฑ์ไม่สำเร็จ");
    }
  };

  const handleEditProduct = async (updatedProduct) => {
    try {
      await updateProduct(updatedProduct);
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      setShowEdit(false);
    } catch (err) {
      console.error("แก้ไขผลิตภัณฑ์ผิดพลาด:", err);
      alert("แก้ไขผลิตภัณฑ์ไม่สำเร็จ");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("ต้องการลบผลิตภัณฑ์นี้หรือไม่?")) return;

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("ลบผลิตภัณฑ์ผิดพลาด:", err);
      alert("ลบผลิตภัณฑ์ไม่สำเร็จ");
    }
  };

  // ---------- Filter แท็บผลิตภัณฑ์สำเร็จรูป ----------
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

  // ---------- Summary (ใช้จาก products) ----------
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

  // =========================== RENDER ===========================
  return (
    <div className="products-wrapper">
      {/* HEADER */}
      <div className="products-header">
        <div>
          <h2 className="prod-title">จัดการผลิตภัณฑ์และคลังสินค้า</h2>
          <span className="prod-sub">
            แยกดูสินค้าสำเร็จรูป สต็อกผ้า และคลังสินค้า เพื่อช่วยวางแผนจัดซื้อ
          </span>
        </div>

        {activeTab === "products" && (
          <button className="add-product-btn" onClick={() => setShowAdd(true)}>
            + เพิ่มผลิตภัณฑ์
          </button>
        )}
      </div>

      {/* SUMMARY CARDS (รวมจาก products) */}
      <div className="products-summary-grid">
        <div className="summary-card">
          <span className="icon-box purple">📦</span>
          <div>
            <p className="sum-title">ผลิตภัณฑ์ทั้งหมด</p>
            <h2>{products.length}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="icon-box green">📊</span>
          <div>
            <p className="sum-title">สต็อกรวม (ชิ้น)</p>
            <h2>{totalStock}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="icon-box blue">💰</span>
          <div>
            <p className="sum-title">มูลค่าสต็อกสินค้า</p>
            <h2>฿{totalValue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="icon-box yellow">⚠️</span>
          <div>
            <p className="sum-title">สินค้าใกล้หมด</p>
            <h2>{lowStockCount}</h2>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="prod-tabs">
        <button
          className={activeTab === "products" ? "active" : ""}
          onClick={() => setActiveTab("products")}
        >
          <FiBox /> ผลิตภัณฑ์สำเร็จรูป
        </button>
        <button
          className={activeTab === "fabrics" ? "active" : ""}
          onClick={() => setActiveTab("fabrics")}
        >
          <FiLayers /> สต็อกผ้า (Fabric)
        </button>
        <button
          className={activeTab === "stock" ? "active" : ""}
          onClick={() => setActiveTab("stock")}
        >
          <FiArchive /> คลังสินค้า (Stock)
        </button>
      </div>

      {/* ========== TAB 1 : ผลิตภัณฑ์สำเร็จรูป ========== */}
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
            <div className="loading-text">กำลังโหลดข้อมูลผลิตภัณฑ์...</div>
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
                <div className="empty-state">ยังไม่มีข้อมูลผลิตภัณฑ์</div>
              )}
            </div>
          )}
        </>
      )}

            {/* ========== TAB 2 : สต็อกผ้า (Fabric) ========== */}
{activeTab === "fabrics" && (
  <div className="fabric-stock-section">
    {loadingFabrics ? (
      <div className="loading-text">กำลังโหลดข้อมูลสต็อกผ้า...</div>
    ) : (
      <div className="fabric-table-wrapper">
        <table className="fabric-table">
          <thead>
            <tr>
              <th>รหัสผ้า</th>
              <th>ชื่อผ้า</th>
              <th>ความกว้าง (ซม.)</th>
              <th>น้ำหนัก (g/m²)</th>
              <th>ความหนา (มม.)</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {fabrics.map((f) => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>{f.name}</td>
                <td>{f.width_cm}</td>
                <td>{f.weight_gm}</td>
                <td>{f.thickness_mm}</td>
                <td>{f.status}</td>
              </tr>
            ))}

            {fabrics.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  ยังไม่มีข้อมูลผ้าในคลัง (Fabric)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

      {/* ========== TAB 3 : คลังสินค้า (Stock) ========== */}
      {activeTab === "stock" && (
        <div className="warehouse-section">
          <div className="warehouse-hint">
            มุมมองคลังสินค้าแสดงข้อมูลจากตาราง <b>Stock</b> ใช้ดูว่ารายการไหนใกล้หมด
            และควรจัดซื้อเพิ่ม
          </div>

          {loadingStocks ? (
            <div className="loading-text">กำลังโหลดข้อมูลคลังสินค้า...</div>
          ) : (
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
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.name}</td>
                      <td>{s.category}</td>
                      <td>{s.quantity}</td>
                      <td>{s.location}</td>
                      <td>
                        <span
                          className={`wh-status ${
                            s.status === "หมด"
                              ? "wh-danger"
                              : s.status === "ใกล้หมด"
                              ? "wh-warning"
                              : "wh-ok"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {stocks.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        ยังไม่มีข้อมูลในตาราง Stock
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
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
    </div>
  );
}