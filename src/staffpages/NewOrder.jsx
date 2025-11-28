// src/staff/NewOrder.jsx
import "./NewOrder.css";

export default function NewOrder() {
  return (
    <div className="order-page">

      {/* HEADER */}
      <div className="order-header">
        <h1>🛒 Create Order (POS)</h1>
        <p>บันทึกคำสั่งซื้อใหม่ 🎒 New Sales Order</p>
      </div>

      {/* ===== Customer Information ===== */}
      <div className="section-card">
        <h2 className="section-title">👤 Customer Information / ข้อมูลลูกค้า</h2>

        <div className="customer-row">
          <div className="input-group">
            <label>Customer Name / ชื่อลูกค้า *</label>
            <input type="text" placeholder="ระบุชื่อลูกค้า" />
          </div>

          <div className="input-group">
            <label>Date / วันที่</label>
            <input type="text" value="28/11/2568" readOnly />
          </div>
        </div>
      </div>

      {/* ===== Add Products ===== */}
      <div className="section-card">
        <h2 className="section-title">🛍 Add Products / เพิ่มสินค้า</h2>

        <div className="product-select-row">

          <div className="product-select-box green">
            <img src="/pics/sample1.png" className="p-img" />
            <button>+</button>
            <p className="p-name">ชุดไทยจักรพรรดิ สีชมพู</p>
            <p className="p-price">฿4,500</p>
          </div>

          <div className="product-select-box green">
            <img src="/pics/sample2.png" className="p-img" />
            <button>+</button>
            <p className="p-name">ชุดไทยรมพิมาน สีฟ้า</p>
            <p className="p-price">฿5,200</p>
          </div>

          <div className="product-select-box green">
            <img src="/pics/sample3.png" className="p-img" />
            <button>+</button>
            <p className="p-name">ผ้าซิ่นมณี</p>
            <p className="p-price">฿3,500</p>
          </div>

        </div>
      </div>

      {/* ===== Order Items ===== */}
      <div className="section-card">
        <h2 className="section-title">📋 Order Items / รายการสินค้า</h2>

        <div className="empty-items">
          <span className="empty-icon">🛒</span>
          <p className="empty-text">ยังไม่มีรายการสินค้า</p>
          <p className="empty-sub">คลิกปุ่มเพิ่มสินค้าด้านบน</p>
        </div>
      </div>

      {/* ===== SUMMARY RIGHT ===== */}
      <div className="order-summary">
        <h2>💰 Order Summary / สรุปยอด</h2>

        <div className="sum-row">
          <span>Subtotal:</span>
          <strong>฿0</strong>
        </div>

        <div className="sum-row">
          <span>Discount (%) / ส่วนลด</span>
          <input type="number" defaultValue="0" />
        </div>

        <div className="sum-row total">
          <span>Total:</span>
          <strong className="total-price">฿0</strong>
        </div>

        <h3 className="pay-title">Payment Method / วิธีชำระเงิน</h3>

        <div className="pay-methods">
          <button className="pay-btn active">💵 เงินสด</button>
          <button className="pay-btn">🏧 โอน</button>
          <button className="pay-btn">📱 QR</button>
        </div>

        <button className="submit-btn">⚙️ บันทึกและพิมพ์ใบเสร็จ</button>
      </div>

    </div>
  );
}
