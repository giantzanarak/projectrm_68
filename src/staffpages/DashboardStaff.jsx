import "./DashboardStaff.css";

export default function DashboardStaff() {
  return (
    <div className="dashboard-wrapper">

      {/* ======= Header ======= */}
      <div className="dash-header">
        <h2>🌸 Staff Dashboard</h2>
        <p className="welcome">ยินดีต้อนรับสู่ระบบขายหน้าร้าน ✨</p>
      </div>

      {/* ======= Stats Cards ======= */}
      <div className="stats-grid">

        <div className="stats-card green">
          <h4>📈 Today's Sales</h4>
          <h2>฿45,800</h2>
          <p>ยอดขายวันนี้</p>
        </div>

        <div className="stats-card pink">
          <h4>🛍️ Orders Today</h4>
          <h2>12</h2>
          <p>คำสั่งซื้อวันนี้</p>
        </div>

        <div className="stats-card yellow">
          <h4>⚠️ Low Stock Alert</h4>
          <h2>3</h2>
          <p>สินค้ากำลังหมด</p>
        </div>

      </div>

      {/* ======= Quick Actions ======= */}
      <h3 className="section-title">⚡ เมนูด่วน / Quick Actions</h3>

      <div className="quick-actions">
        <button className="action blue">+ สร้างบิลใหม่</button>
        <button className="action pink">🔍 ค้นหาสินค้า</button>
        <button className="action green">📦 เช็คสต็อก</button>
        <button className="action yellow">📊 รายงานยอดขาย</button>
      </div>

      {/* ======= Best-Selling / Popular Sets ======= */}
      <h3 className="section-title">🏆 สินค้าขายดี / ชุดยอดนิยม</h3>

      <div className="product-grid">

        <div className="product-card">
          <div className="img-box"></div>
          <h4>ชุดไทยกะเหรี่ยง สีชมพู</h4>
          <p>🛒 8 ชุด</p>
          <button className="view-btn">ดูเพิ่ม</button>
        </div>

        <div className="product-card">
          <div className="img-box"></div>
          <h4>ชุดไทยชนเผ่า สีฟ้า</h4>
          <p>🛒 6 ชุด</p>
          <button className="view-btn">ดูเพิ่ม</button>
        </div>

        <div className="product-card">
          <div className="img-box"></div>
          <h4>ชุดไทยมอง สีเขียว</h4>
          <p>🛒 5 ชุด</p>
          <button className="view-btn">ดูเพิ่ม</button>
        </div>

      </div>

    </div>
  );
}
