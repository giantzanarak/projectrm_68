import React from "react";
import "../css/DashboardStaff.css";

const DashboardStaff = () => {
  return (
    <div className="staff-dashboard-page">

      {/* ================= HEADER BOX ================= */}
      <div className="header-container">
        <h2 className="header-title">แดชบอร์ดพนักงานขาย</h2>
        <p className="header-sub">ยินดีต้อนรับสู่ระบบขายหน้าร้าน</p>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="summary-grid">

        <div className="summary-card">
          <div className="summary-icon">
            <img src="/pics/trend.png" alt="sales" />
            <span>ยอดขายวันนี้</span>
          </div>
          <h2 className="summary-value">฿45,800</h2>
          <span className="summary-unit">บาท</span>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <img src="/pics/cart.png" alt="orders" />
            <span>คำสั่งซื้อวันนี้</span>
          </div>
          <h2 className="summary-value">12</h2>
          <span className="summary-unit">รายการ</span>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <img src="/pics/warning.png" alt="stock alert" />
            <span>แจ้งเตือนสต็อก</span>
          </div>
          <h2 className="summary-value">3</h2>
          <span className="summary-unit">รายการ</span>
        </div>

      </div>

      {/* ================= QUICK MENU ================= */}
      <div className="quick-menu-container">

        <h3 className="section-title">เมนูด่วน</h3>

        <div className="quick-menu-grid">

          <button className="quick-btn new">
            <img src="/pics/newbill.png" />
            สร้างบิลใหม่
          </button>

          <button className="quick-btn search">
            <img src="/pics/search2.png" />
            ค้นหาสินค้า
          </button>

          <button className="quick-btn orders">
            <img src="/pics/tasklist.png" />
            ดูคำสั่งซื้อ
          </button>

          <button className="quick-btn report">
            <img src="/pics/chart2.png" />
            รายงานยอดขาย
          </button>

        </div>
      </div>

      {/* ================= BEST SELLING ================= */}
      <div className="best-container">
        <h3 className="section-title">สินค้าขายดี</h3>

        <div className="best-grid">

          <div className="product-card">
            <div className="product-img placeholder"></div>
            <div className="product-info">
              <p className="product-name">ชุดไทยจักรพรรดิ</p>
              <p className="product-stock">
                <img src="/pics/cart.png" /> 8 ชุด
              </p>
              <button className="product-btn">ดูเพิ่ม</button>
            </div>
          </div>

          <div className="product-card">
            <div className="product-img placeholder"></div>
            <div className="product-info">
              <p className="product-name">ชุดไทยชมชนบท</p>
              <p className="product-stock">
                <img src="/pics/cart.png" /> 6 ชุด
              </p>
              <button className="product-btn">ดูเพิ่ม</button>
            </div>
          </div>

          <div className="product-card">
            <div className="product-img placeholder"></div>
            <div className="product-info">
              <p className="product-name">ชุดไทยมอญ</p>
              <p className="product-stock">
                <img src="/pics/cart.png" /> 5 ชุด
              </p>
              <button className="product-btn">ดูเพิ่ม</button>
            </div>
          </div>

        </div>
      </div>

      {/* ================= TIP BOX ================= */}
      <div className="tip-box">
        💡 <strong>เคล็ดลับ:</strong> คลิกปุ่มสร้างบิลใหม่เพื่อเริ่มการขายอย่างรวดเร็ว  
        ระบบจะบันทึกและพิมพ์ใบเสร็จให้อัตโนมัติ
      </div>

    </div>
  );
};

export default DashboardStaff;
