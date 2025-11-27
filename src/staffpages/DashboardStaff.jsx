import "./DashboardStaff.css";

export default function DashboardStaff() {
  return (
    <div className="dashboard-wrapper">

      {/* ===== Header ===== */}
      <div className="dash-header">
        <h2>🌸 Staff Dashboard</h2>
        <p className="welcome">ยินดีต้อนรับสู่ระบบขายหน้าร้าน ✨</p>
      </div>

      {/* ===== Stats Cards ===== */}
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

      {/* ===== Quick Actions ===== */}
      <h3 className="section-title">⚡ Quick Actions / เมนูด่วน</h3>

      <div className="quick-actions">
        <button className="btn blue">+ เพิ่มคำสั่งซื้อ</button>
        <button className="btn pink">🔍 ค้นหาสินค้า</button>
        <button className="btn green">📦 เช็คสต็อก</button>
        <button className="btn yellow">📊 รายงานยอดขาย</button>
      </div>

      {/* ===== Popular Products ===== */}
      <h3 className="section-title">🧵 สินค้ายอดนิยม</h3>

      <div className="product-grid">
        {[
          { name: "ชุดไทยกะเหรี่ยง สีชมพู", qty: 8 },
          { name: "ชุดไทยชนเผ่า สีฟ้า", qty: 6 },
          { name: "ชุดไทยมอญ สีเขียว", qty: 5 },
        ].map((item, i) => (
          <div key={i} className="product-card">
            <div className="product-img"></div>
            <h4>{item.name}</h4>
            <p>🛒 {item.qty} ชุด</p>
            <button className="btn purple">ดูเพิ่ม</button>
          </div>
        ))}
      </div>

    </div>
  );
}
