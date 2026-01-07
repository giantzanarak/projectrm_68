// src/pages/Products.jsx
import { useState, useMemo } from "react";
import { FiSearch, FiFilter, FiBox, FiArchive, FiLayers } from "react-icons/fi";

import ProductCard from "../components/ProductCard";
import AddProductModal from "../components/modals/AddProductModal";
import EditProductModal from "../components/modals/EditProductModal";
import ProductDetailModal from "../components/modals/ProductDetailModal";

/* STYLES */
import "../styles/products.css";
import "../styles/modal.css";

/* ================= MOCK DATA (ไม่พึ่ง backend) ================= */

const MOCK_PRODUCTS = [
  {
    id: "P001",
    name: "ชุดไทยจักรพรรดิ ผ้าไหมแท้",
    type: "ชุดสำเร็จรูป",
    pattern: "ลายดอกประจำยาม",
    price: 4500,
    stock: 5,
    image:
      "https://i.pinimg.com/1200x/b7/6c/1b/b76c1b9fbab0528a0993c8c1e04910b7.jpg",
  },
  {
    id: "P002",
    name: "ชุดไทยบรมพิมาน สีครามทอง",
    type: "ชุดสำเร็จรูป",
    pattern: "ลายกนกใบเทศ",
    price: 5200,
    stock: 3,
    image:
      "https://i.pinimg.com/736x/ad/1a/32/ad1a32e535731d7a55d1c30ace6460b4.jpg",
  },
  {
    id: "P003",
    name: "ชุดไทยอมรินทร์ ผ้าไหมทอยกลาย",
    type: "ชุดสำเร็จรูป",
    pattern: "ลายโบราณ",
    price: 4800,
    stock: 4,
    image:
      "https://i.pinimg.com/1200x/f1/e9/6d/f1e96db21aa7fe21a6674eb3c86c06fa.jpg",
  },
  {
    id: "P004",
    name: "ผ้าซิ่นมัดหมี่ลายขอเจ้าฟ้า",
    type: "ผ้าซิ่นสำเร็จรูป",
    pattern: "มัดหมี่",
    price: 3500,
    stock: 8,
    image:
      "https://i.pinimg.com/736x/f5/a0/a6/f5a0a6c40303547575ce07fe9b67145e.jpg",
  },
  {
    id: "P005",
    name: "ผ้าฝ้ายทอมือย้อมคราม",
    type: "ผ้าพับเมตร",
    pattern: "ลายทาง",
    price: 650,
    stock: 20,
    image:
      "https://i.pinimg.com/736x/5e/6d/ea/5e6dea1fb63f9ea50f53e9f01d918993.jpg",
  },
  {
    id: "P006",
    name: "ผ้าไหมแท้ลายดอกพิกุล",
    type: "ผ้าพับเมตร",
    pattern: "ลายดอก",
    price: 1200,
    stock: 12,
    image:
      "https://i.pinimg.com/736x/1c/7b/1e/1c7b1e5f42ddfa5b4d116d1d2372a8e2.jpg",
  },
];

const MOCK_FABRICS = [
  {
    id: "F001",
    name: "ผ้าไหมมัดหมี่ลายโบราณ",
    width_cm: 100,
    weight_gm: 120,
    thickness_mm: 0.35,
    status: "พร้อมใช้",
  },
  {
    id: "F002",
    name: "ผ้าฝ้ายทอมือย้อมคราม",
    width_cm: 90,
    weight_gm: 180,
    thickness_mm: 0.45,
    status: "พร้อมใช้",
  },
  {
    id: "F003",
    name: "ผ้าไหมยกดอกทอง",
    width_cm: 100,
    weight_gm: 150,
    thickness_mm: 0.4,
    status: "ต้องตรวจสอบ",
  },
  {
    id: "F004",
    name: "ผ้าขิดลายดอกแก้ว",
    width_cm: 80,
    weight_gm: 200,
    thickness_mm: 0.5,
    status: "พร้อมใช้",
  },
];

const MOCK_STOCKS = [
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

/* ================= COMPONENT ================= */

export default function Products() {
  // ---------- TAB ----------
  const [activeTab, setActiveTab] = useState("products");

  // ---------- PRODUCTS (ใช้ mock) ----------
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [loadingProducts] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // ---------- FABRIC (mock) ----------
  const [fabrics] = useState(MOCK_FABRICS);
  const [loadingFabrics] = useState(false);

  // ---------- STOCK (mock) ----------
  const [stocks] = useState(MOCK_STOCKS);
  const [loadingStocks] = useState(false);

  // ---------- CRUD PRODUCTS (แก้เฉพาะ state ไม่ยิง API) ----------
  const handleAddProduct = (newProduct) => {
    // ถ้าไม่มี id ให้ generate จากเวลา
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
            มุมมองคลังสินค้าแสดงข้อมูลจากรายการอุปกรณ์และบรรจุภัณฑ์
            ใช้ดูว่ารายการไหนใกล้หมดและควรจัดซื้อเพิ่ม
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
                        ยังไม่มีข้อมูลในรายการสต็อก
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