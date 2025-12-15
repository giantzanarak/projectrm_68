import React from "react";
import "../css/SalesReport.css";

export default function SalesReport() {
  return (
    <div className="report-page">

      {/* PAGE HEADER */}
      {/* PAGE HEADER */}
    <div className="report-header">

    {/* LEFT SIDE */}
    <div className="left-header">
        <h2 className="page-title">รายงานยอดขาย</h2>
        <p className="page-sub">สรุปยอดขายและสถิติการขาย</p>
    </div>

    {/* RIGHT SIDE */}
    <div className="header-actions">
        <div className="dropdown-custom">
        <img src="/pics/calendar.png" className="dropdown-icon" />

        <select className="dropdown-select">
            <option>เดือนนี้</option>
            <option>วันนี้</option>
            <option>สัปดาห์นี้</option>
            <option>ปีนี้</option>
        </select>

        <img src="/pics/down-arrow.png" className="dropdown-arrow" />
        </div>

        <button className="btn-download">
        <img src="/pics/download2.png" />
        ดาวน์โหลดรายงาน
        </button>
    </div>

    </div>


      {/* SUMMARY CARDS */}
      <div className="summary_grid">

        <div className="summary-card">
          <div className="sum-icon bg-blue">
            <img src="/pics/money.png" />
          </div>
          <p className="sum-label">ยอดขายรวม</p>
          <h2 className="sum-value">฿328,000</h2>
          <p className="sum-percent green">+12.5% จากเดือนก่อน</p>
        </div>

        <div className="summary-card">
          <div className="sum-icon bg-lightblue">
            <img src="/pics/cart.png" />
          </div>
          <p className="sum-label">จำนวนบิล</p>
          <h2 className="sum-value">1692</h2>
          <p className="sum-percent green">+8.3% จากเดือนก่อน</p>
        </div>

        <div className="summary-card">
          <div className="sum-icon bg-green">
            <img src="/pics/trend.png" />
          </div>
          <p className="sum-label">กำไรรวม</p>
          <h2 className="sum-value">฿92,200</h2>
          <p className="sum-percent green">+15.2% จากเดือนก่อน</p>
        </div>

        <div className="summary-card">
          <div className="sum-icon bg-yellow">
            <img src="/pics/tasklist2.png" />
          </div>
          <p className="sum-label">ค่าเฉลี่ยต่อบิล</p>
          <h2 className="sum-value">฿194</h2>
          <p className="sum-percent green">+4.1% จากเดือนก่อน</p>
        </div>

      </div>

      {/* SALES TREND + PIE CHART */}
      <div className="row">
        <div className="panel">
          <h3 className="panel-title">แนวโน้มยอดขาย</h3>
          <div className="fake-chart">กราฟเส้น (Mock)</div>
        </div>

        <div className="panel">
          <h3 className="panel-title">สัดส่วนยอดขายตามหมวดหมู่</h3>
          <div className="fake-chart">Pie chart (Mock)</div>
        </div>
      </div>

      {/* BILL COUNT + TOP 5 */}
      <div className="row">
        <div className="panel">
          <h3 className="panel-title">จำนวนบิลขาย</h3>
          <div className="fake-chart">Bar chart (Mock)</div>
        </div>

        <div className="panel">
          <h3 className="panel-title">สินค้าขายดี Top 5</h3>

          <div className="top-list">
            {[
              { rank: 1, name: "ชุดไทยจักรพรรดิ สีชมพู", sold: 45, price: "฿202,500" },
              { rank: 2, name: "ชุดไทยบรมพิมาน สีฟ้า", sold: 38, price: "฿197,600" },
              { rank: 3, name: "ผ้าซิ่นไหม ลายเรยากาฑิต", sold: 52, price: "฿182,000" },
              { rank: 4, name: "ชุดไทยอมรินทร์ สีเขียว", sold: 35, price: "฿168,000" },
              { rank: 5, name: "ชุดไทยศิวาลัย สีม่วง", sold: 41, price: "฿172,200" }
            ].map((p) => (
              <div className="top-item" key={p.rank}>
                <span className="top-rank">#{p.rank}</span>

                <div className="top-info">
                  <p className="top-name">{p.name}</p>
                  <p className="top-sold">ขายได้ {p.sold} ชิ้น</p>
                </div>

                <span className="top-price">{p.price}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
