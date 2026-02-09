import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/SearchProducts.css";

// ---------------- STAT CARD (แยก Component ออกมา) ----------------
function StatCard({ icon, label, value, bg }) {
  const isImage = icon?.includes("/");
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        {isImage ? <img src={icon} alt="icon" className="stat-img" /> : <span className="icon-emoji">{icon}</span>}
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );
}

// ---------------- DETAIL MODAL (ใช้คีย์ให้ตรงกับ Database) ----------------
function ProductDetailModal({ product, onClose, onAddToCart }) { // ✅ รับ prop onAddToCart เพิ่ม
  if (!product) return null;
  const baseUrl = "http://localhost:3010";

  // สร้าง state สำหรับจำนวนที่จะสั่งซื้อ (ถ้าต้องการ)
  const [quantity, setQuantity] = React.useState(1);

  return (
    <div className="sp-detail-backdrop" onClick={onClose}>
      <div className="sp-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="sp-detail-close" onClick={onClose}>✕</button>
        <div className="sp-detail-layout">
          <div className="sp-detail-left">
            <img
              src={product.image ? `${baseUrl}${product.image}` : "https://via.placeholder.com/300"}
              alt={product.name}
              className="sp-detail-img"
            />
          </div>
          <div className="sp-detail-right">
            <span className="sp-detail-id">ID: {product.idProducts}</span>
            <h2 className="sp-detail-name">{product.name}</h2>
            <div className="sp-detail-tags">
              <span className="tag">{product.category_name}</span>
              <span className="tag">{product.type_name}</span>
            </div>

            <div className="sp-detail-row">
              <span className="info-label">ราคา</span>
              <span className="info-value price-highlight">฿{Number(product.price).toLocaleString()}</span>
            </div>

            <div className="sp-detail-row">
              <span className="info-label">ไซส์</span>
              <span className="info-value">{product.size || "-"}</span>
            </div>

            <div className="sp-detail-row">
              <span className="info-label">คงเหลือ</span>
              <span className="info-value">{product.stock_amount} {product.unit}</span>
            </div>

            {/* ✅ ส่วนที่เพิ่ม: ปุ่มปรับจำนวนและปุ่มเพิ่มลงตะกร้า */}
            <div className="add-to-cart-section">
              <div className="quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(Math.min(product.stock_amount, quantity + 1))}>+</button>
              </div>

              <button
                className="btn-add-cart"
                onClick={() => {
                  onAddToCart(product, quantity); // ส่งข้อมูลสินค้าและจำนวนกลับไปที่หน้าหลัก
                  onClose(); // ปิด Modal
                }}
                disabled={product.stock_amount <= 0} // ถ้าของหมดกดไม่ได้
              >
                <img src="/pics/cart2.png" alt="" className="cart-icon-btn" />
                {product.stock_amount <= 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
              </button>
            </div>

            <div className="sp-detail-row status-margin">
              <span className="info-label">สถานะสต็อก</span>
              <span className={`sp-stock-pill ${product.stock_amount <= 5 ? "น้อย" : "ปานกลาง"}`}>
                {product.stock_amount <= 5 ? "สต็อกน้อย" : "สต็อกปกติ"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ---------------- MAIN PAGE ----------------
export default function SearchProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("ทุกหมวดหมู่");
  const [color, setColor] = useState("ทุกสี");
  const [searchText, setSearchText] = useState("");
  const [showCategory, setShowCategory] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3010/products");
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const pColor = (p.product_colors || "").toLowerCase();
    const catName = (p.category_name || "").toLowerCase();
    const search = searchText.toLowerCase();

    const matchSearch = name.includes(search) || pColor.includes(search) || catName.includes(search);
    const matchCategory = category === "ทุกหมวดหมู่" || p.category_name === category;
    const matchColor = color === "ทุกสี" || (p.product_colors && p.product_colors.includes(color));

    return matchSearch && matchCategory && matchColor;
  });

  const handleAddToCart = (product, quantity) => {
    console.log("1. เริ่มฟังก์ชัน Add to Cart");
    const itemToAdd = {
      id: product.idProducts,
      name: product.name,
      price: product.price,
      stock: product.stock_amount,
      image: `http://localhost:3010${product.image}`,
      details: `${product.category_name} - ${product.product_colors}`,
      qty: quantity
    };

    localStorage.setItem("pendingItem", JSON.stringify(itemToAdd));
    ("2. บันทึกลง localStorage สำเร็จ:", localStorage.getItem("pendingItem"));

    console.log("3. กำลังจะเปลี่ยนหน้าไปที่ /admin/NewOrder");
    navigate("/staff/neworder");
  };

  if (loading) return <div className="loading">กำลังโหลดข้อมูล</div>;

  return (
    <div className="search-page-wrapper">
      <div className="search-page">
        <h2 className="page-title">ค้นหาสินค้า</h2>
        <p className="page-subtitle">ค้นหาและเลือกรายการสินค้าสำหรับการขาย</p>

        <div className="stat-grid">
          <StatCard
            icon=""
            label="สินค้าทั้งหมด"
            value={products.length} 
            bg="#f1f5f9"
          />
          <StatCard
            icon=""
            label="พร้อมจำหน่าย"
            value={products.filter(p => p.stock_amount > 0).length} // ✅ นับสินค้าที่มีสต็อก > 0
            bg="#dcfce7"
          />
          <StatCard
            icon=""
            label="สต็อกปานกลาง"
            value={products.filter(p => p.stock_amount > 5 && p.stock_amount <= 10).length}
            bg="#fef9c3"
          />
          <StatCard
            icon=""
            label="สต็อกน้อย"
            value={products.filter(p => p.stock_amount <= 5).length}
            bg="#fee2e2"
          />
        </div>

        <div className="filter-bar-wrapper">
          <div className="filter-bar">
            <input
              type="text"
              className="search-input"
              placeholder="ค้นหาสินค้า (ชื่อ, สี, หมวดหมู่)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            {/* Category Dropdown */}
            <div className="custom-dropdown" onClick={() => { setShowCategory(!showCategory); setShowColor(false); }}>
              <img src="/pics/filter.png" className="drop-left-icon" alt="" />
              <span className="drop-text">{category}</span>
              <img src="/pics/down-arrow.png" className="drop-right-icon" alt="" />
              {showCategory && (
                <div className="dropdown-menu">
                  {["ทุกหมวดหมู่", ...new Set(products.map(p => p.category_name))].filter(Boolean).map(item => (
                    <div key={item} className="dropdown-item" onClick={() => setCategory(item)}>{item}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="custom-dropdown" onClick={() => { setShowColor(!showColor); setShowCategory(false); }}>
              <img src="/pics/filter.png" className="drop-left-icon" alt="" />
              <span className="drop-text">{color}</span>
              <img src="/pics/down-arrow.png" className="drop-right-icon" alt="" />
              {showColor && (
                <div className="dropdown-menu">
                  {/* ดึงสีที่มีอยู่จริงจากฐานข้อมูลมาแสดงอัตโนมัติ */}
                  {["ทุกสี", ...new Set(products.map(p => p.product_colors))].filter(Boolean).map(item => (
                    <div key={item} className="dropdown-item" onClick={() => setColor(item)}>{item}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="result-count">พบ <b>{filteredProducts.length}</b> รายการ</p>
        </div>


        <div className="product-grid">
          {filteredProducts.map((p) => (
            <div className="product-card" key={p.idProducts}>
              <div className="product-img-box">
                <img
                  src={p.image ? `http://localhost:3010${p.image}` : "https://via.placeholder.com/150"}
                  alt={p.name}
                  className="product-img"
                />
                <span className={`stock-tag ${p.stock_amount <= 5 ? "น้อย" : "ปานกลาง"}`}>
                  {p.stock_amount <= 5 ? "สต็อกน้อย" : "สต็อกปกติ"}
                </span>
              </div>
              <div className="product-content">
                <span className="product-id">ID: {p.idProducts}</span>
                <h3 className="product-name">{p.name}</h3>
                <div className="tag-row">
                  <span className="tag">{p.category_name}</span>
                </div>
                <div className="info-row">
                  <div><span className="info-label">ราคา</span><p className="info-value">฿{Number(p.price).toLocaleString()}</p></div>
                  <div><span className="info-label">คงเหลือ</span><p className="info-value">{p.stock_amount} {p.unit}</p></div>
                </div>
                <button className="select-btn" onClick={() => setSelectedProduct(p)}>ดูรายละเอียด</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart} 
        />
      )}
    </div>
  );
}