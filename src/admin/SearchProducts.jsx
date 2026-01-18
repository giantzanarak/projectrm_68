// src/pages/SearchProducts.jsx
import React, { useState } from "react";
import "../css/SearchProducts.css";

// ---------------- MOCK DATA ----------------
const mockProducts = [
  {
    id: "P001",
    name: "ชุดไทยจักรพรรดิ",
    category: "ชุดไทยสตรี",
    pattern: "ลายดอกไม้",
    price: 4500,
    size: "M",
    stock: 5,
    color: "ชมพู-ทอง",
    status: "ปานกลาง",
    img: "https://i.pinimg.com/1200x/b7/6c/1b/b76c1b9fbab0528a0993c8c1e04910b7.jpg",
  },
  {
    id: "P002",
    name: "ชุดไทยบรมพิมาน",
    category: "ชุดไทยสตรี",
    pattern: "ลายทนท",
    price: 5200,
    size: "L",
    stock: 3,
    color: "ฟ้า-เงิน",
    status: "น้อย",
    img: "https://i.pinimg.com/736x/ad/1a/32/ad1a32e535731d7a55d1c30ace6460b4.jpg",
  },
  {
    id: "P003",
    name: "ชุดไทยอมรินทร์",
    category: "ชุดไทยสตรี",
    pattern: "ลายขิด",
    price: 4800,
    size: "M",
    stock: 4,
    color: "เขียว-ทอง",
    status: "ปานกลาง",
    img: "https://i.pinimg.com/1200x/f1/e9/6d/f1e96db21aa7fe21a6674eb3c86c06fa.jpg",
  },
  {
    id: "P004",
    name: "ผ้าซิ่นมัดหมี่",
    category: "ชุดไทยสตรี",
    pattern: "ลายขิด",
    price: 3500,
    size: "M",
    stock: 8,
    color: "เขียว-ทอง",
    status: "ปานกลาง",
    img: "https://i.pinimg.com/736x/f5/a0/a6/f5a0a6c40303547575ce07fe9b67145e.jpg",
  },
];

// ---------------- STAT CARD ----------------
function StatCard({ icon, label, value, bg }) {
  const isImage = icon?.includes("/");
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        {isImage ? (
          <img src={icon} alt="icon" className="stat-img" />
        ) : (
          <span className="icon-emoji">{icon}</span>
        )}
      </div>

      <div>
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );
}

// ---------------- DETAIL MODAL ----------------
function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="sp-detail-backdrop" onClick={onClose}>
      <div
        className="sp-detail-modal"
        onClick={(e) => e.stopPropagation()} // กันไม่ให้คลิกด้านในแล้วปิด
      >
        <button className="sp-detail-close" onClick={onClose}>
          ✕
        </button>

        <div className="sp-detail-layout">
          <div className="sp-detail-left">
            <img
              src={product.img}
              alt={product.name}
              className="sp-detail-img"
            />
          </div>

          <div className="sp-detail-right">
            <span className="sp-detail-id">{product.id}</span>
            <h2 className="sp-detail-name">{product.name}</h2>

            <div className="sp-detail-tags">
              <span className="tag">{product.category}</span>
              <span className="tag">{product.pattern}</span>
            </div>

            <div className="sp-detail-row">
              <span className="info-label">ราคา</span>
              <span className="info-value">
                ฿{product.price.toLocaleString()}
              </span>
            </div>

            <div className="sp-detail-row">
              <span className="info-label">ไซส์</span>
              <span className="info-value">{product.size}</span>
            </div>

            <div className="sp-detail-row">
              <span className="info-label">คงเหลือ</span>
              <span className="info-value">{product.stock} ชิ้น</span>
            </div>

            <div className="sp-detail-row">
              <span className="info-label">สี</span>
              <span className="info-value">{product.color}</span>
            </div>

            <div className="sp-detail-row">
              <span className="info-label">สถานะสต็อก</span>
              <span className={`sp-stock-pill ${product.status}`}>
                {product.status === "น้อย"
                  ? "สต็อกน้อย"
                  : "สต็อกปานกลาง"}
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
  const [category, setCategory] = useState("ทุกหมวดหมู่");
  const [color, setColor] = useState("ทุกสี");
  const [searchText, setSearchText] = useState("");

  const [showCategory, setShowCategory] = useState(false);
  const [showColor, setShowColor] = useState(false);

  // state สำหรับ modal รายละเอียด
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ---------------- FILTER LOGIC ----------------
  const filteredProducts = mockProducts.filter((p) => {
    const matchSearch =
      p.name.includes(searchText) ||
      p.color.includes(searchText) ||
      p.pattern.includes(searchText);

    const matchCategory =
      category === "ทุกหมวดหมู่" || p.category === category;

    const matchColor = color === "ทุกสี" || p.color.includes(color);

    return matchSearch && matchCategory && matchColor;
  });

  return (
    <div className="search-page-wrapper">
      <div className="search-page">
        {/* TITLE */}
        <h2 className="page-title">ค้นหาสินค้า</h2>
        <p className="page-subtitle">ค้นหาและเลือกรายการสินค้าสำหรับการขาย</p>

        {/* ===== STAT CARDS ===== */}
        <div className="stat-grid">
          <StatCard
            icon="/pics/box2.png"
            label="สินค้าทั้งหมด"
            value="8"
            bg="#f1f5f9"
          />
          <StatCard
            icon="/pics/box2.png"
            label="พร้อมจำหน่าย"
            value="2"
            bg="#dcfce7"
          />
          <StatCard
            icon="/pics/box2.png"
            label="สต็อกปานกลาง"
            value="5"
            bg="#fef9c3"
          />
          <StatCard
            icon="/pics/box2.png"
            label="สต็อกน้อย"
            value="1"
            bg="#fee2e2"
          />
        </div>

        {/* ===== FILTER BAR ===== */}
        <div className="filter-bar-wrapper">
          <div className="filter-bar">
            {/* Search Box */}
            <input
              type="text"
              className="search-input"
              placeholder="ค้นหาสินค้า (ชื่อ, สี, ลวดลาย)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            {/* CATEGORY DROPDOWN */}
            <div
              className="custom-dropdown"
              onClick={() => {
                setShowCategory(!showCategory);
                setShowColor(false);
              }}
            >
              <img src="/pics/filter.png" className="drop-left-icon" />
              <span className="drop-text">{category}</span>
              <img src="/pics/down-arrow.png" className="drop-right-icon" />

              {showCategory && (
                <div className="dropdown-menu">
                  {["ทุกหมวดหมู่", "ชุดไทยสตรี", "ผ้าซิ่น", "เครื่องประดับ"].map(
                    (item) => (
                      <div
                        key={item}
                        className="dropdown-item"
                        onClick={() => {
                          setCategory(item);
                          setShowCategory(false);
                        }}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* COLOR DROPDOWN */}
            <div
              className="custom-dropdown"
              onClick={() => {
                setShowColor(!showColor);
                setShowCategory(false);
              }}
            >
              <img src="/pics/filter.png" className="drop-left-icon" />
              <span className="drop-text">{color}</span>
              <img src="/pics/down-arrow.png" className="drop-right-icon" />

              {showColor && (
                <div className="dropdown-menu">
                  {["ทุกสี", "ชมพู", "ฟ้า", "เขียว", "ม่วง", "ส้ม", "แดง"].map(
                    (item) => (
                      <div
                        key={item}
                        className="dropdown-item"
                        onClick={() => {
                          setColor(item);
                          setShowColor(false);
                        }}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="result-count">
            พบ <b>{filteredProducts.length}</b> รายการ
          </p>
        </div>

        {/* ===== PRODUCT GRID ===== */}
        <div className="product-grid">
          {filteredProducts.map((p) => (
            <div className="product-card" key={p.id}>
              <div className="product-img-box">
                <img src={p.img} alt={p.name} className="product-img" />
                <span className={`stock-tag ${p.status}`}>
                  {p.status === "น้อย" ? "สต็อกน้อย" : "สต็อกปานกลาง"}
                </span>
              </div>

              <div className="product-content">
                <span className="product-id">{p.id}</span>
                <h3 className="product-name">{p.name}</h3>

                <div className="tag-row">
                  <span className="tag">{p.category}</span>
                  <span className="tag">{p.pattern}</span>
                </div>

                <div className="info-row">
                  <div>
                    <span className="info-label">ราคา</span>
                    <p className="info-value">฿{p.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="info-label">ไซส์</span>
                    <p className="info-value">{p.size}</p>
                  </div>
                </div>

                <div className="info-row">
                  <div>
                    <span className="info-label">คงเหลือ</span>
                    <p className="info-value">{p.stock} ชิ้น</p>
                  </div>
                  <div>
                    <span className="info-label">สี</span>
                    <p className="info-value">{p.color}</p>
                  </div>
                </div>

                {/* ปุ่มนี้เปลี่ยนจาก "เลือกสินค้า" -> เปิดรายละเอียด */}
                <button
                  className="select-btn"
                  onClick={() => setSelectedProduct(p)}
                >
                  <img src="/pics/cart2.png" className="select-icon" />{" "}
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL รายละเอียดสินค้า */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}