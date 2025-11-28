import "./SearchProducts.css";

export default function SearchProducts() {
  return (
    <div className="search-page">

      {/* ===== TITLE BAR ===== */}
      <div className="search-header">
        <h1>🔍 Search Fabric Sets</h1>
        <p>ค้นหาชุดผ้าทอสวยงาม 🌸 Find Beautiful Traditional Sets</p>
      </div>

      {/* ===== SEARCH BOX ===== */}
      <div className="search-box">
        <input
          type="text"
          placeholder="ค้นหาชุดผ้า... (ชื่อ, สี, ลวดลาย)"
        />
      </div>

      {/* ===== FILTERS ===== */}
      <div className="filter-row">

        <div className="filter-title">
          <span className="icon">🧱</span> Filters:
        </div>

        <div className="filter-buttons">
          <button className="filter pink">🎨 ทุกสี</button>
          <button className="filter blue">✨ ทุกรวดลาย</button>
          <button className="filter yellow">💰 ทุกราคา</button>
        </div>
      </div>

      {/* ===== COUNT ===== */}
      <p className="result-count">พบ 8 รายการ</p>

      {/* ===== PRODUCT GRID (ตัวอย่างวางไว้เฉย ๆ) ===== */}
      <div className="product-grid">
        <div className="product-card placeholder"></div>
        <div className="product-card placeholder"></div>
        <div className="product-card placeholder"></div>
        <div className="product-card placeholder"></div>
      </div>

    </div>
  );
}
