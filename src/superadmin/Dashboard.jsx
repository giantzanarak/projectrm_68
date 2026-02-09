// src/pages/superadmin/Dashboard.jsx
import { useState } from "react";
import { FiChevronDown, FiBell } from "react-icons/fi";
import "../styles/dashboard.css";
import fabricsData from "../data/fabricsData";

import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Legend,
  Tooltip
);

export default function Dashboard() {
  const [month, setMonth] = useState("เดือนนี้");
  const [showStockPopup, setShowStockPopup] = useState(false);

  // รวมสต็อกผ้าตัวอย่าง
  const totalFabricStock = fabricsData.reduce((sum, f) => sum + f.stock, 0);

  const stockAlerts = [
    { id: 1, text: "ผ้าไหมสีแดง เหลือ 12 เมตร", level: "danger" },
    { id: 2, text: "ผ้าย้อมครามขาวดำ เหลือ 45 เมตร", level: "warning" },
    { id: 3, text: "ผ้าฝ้ายสีเขียว เหลือ 8 เมตร", level: "danger" },
    { id: 4, text: "ผ้าทอพิเศษ เหลือ 5 ม้วน", level: "danger" },
  ];

  const bestSellers = [
    { rank: 1, name: "ผ้าไหมลายดอก สีฟ้า", qty: 1250, revenue: 856250 },
    { rank: 2, name: "ผ้าย้อมครามลายขาว", qty: 980, revenue: 844100 },
    { rank: 3, name: "ผ้าตะขาบโบราณ", qty: 875, revenue: 839375 },
    { rank: 4, name: "ผ้าฝ้ายลายดอกแดง", qty: 720, revenue: 832400 },
    { rank: 5, name: "ผ้าไหมทอง", qty: 650, revenue: 829250 },
  ];

  /* -----------------------------
        DATA + OPTIONS : LINE
  ------------------------------ */
  const lineData = {
    labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
    datasets: [
      {
        label: "ยอดขาย (บาท)",
        data: [48000, 52000, 47000, 65000, 58000, 69000],
        borderColor: "#4A72FF",
        backgroundColor: "rgba(74,114,255,0.2)",
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) =>
            `ยอดขาย: ฿${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `฿${Number(value).toLocaleString()}`,
        },
        beginAtZero: false,
      },
    },
  };

  /* -----------------------------
        PIE : สัดส่วนผ้า
  ------------------------------ */
  const pieColors = ["#4A72FF", "#67C8FF", "#A97DFF", "#FF8FA6", "#FFCD6A"];

  const pieData = {
    labels: fabricsData.map((f) => f.name),
    datasets: [
      {
        data: fabricsData.map((f) => f.stock),
        backgroundColor: pieColors,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
            const value = ctx.parsed;
            const percent = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ${value} เมตร (${percent}%)`;
          },
        },
      },
    },
  };

  /* -----------------------------
        BAR : การใช้ผ้ารายเดือน
  ------------------------------ */
  const barLabels = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."];

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: "รับเข้า (เมตร)",
        data: [130, 140, 135, 150, 160, 170],
        backgroundColor: "#4CAF50",
      },
      {
        label: "ใช้ไป (เมตร)",
        data: [120, 135, 130, 140, 150, 160],
        backgroundColor: "#FF6B6B",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label || "";
            const val = ctx.parsed.y ?? 0;
            return `${label}: ${val} เมตร`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // ✅ ใส่หน่วยที่แกน Y
          callback: (value) => `${value} ม.`,
        },
      },
      x: {
        ticks: { maxRotation: 0 },
      },
    },
  };

  // helper สำหรับสรุปใต้ pie chart
  const totalStock = fabricsData.reduce((s, f) => s + f.stock, 0);

  return (
    <>
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2 className="dash-title">แดชบอร์ด</h2>
          <span className="dash-sub">สรุปข้อมูลและรายงานทั้งหมด</span>
        </div>

        <div className="dash-right">
          {/* ปุ่มแจ้งเตือนสต็อกบนหัว */}
          <button
            className="dash-bell-btn"
            onClick={() => setShowStockPopup((v) => !v)}
          >
            <FiBell />
            {stockAlerts.length > 0 && (
              <span className="dash-bell-badge">{stockAlerts.length}</span>
            )}
          </button>

          <div className="dash-month-select">
            <span>{month}</span>
            <FiChevronDown />
          </div>
        </div>

        {/* POPUP แจ้งเตือนสต็อก */}
        {showStockPopup && (
          <div className="stock-popup">
            <div className="stock-popup-header">
              <span>แจ้งเตือนสต็อก</span>
              <button
                className="stock-popup-close"
                onClick={() => setShowStockPopup(false)}
              >
                ×
              </button>
            </div>
            <div className="stock-popup-list">
              {stockAlerts.map((a) => (
                <div
                  key={a.id}
                  className={`stock-popup-item stock-${a.level}`}
                >
                  {a.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SUMMARY CARDS */}
      <section className="dash-summary-grid">
        <div className="dash-card">
          <div className="dash-icon purple"></div>
          <div>
            <p className="dash-card-title">ยอดขายรวม</p>
            <h2 className="dash-number">฿328,000</h2>
            <span className="dash-extra green">▲ เพิ่มขึ้น 12.5%</span>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon blue"></div>
          <div>
            <p className="dash-card-title">ผ้าในคลัง</p>
            <h2 className="dash-number">{totalFabricStock} เมตร</h2>
            <span className="dash-extra green">▲ เพิ่มขึ้น 8 เมตร</span>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon green"></div>
          <div>
            <p className="dash-card-title">ผลิตภัณฑ์ทั้งหมด</p>
            <h2 className="dash-number">1,234</h2>
            <span className="dash-extra green">▲ เพิ่มขึ้น 15 รายการ</span>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon yellow"></div>
          <div>
            <p className="dash-card-title">สินค้าใกล้หมด</p>
            <h2 className="dash-number">4</h2>
            <span className="dash-extra red">ต้องการสั่งซื้อเพิ่ม</span>
          </div>
        </div>
      </section>

      {/* CHART ROW */}
      <section className="chart-row">
        {/* LINE CHART */}
        <div className="chart-card">
          <h3 className="chart-title">แนวโน้มยอดขายรายเดือน</h3>
          <div className="chart-inner">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* PIE CHART */}
        <div className="chart-card">
          <h3 className="chart-title">สัดส่วนผ้าในคลัง</h3>
          <div className="chart-inner">
            <Pie data={pieData} options={pieOptions} />
          </div>

          {/* ✅ สรุปใต้กราฟ */}
          <div className="fabric-summary-list">
            {fabricsData.map((f, idx) => {
              const percent = ((f.stock / totalStock) * 100).toFixed(1);
              return (
                <div key={f.id} className="fabric-summary-row">
                  <span
                    className="fabric-color-dot"
                    style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                  />
                  <span className="fabric-name">{f.name}</span>
                  <span className="fabric-value">{f.stock} เมตร</span>
                  <span className="fabric-percent">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FULL BAR */}
      <section className="chart-row-full">
        <div className="chart-card full">
          <h3 className="chart-title">ปริมาณการใช้ผ้ารายเดือน</h3>
          <div className="chart-inner">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </section>

      {/* BOTTOM SECTION */}
      <section className="bottom-row">
        {/* ✅ ตารางสินค้าขายดี */}
        <div className="list-card">
          <h3>ผลิตภัณฑ์ขายดี</h3>
          <div className="table-wrapper">
            <table className="best-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ชื่อผลิตภัณฑ์</th>
                  <th>ปริมาณที่ขาย (ม.)</th>
                  <th>รายได้ (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.map((item) => (
                  <tr key={item.rank}>
                    <td>{item.rank}</td>
                    <td>{item.name}</td>
                    <td>{item.qty.toLocaleString()}</td>
                    <td>฿{item.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

    
      </section>
    </>
  );
}