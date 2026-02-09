// src/pages/Products.jsx
import { useState, useMemo, useEffect } from "react";
import { Pagination } from "antd";
import {
  FiSearch,
  FiFilter,
  FiBox,
  FiArchive,
  FiTrash2,
  FiEdit2,
  FiEye,
} from "react-icons/fi";

import "../styles/products.css"; 

import { GetProducts, GetProduct, GetStocks } from "../components/api/admin";

const STOCK_PAGE_SIZE = 6;

const STOCK_STATUS_OPTIONS = [
  "เพียงพอ",
  "ใกล้หมด",
  "หมด",
  "พร้อมใช้",
  "ต้องตรวจสอบ",
];

// =========================== MAIN PAGE ===========================
export default function Products() {
  const [activeTab, setActiveTab] = useState("products");
  const [detailLoading, setDetailLoading] = useState(false);
  const handleOpenDetail = async (p) => {
    try {
      setDetailLoading(true);
      setShowDetail(true);

      const fullData = await GetProduct(p.idProducts || p.id || p.code);

      setSelectedProduct(fullData);
    } catch (err) {
      console.error("Error fetching product detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await GetProducts();
      setProducts(data);
    } catch (err) {
      console.error("โหลดข้อมูลไม่สำเร็จ:", err);
    } finally {
      setLoadingProducts(false);
    }
  };
  const [stocks, setStocks] = useState([]); 
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockMode, setStockMode] = useState("add"); 
  const [selectedStock, setSelectedStock] = useState(null);
  const handleSaveProduct = async (formData) => {
    try {
      const response = await fetch('http://localhost:3010/products/add_product', {
        method: 'POST',
        body: formData, 
      });

      if (response.ok) {
        alert("บันทึกสินค้าสำเร็จ!");
        setShowAdd(false); 
        loadProducts();
      } else {
        const err = await response.json();
        alert("ล้มเหลว: " + err.message);
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const loadStock = async () => {
    try {
      const response = await fetch('http://localhost:3010/Stock');
      const data = await response.json();
      setStocks(data);
    } catch (error) {
      console.error("Error loading stock:", error);
    }
  };

  const handleSaveStock = async (formData, id) => {
    console.log("Saving Data:", formData); 
    console.log("Target ID:", id);        

    if (stockMode === "edit" && !id) {
      alert("ไม่พบ ID ของสต็อกที่ต้องการแก้ไข");
      return;
    }

    const url = stockMode === "edit"
      ? `http://localhost:3010/Stock/edit_stock/${id}`
      : `http://localhost:3010/Stock/add_stock`;

    try {
      const response = await fetch(url, {
        method: stockMode === "edit" ? "PUT" : "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json(); 
      console.log("Server Response:", result);

      if (response.ok) {
        alert("บันทึกข้อมูลเรียบร้อย");
        loadStock();
        setShowStockEdit(false);
      } else {
        alert("บันทึกไม่สำเร็จ: " + result.message);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  };
  // ---------- PRODUCTS ----------
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // ---------- STOCK ----------
  const [showStockAdd, setShowStockAdd] = useState(false);
  const [showStockEdit, setShowStockEdit] = useState(false);

  const [stockSearch, setStockSearch] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("ทั้งหมด");
  const [stockPage, setStockPage] = useState(1);
  const [loadingStocks, setLoadingStocks] = useState(true);

  // ---------- LOAD DATA FROM API ----------
  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingProducts(true);
        setLoadingStocks(true);

        const [prodRes, stockRes] = await Promise.all([
          GetProducts(),
          GetStocks(),
        ]);

        setProducts(prodRes || []);
        setStocks(stockRes || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoadingProducts(false);
        setLoadingStocks(false);
      }
    }
    fetchData();
  }, []);

  const handleUpdateProduct = async (formData, id) => {
    try {
      const response = await fetch(`http://localhost:3010/products/edit_product/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();
      console.log("Server Response:", result);

      if (response.ok) {
        alert("แก้ไขสำเร็จ");
        setShowEdit(false); // ปิด Modal แก้ไข
        loadProducts();     // รีโหลดรายการสินค้าใหม่
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };
  // ---------- CRUD PRODUCTS (ตอนนี้จัดการแค่ใน state) ----------
  const handleAddProduct = (newProduct) => {
    const id =
      newProduct.id ||
      newProduct.idProducts ||
      `P${Date.now().toString().slice(-5)}`;

    const created = {
      ...newProduct,
      id,
    };
    setProducts((prev) => [...prev, created]);
    setShowAdd(false);
  };

  const handleEditProduct = (updatedProduct) => {
    const id =
      updatedProduct.id || updatedProduct.idProducts || updatedProduct.code;
    setProducts((prev) =>
      prev.map((p) =>
        (p.id || p.idProducts) === id ? { ...p, ...updatedProduct } : p
      )
    );
    setShowEdit(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (id) => {
  // 1. ยืนยันการลบ
  if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้ารหัส ${id}?`)) return;

  try {
    // 2. ยิง API ไปที่ฝั่ง products (เช็ค URL ของคุณว่าใช้ /products/delete_product หรือไม่)
    const response = await fetch(`http://localhost:3010/products/delete_product/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert("ลบสินค้าเรียบร้อยแล้ว");
      
      // 3. โหลดข้อมูลสินค้าใหม่ (ใช้ฟังก์ชันที่คุณใช้โหลดหน้า Products)
      // สมมติว่าชื่อ loadProducts();
      if (typeof loadProducts === "function") {
        loadProducts();
      }
    } else {
      const err = await response.json();
      alert("ไม่สามารถลบได้: " + err.message);
    }
  } catch (error) {
    console.error("Delete product error:", error);
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
  }
};

  // ---------- FILTER + SORT PRODUCTS ----------
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = [...products]; // clone array ก่อนเสมอ

    // ===== SEARCH =====
    if (term) {
      result = result.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const type = (p.type_name || p.type || "").toLowerCase();
        const pattern = (p.pattern || p.category_name || "").toLowerCase();

        return (
          name.includes(term) ||
          type.includes(term) ||
          pattern.includes(term)
        );
      });
    }

    // ===== SORT : 1 → 2 → 3 → 4 → 5 =====
    result.sort((a, b) => {
      const aId = Number(a.idProducts ?? a.id ?? a.code ?? 0);
      const bId = Number(b.idProducts ?? b.id ?? b.code ?? 0);
      return aId - bId; // 🔥 น้อยไปมาก
    });

    return result;
  }, [products, searchTerm]);


  // ---------- PAGINATION PRODUCTS ----------
  const pagedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage, pageSize]);


  // ---------- SUMMARY ----------
  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.stock ?? p.stock_amount ?? 0),
    0
  );

  const totalValue = products.reduce((sum, p) => {
    const stock = Number(p.stock ?? p.stock_amount ?? 0);
    const price = Number(p.price ?? p.price_per_piece ?? 0);
    return sum + stock * price;
  }, 0);

  const lowStockCount = products.filter(
    (p) => Number(p.stock ?? p.stock_amount ?? 0) < 6
  ).length;

  // ---------- CRUD STOCK (เฉพาะ state) ----------
  const handleAddStock = async (formData) => {
  try {
    const response = await fetch('http://localhost:3010/Stock/add_stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // ส่งข้อมูลให้ตรงกับชื่อคอลัมน์ใน DB
      body: JSON.stringify({
        category_id: formData.category_id || 1,
        stock_name: formData.stock_name,
        stock_colors: formData.stock_colors || "",
        price: formData.price || 0,
        size: formData.size || "-",
        unit: formData.unit || "ชิ้น",
        stock_amount: formData.stock_amount || 0,
        storage: formData.storage || "",
        status_id: formData.status_id || 1
      }),
    });

    if (response.ok) {
      alert("เพิ่มรายการสต็อกสำเร็จ");
      // เรียกฟังก์ชันโหลดข้อมูลใหม่เพื่อให้ตารางอัปเดต
      if (typeof loadStockData === "function") {
        loadStockData(); 
      }
      setShowStockAdd(false);
    } else {
      const error = await response.json();
      alert("เพิ่มไม่สำเร็จ: " + error.message);
    }
  } catch (err) {
    console.error("Add Stock Error:", err);
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
  }
};
  const handleEditStock = (data) => {
    setStocks((prev) =>
      prev.map((s) =>
        (s.id || s.stock_id) === (data.id || data.stock_id)
          ? {
            ...s,
            stock_name: data.name || "",
            category_name: data.category || "",
            stock_amount: Number(data.quantity || 0),
            storage: data.location || "",
            status_status: data.status || "เพียงพอ",
          }
          : s
      )
    );
    setShowStockEdit(false);
    setSelectedStock(null);
  };

  const handleDeleteStock = async (id) => {
    // 1. ถามเพื่อความแน่ใจก่อนลบ
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;

    try {
      const response = await fetch(`http://localhost:3010/Stock/delete_stock/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("ลบข้อมูลสำเร็จ");
        // ✅ เรียกฟังก์ชันโหลดข้อมูลใหม่ (ใช้ชื่อที่คุณแก้ไขจาก loadStock รอบที่แล้ว)
        loadStock();
      } else {
        const err = await response.json();
        alert("ลบไม่สำเร็จ: " + err.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // ---------- FILTER + PAGINATION STOCK ----------
  const filteredStocks = useMemo(() => {
    const term = stockSearch.trim().toLowerCase();

    return stocks.filter((s) => {
      const id = (s.id || s.stock_id || "").toString().toLowerCase();
      const name = (s.stock_name || s.name || "").toLowerCase();
      const category = (s.category_name || s.category || "").toLowerCase();
      const location = (s.storage || s.location || "").toLowerCase();

      const matchTerm =
        !term ||
        id.includes(term) ||
        name.includes(term) ||
        category.includes(term) ||
        location.includes(term);

      const status = s.status_status || s.status;
      const matchStatus =
        stockStatusFilter === "ทั้งหมด" || status === stockStatusFilter;

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
    if (status === "พร้อมใช้") return "wh-ok";
    if (status === "ต้องตรวจสอบ") return "wh-check";
    if (status === "ใกล้หมด") return "wh-warning";
    if (status === "หมด") return "wh-danger";
    return "wh-ok";
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
          <button className="add-product-btn" onClick={() => setShowAdd(true)}>
            + เพิ่มผลิตภัณฑ์
          </button>
        )}
        {activeTab === "stock" && (
          <button className="add-stock-btn" onClick={() => setShowStockAdd(true)}>
            + เพิ่มรายการคลัง
          </button>
        )}
      </div>

      {/* SUMMARY CARDS */}
      <div className="products-summary-grid">
        <div className="prod-summary-card">
          <div className="prod-summary-icon purple">
            <img src="/pic/box-2.png" />
          </div>

          <div className="prod-summary-text">
            <p className="prod-summary-title">ผลิตภัณฑ์ทั้งหมด</p>
            <h2 className="prod-summary-value">{products.length}</h2>
          </div>
        </div>

        <div className="prod-summary-card">
          <div className="prod-summary-icon green">
            <img src="/pic/product-2.png" />
          </div>
          <div className="prod-summary-text">
            <p className="prod-summary-title">สต็อกรวม (ชิ้น)</p>
            <h2 className="prod-summary-value">{totalStock}</h2>
          </div>
        </div>

        <div className="prod-summary-card">
          <div className="prod-summary-icon blue">
            <img src="/pic/profit.png" />
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
            <img src="/pic/warning-2.png" />
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
          <FiArchive /> รวมสต็อกผ้า
        </button>
      </div>

      {/* ========== TAB : ผลิตภัณฑ์ ========== */}
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
              {pagedProducts.map((p) => (
                <ProductCard
                  key={p.id || p.idProducts}
                  product={p}
                  onDetail={() => handleOpenDetail(p)} // เรียกใช้ฟังก์ชันใหม่ที่สร้างขึ้น
                  onEdit={() => {
                    setSelectedProduct(p);
                    setShowEdit(true);
                  }}
                  onDelete={() => handleDeleteProduct(p.id || p.idProducts || p.code)}
                />
              ))}

              {pagedProducts.length === 0 && (
                <div className="empty-state">ยังไม่มีข้อมูลผลิตภัณฑ์</div>
              )}
            </div>
          )}

          <div
            className="pagination-wrapper"
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredProducts.length}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              showTotal={(total) => `Total ${total} items`}
              showSizeChanger={true}
              pageSizeOptions={["6", "10", "20", "50"]}
              showQuickJumper={true}
            />
          </div>
        </>
      )}

      {/* ========== TAB : STOCK ========== */}
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
            <div className="loading-text">กำลังโหลดข้อมูลคลังสินค้า...</div>
          ) : (
            <>
              <div className="warehouse-table-wrapper">
                <table className="warehouse-table">
                  <thead>
                    <tr>
                      <th>รหัสสต็อก</th>
                      <th>ชื่อรายการ</th>
                      <th>ประเภท</th>
                      <th>สี</th>
                      <th>จำนวนคงเหลือ</th>
                      <th>ตำแหน่งเก็บ</th>
                      <th>สถานะ</th>
                      <th>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedStocks.map((s) => (
                      <tr key={s.stock_id || s.id}>
                        <td>{s.stock_id || s.id}</td>
                        <td>{s.stock_name || s.name}</td>
                        <td>{s.category_name || s.category}</td>
                        <td>{s.stock_colors || "-"}</td>
                        <td>{s.stock_amount}</td>
                        <td>{s.storage || s.location}</td>
                        <td>
                          <span
                            className={`wh-status ${getStatusClass(
                              s.status_status || s.status
                            )}`}
                          >
                            {s.status_status || s.status}
                          </span>
                        </td>
                        <td>
                          <div className="stock-actions">
                            <button
                              className="stock-action-btn edit"
                              onClick={() => {
                                setSelectedStock({
                                  stock_id: s.stock_id || s.id,         // ต้องใช้ stock_id
                                  stock_name: s.stock_name || s.name,   // ต้องใช้ stock_name
                                  category_id: s.category_id,           // ต้องส่ง ID ไปเพื่อให้ Select เลือกค่าถูก
                                  stock_amount: s.stock_amount,         // ต้องใช้ stock_amount
                                  storage: s.storage || s.location,     // ต้องใช้ storage
                                  status_id: s.status_id,               // ต้องส่ง ID ไปเพื่อให้ Select เลือกค่าถูก
                                  stock_colors: s.stock_colors || "",   // ส่งสีไป
                                  price: s.price,
                                  size: s.size,
                                  unit: s.unit
                                });
                                setStockMode("edit"); // มั่นใจว่าตั้ง mode เป็น edit
                                setShowStockEdit(true);
                              }}
                            >
                              แก้ไข
                            </button>
                            <button
                              className="stock-action-btn delete"
                              onClick={() => handleDeleteStock(s.stock_id)} // ✅ ส่ง stock_id ไปที่ฟังก์ชันลบ
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

      {/* ===== MODALS : PRODUCTS ===== */}
      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onSave={handleSaveProduct}
        />
      )}

      {showEdit && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => {
            setShowEdit(false);
            setSelectedProduct(null);
          }}
          onSave={handleUpdateProduct}
        />
      )}

      {showDetail && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => {
            setShowDetail(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* ===== MODALS : STOCK ===== */}
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
          onSave={handleSaveStock}
        />
      )}
    </div>
  );
}

// =========================== PRODUCT CARD ===========================
function ProductCard({ product, onDetail, onEdit, onDelete }) {
  if (!product) return null;

  const id = product.id || product.idProducts || product.code || "-";
  const name = product.name || product.stock_name || "ไม่ระบุชื่อสินค้า";
  const pattern = product.pattern || product.category_name || "";
  const width = product.width || product.width_inch || null;
  const length_m = product.length_m || product.length_meter || null;
  const price =
    product.price || product.price_per_piece || product.price_per_meter || 0;
  const stockRaw = product.stock ?? product.stock_amount ?? 0;
  const image = product.image || product.image_url || null;

  const qty = Number(stockRaw ?? 0);

  let stockLabel = "";
  let stockClass = "";

  if (Number.isFinite(qty)) {
    if (qty <= 0) {
      stockLabel = "หมด";
      stockClass = "danger";
    } else if (qty <= 10) {
      stockLabel = `ใกล้หมด ${qty} ชิ้น`;
      stockClass = "warning";
    } else {
      stockLabel = `คงเหลือ ${qty} ชิ้น`;
      stockClass = "ok";
    }
  }

  return (
    <div className="prod-card-admin">
      {/* รูปสินค้า */}
      <div className="prod-card-img-wrap">
        <img
          src={
            image
              ? `http://127.0.0.1:3010/static/images/${image}`
              : "https://images.pexels.com/photos/3738087/pexels-photo-3738087.jpeg"
          }
          alt={name}
          className="prod-card-img"
        />

        <span className="prod-chip-id">{id}</span>

        {Number.isFinite(qty) && (
          <span className={`prod-chip-stock ${stockClass}`}>{stockLabel}</span>
        )}
      </div>

      {/* เนื้อหาในการ์ด */}
      <div className="prod-card-body">
        <h3 className="prod-card-name">{name}</h3>

        {pattern && <p className="prod-card-desc">{pattern}</p>}

        <div className="prod-meta-grid">
          {width && (
            <p>
              <span className="meta-label">ความกว้าง</span>
              <span className="meta-value">{width} นิ้ว</span>
            </p>
          )}

          {length_m && (
            <p>
              <span className="meta-label">ความยาวต่อชุด</span>
              <span className="meta-value">{length_m} เมตร</span>
            </p>
          )}

          {Number.isFinite(qty) && (
            <p>
              <span className="meta-label">สต็อก</span>
              <span className="meta-value">
                {Number.isNaN(qty) ? 0 : qty} ชิ้น
              </span>
            </p>
          )}

          {price && (
            <p>
              <span className="meta-label">ราคาขาย</span>
              <span className="meta-value price">
                ฿{Number(price).toLocaleString()}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* ปุ่มด้านล่าง */}
      <div className="prod-card-footer">
        <button className="btn-outline-gray" onClick={onDetail}>
          <FiEye /> ดูรายละเอียด
        </button>

        <div className="prod-footer-right">
          <button className="icon-btn" onClick={onEdit}>
            <FiEdit2 />
          </button>
          <button className="icon-btn danger" onClick={onDelete}>
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================== MODAL : ADD PRODUCT ===========================
function AddProductModal({ onClose, onSave }) {
  const [fabricTypes, setFabricTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    type_id: "",
    pattern_id: "",
    color: "",
    size_id: "",
    price: "",
    stock_amount: "",
    image: "",
    description: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูลจาก Port 3010
        const [resCat, resType, resSize] = await Promise.all([
          // category_list อยู่ภายใต้ /products
          fetch('http://localhost:3010/products/categories_list').then(res => {
            if (!res.ok) throw new Error('Category API error');
            return res.json();
          }),
          // types_list อยู่ภายใต้ /products
          fetch('http://localhost:3010/products/types_list').then(res => {
            if (!res.ok) throw new Error('Types API error');
            return res.json();
          }),
          // sizes อยู่ภายใต้ /sizes (ตามที่ประกาศใน app.use('/sizes', sizesRoutes))
          fetch('http://localhost:3010/sizes').then(res => {
            if (!res.ok) throw new Error('Sizes API error');
            return res.json();
          })
        ]);

        setCategories(resCat);
        setFabricTypes(resType);
        setSizes(resSize);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }

    // สร้าง FormData เพื่อรวมไฟล์และข้อความ
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category_id", form.pattern_id); // ลวดลาย -> category_id
    formData.append("type_id", form.type_id);       // ประเภท -> type_id
    formData.append("product_colors", form.color);  // สี -> product_colors
    formData.append("size_id", form.size_id);       // ไซส์ -> size_id
    formData.append("price", form.price);
    formData.append("stock_amount", form.stock_amount);
    formData.append("description", form.description);

    // ดึงไฟล์จริงจาก input (ไม่ใช่ base64 string)
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files[0]) {
      formData.append("image", fileInput.files[0]);
    }

    onSave(formData); // ส่ง FormData ไปยังฟังก์ชันจัดการ API
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">เพิ่มผลิตภัณฑ์</h2>
        <div className="modal-form">
          <div className="modal-field">
            <label>รูปภาพสินค้า</label>
            <div
              className="image-upload-area"
              onClick={() => document.getElementById('fileInput').click()}
              style={{ border: '2px dashed #ddd', borderRadius: '12px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f9f9f9', overflow: 'hidden', marginBottom: '10px' }}
            >
              {form.image ? (
                <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <p style={{ color: '#aaa' }}>คลิกเพื่อเลือกไฟล์รูปภาพ</p>
              )}
            </div>
            <input id="fileInput" type="file" name="image" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
          </div>

          <div className="modal-field">
            <label>ชื่อสินค้า</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="ระบุชื่อสินค้า" />
          </div>
          <div className="modal-field">
            <label>ประเภท</label>
            <select name="type_id" value={form.type_id} onChange={handleChange}>
              <option value="">เลือกประเภท</option>
              {fabricTypes.map((t) => (
                <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
              ))}
            </select>
          </div>

          <div className="modal-form two-col">
            <div className="modal-field">
              <label>ลวดลาย</label>
              <select name="pattern_id" value={form.pattern_id} onChange={handleChange}>
                <option value="">เลือกหมวดหมู่ลวดลาย</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>
            <div className="modal-field">
              <label>สี</label>
              <input name="color" value={form.color} onChange={handleChange} placeholder="ระบุสี" />
            </div>
          </div>
          <div className="modal-form two-col">
            <div className="modal-field">
              <label>ไซส์ (size_id)</label>
              <select name="size_id" value={form.size_id} onChange={handleChange}>
                <option value="">เลือกไซส์</option>
                {sizes.map((s) => (
                  <option key={s.size_id} value={s.size_id}>
                    {s.size} {/* หรือ s.size_name ตามที่ DB ส่งมา */}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-field">
              <label>ราคา (price)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          {/* 5. สต็อก - แถวเดี่ยว (หรือจะเอาไปไว้คู่กับราคาด้านบนก็ได้) */}
          <div className="modal-field">
            <label>สต็อก (stock_amount)</label>
            <input name="stock_amount" type="number" value={form.stock_amount} onChange={handleChange} placeholder="0" />
          </div>

          {/* 6. รายละเอียด - แถวเดี่ยวเต็มความกว้าง */}
          <div className="modal-field">
            <label>รายละเอียด (description)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="กรอกรายละเอียดสินค้า"
              style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd', padding: '10px', minHeight: '80px' }}
            />
          </div>

          <div className="modal-buttons">
            <button className="btn-cancel" onClick={onClose}>ยกเลิก</button>
            <button className="btn-save" onClick={handleSubmit}>บันทึกข้อมูล</button>
          </div>
        </div>
      </div>
    </div>
  );
}
// =========================== MODAL : EDIT PRODUCT ===========================
function EditProductModal({ product, onClose, onSave }) {
  const [categories, setCategories] = useState([]);
  const [fabricTypes, setFabricTypes] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [form, setForm] = useState({
    idProducts: product?.idProducts || "",
    name: product?.name || "",
    category_id: product?.category_id || "",
    type_id: product?.type_id || "",
    pattern_id: product?.category_id || "", // ลวดลายเชื่อมกับ category
    id_colors: product?.product_colors || product?.id_colors || "",
    size_id: product?.size_id || "",
    price: product?.price || "",
    stock_amount: product?.stock_amount || "",
    description: product?.description || "",
    image: product?.image || ""
  });

  const imageStyle = {
    width: '100%',
    height: '200px',
    border: '2px dashed #ddd',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
    marginBottom: '10px'
  };

  const previewStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  };

  const textareaStyle = {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #ddd',
    padding: '10px',
    minHeight: '80px'
  };

  // 1. ดึงข้อมูลสำหรับ Dropdown เมื่อเปิด Modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCat, resType, resSize] = await Promise.all([
          fetch('http://localhost:3010/products/categories_list').then(res => res.json()),
          fetch('http://localhost:3010/products/types_list').then(res => res.json()),
          fetch('http://localhost:3010/sizes').then(res => res.json())
        ]);
        setCategories(resCat);
        setFabricTypes(resType);
        setSizes(resSize);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category_id", form.pattern_id); // ใช้ค่าจาก pattern_id
    formData.append("type_id", form.type_id);
    formData.append("id_colors", form.id_colors);
    formData.append("size_id", form.size_id);
    formData.append("price", form.price);
    formData.append("stock_amount", form.stock_amount);
    formData.append("description", form.description);

    formData.append("unit", form.unit || "");
    formData.append("Fabric_idFabric", form.Fabric_idFabric || "");

    const fileInput = document.getElementById('editFileInput');
    if (fileInput && fileInput.files[0]) {
      formData.append("image", fileInput.files[0]);
    }

    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    onSave(formData, form.idProducts);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">แก้ไขผลิตภัณฑ์</h2>

        <div className="modal-form">
          <div className="modal-field">
            <label>รูปภาพสินค้า</label>
            <div className="image-upload-area" onClick={() => document.getElementById('editFileInput').click()} style={imageStyle}>
              {form.image ? <img src={form.image} alt="Preview" style={previewStyle} /> : <span>🖼️ คลิกเพื่อเปลี่ยนรูป</span>}
            </div>
            <input id="editFileInput" type="file" name="image" style={{ display: 'none' }} onChange={handleChange} />
          </div>

          <div className="modal-field">
            <label>ชื่อสินค้า</label>
            <input name="name" value={form.name} onChange={handleChange} />
          </div>

          <div className="modal-field">
            <label>ประเภท</label>
            <select name="type_id" value={form.type_id} onChange={handleChange}>
              <option value="">เลือกประเภท</option>
              {fabricTypes.map((t) => (
                <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
              ))}
            </select>
          </div>

          <div className="modal-form two-col">
            <div className="modal-field">
              <label>ลวดลาย</label>
              <select name="pattern_id" value={form.pattern_id} onChange={handleChange}>
                <option value="">เลือกหมวดหมู่ลวดลาย</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>
            <div className="modal-field">
              <label>สี</label>
              <input name="id_colors" value={form.id_colors} onChange={handleChange} />
            </div>
          </div>

          <div className="modal-form two-col">
            <div className="modal-field">
              <label>ไซส์</label>
              <select name="size_id" value={form.size_id} onChange={handleChange}>
                <option value="">เลือกไซส์</option>
                {sizes.map((s) => (
                  <option key={s.size_id} value={s.size_id}>{s.size}</option>
                ))}
              </select>
            </div>
            <div className="modal-field">
              <label>ราคา</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} />
            </div>
          </div>

          <div className="modal-field">
            <label>สต็อก</label>
            <input name="stock_amount" type="number" value={form.stock_amount} onChange={handleChange} />
          </div>

          <div className="modal-field">
            <label>รายละเอียด</label>
            <textarea name="description" value={form.description} onChange={handleChange} style={textareaStyle} />
          </div>
        </div>

        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="btn-save" onClick={handleSubmit}>บันทึกการแก้ไข</button>
        </div>
      </div>
    </div>
  );
}
// =========================== MODAL : PRODUCT DETAIL ===========================
function ProductDetailModal({ product, onClose }) {
  const stock = Number(product.stock ?? product.stock_amount ?? 0);
  const price =
    product.price || product.price_per_piece || product.price_per_meter || 0;

  const color = product.product_colors || "ไม่ระบุ";

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });


  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="detail-layout">
          {/* ส่วนรูปภาพ */}
          <div className="detail-image-wrap">
            {product.image || product.image_url ? (
              <img
                src={`http://127.0.0.1:3010/static/images/${product.image || product.image_url}`}
                alt={product.name}
                className="detail-image"
              />
            ) : (
              <div className="no-image-container"><span>ไม่มีรูปภาพ</span></div>
            )}
            <span className="detail-chip-id">#{product.id || product.idProducts || product.code || product.product_colors}</span>
          </div>

          {/* ส่วนข้อมูล */}
          <div className="detail-info">
            <div className="info-header">
              <h2 className="detail-title">{product.name}</h2>
              <p className="detail-sub">ดูรายละเอียดสินค้า สต็อก และข้อมูลขนาด</p>
            </div>

            {/* ข้อมูลทั่วไป */}
            <div className="detail-grid">
              <div className="detail-field">
                <span className="detail-label">ประเภทผ้า</span>
                <span className="detail-value">{product.type_name || "-"}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">ลวดลาย / หมวดหมู่</span>
                <span className="detail-value">{product.pattern || product.category_name || "-"}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">ความกว้าง</span>
                <span className="detail-value">{product.width ? `${product.width} นิ้ว` : "-"}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">ความยาวต่อชุด</span>
                <span className="detail-value">{product.length_m ? `${product.length_m} เมตร` : "-"}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">สต็อกคงเหลือ</span>
                <span className="detail-value" style={{ color: stock < 10 ? "#ef4444" : "#1f2937" }}>
                  {formatCurrency(stock)} ชิ้น
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-label">ราคาต่อชิ้น</span>
                <span className="detail-value price">฿{formatCurrency(price)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">สี:</span>
                {/* เปลี่ยนจาก product_colors เป็น color ให้ตรงกับที่ประกาศไว้ด้านบน */}
                <span className="detail-value">{color}</span>
              </div>
            </div>

            {/* --- ส่วนข้อมูลไซส์ (ดึงจาก product ที่ Join มาแล้ว) --- */}
            <div style={{ marginTop: '20px', borderTop: '2px solid #3b82f6', paddingTop: '15px' }}>
              <h3 style={{ marginBottom: '15px', color: '#1e40af', fontSize: '1.1rem' }}>รายละเอียดขนาด (Size Guide)</h3>
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="detail-label">ไซส์หลัก</span>
                  <span className="detail-value" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                    {product.size || "ไม่ระบุ"}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">หน้าอก</span>
                  <span className="detail-value">{product.bust ?? "-"} {product.size_unit || "นิ้ว"}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">เอว</span>
                  <span className="detail-value">{product.bust ?? "-"} {product.size_unit || "นิ้ว"}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">สะโพก</span>
                  <span className="detail-value">{product.bust ?? "-"} {product.size_unit || "นิ้ว"}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">ความยาวเสื้อ</span>
                  <span className="detail-value">{product.bust ?? "-"} {product.size_unit || "นิ้ว"}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">ไหล่กว้าง</span>
                  <span className="detail-value">{product.bust ?? "-"} {product.size_unit || "นิ้ว"}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">ความยาวแขน</span>
                  <span className="detail-value">{product.bust ?? "-"} {product.size_unit || "นิ้ว"}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">รอบวงแขน</span>
                  <span className="detail-value">{product.bust ?? "-"} {product.size_unit || "นิ้ว"}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">ปริมาณผ้าที่ใช้</span>
                  <span className="detail-value" style={{ color: '#059669', fontWeight: 'bold' }}>
                    {product.use_m ?? "-"} เมตร
                  </span>
                </div>
              </div>
            </div>

            <div className="stock-value-summary">
              <span className="summary-label">มูลค่าสต็อกรวมโดยประมาณ</span>
              <span className="summary-value">฿{formatCurrency(stock * price)}</span>
            </div>

            <p className="detail-note">
              <span>หากต้องการแก้ไขข้อมูล กรุณาปิดหน้านี้และกดปุ่ม <strong>"แก้ไข"</strong></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// =========================== MODAL : STOCK (ADD / EDIT) ===========================
function StockModal({ mode, initial, onClose, onSave }) {
  const isEdit = mode === "edit";

  // สร้าง State สำหรับเก็บตัวเลือกจาก DB (ถ้ามี API สำหรับดึงข้อมูลเหล่านี้)
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [types, setTypes] = useState([]);

  const [form, setForm] = useState({
    stock_id: initial?.stock_id || "",
    stock_name: initial?.stock_name || "",
    category_id: initial?.category_id || "",
    stock_amount: initial?.stock_amount || 0,
    storage: initial?.storage || "",
    status_id: initial?.status_id || "",
    price: initial?.price || 0,
    size: initial?.size || "",
    unit: initial?.unit || "",
    stock_colors: initial?.stock_colors || ""
  });

  // ดึงข้อมูล Categories และ Statuses มาแสดงใน Dropdown
  useEffect(() => {
    // สมมติว่ามี endpoint เหล่านี้
    fetch('http://localhost:3010/products/categories_list').then(res => res.json()).then(setCategories);
    // และ endpoint สำหรับดึงสถานะ
    // fetch('http://localhost:3010/stock/statuses_list').then(res => res.json()).then(setStatuses);
  }, []);


  useEffect(() => {
    // เปลี่ยน Endpoint ให้ตรงกับตัวจัดการประเภทผ้าของคุณ
    fetch('http://localhost:3010/products/types_list')
      .then(res => res.json())
      .then(data => setTypes(data))
      .catch(err => console.error("Error fetching types:", err));
  }, []);

  useEffect(() => {
    fetch('http://localhost:3010/Stock/statuses_list')
      .then(res => {
        if (!res.ok) throw new Error("Status API 404");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setStatuses(data);
        }
      })
      .catch(err => console.error("Error fetching statuses:", err));
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: (name === "stock_amount" || name === "price") ? Number(value) || 0 : value,
    }));
  };

  // ใน StockModal.jsx
  const handleSubmit = () => {
    if (!form.stock_name.trim()) {
      alert("กรุณากรอกชื่อรายการ");
      return;
    }

    // ✅ มั่นใจว่าส่ง form ออกไป และส่ง ID แยกออกไปเป็น argument ที่สอง
    // ถ้าเป็นโหมดแก้ไข ต้องมีค่า stock_id ส่งไปด้วย
    onSave(form, form.stock_id);
  };


  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">{isEdit ? "แก้ไขรายการคลังสินค้า" : "เพิ่มรายการคลังสินค้า"}</h2>

        <div className="modal-form">
          <div className="modal-field">
            <label>ชื่อรายการ</label>
            <input name="stock_name" value={form.stock_name} onChange={handleChange} />
          </div>

          <div className="modal-field">
            <label>ประเภทผ้า</label>
            {/* ตรวจสอบว่าในตาราง stock ใช้คอลัมน์ category_id หรือ type_id */}
            <select name="category_id" value={form.category_id} onChange={handleChange}>
              <option value="">เลือกประเภท</option>
              {types.map(t => (
                // ใช้ t.type_id และ t.type_name ตามโครงสร้างใน phpMyAdmin
                <option key={t.type_id} value={t.type_id}>
                  {t.type_name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label>สี</label>
            {/* เปลี่ยน name เป็น stock_colors ให้ตรงกับ State form */}
            <input
              name="stock_colors"
              value={form.stock_colors}
              onChange={handleChange}
              placeholder="ระบุสีสินค้า"
            />
          </div>

          <div className="modal-field">
            <label>จำนวนคงเหลือ</label>
            <input type="number" name="stock_amount" value={form.stock_amount} onChange={handleChange} />
          </div>

          <div className="modal-field">
            <label>ตำแหน่งเก็บ (Storage)</label>
            <input name="storage" value={form.storage} onChange={handleChange} />
          </div>


          <div className="modal-field">
            <label>สถานะ</label>
            <select name="status_id" value={form.status_id} onChange={handleChange}>
              <option value="">เลือกสถานะ</option>
              {/* ตรวจสอบว่าเป็น Array ก่อน map */}
              {Array.isArray(statuses) && statuses.map((s) => (
                <option key={s.status_id} value={s.status_id}>
                  {s.status_status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="btn-save" onClick={handleSubmit}>
            {isEdit ? "บันทึกการแก้ไข" : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}