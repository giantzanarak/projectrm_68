import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
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

  // ✅ รวมสต็อกผ้าจาก fabricsData
  const totalFabricStock = fabricsData.reduce((sum, f) => sum + f.stock, 0);

  return (
    <>
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2 className="dash-title">แดชบอร์ด</h2>
          <span className="dash-sub">สรุปข้อมูลและรายงานทั้งหมด</span>
        </div>

        <div className="dash-month-select">
          <span>{month}</span>
          <FiChevronDown />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <section className="dash-summary-grid">

        <div className="dash-card">
          <div className="dash-icon purple">💰</div>
          <div>
            <p className="dash-card-title">ยอดขายรวม</p>
            <h2 className="dash-number">฿328,000</h2>
            <span className="dash-extra green">▲ เพิ่มขึ้น 12.5%</span>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon blue">📦</div>
          <div>
            <p className="dash-card-title">ผ้าในคลัง</p>
            <h2 className="dash-number">{totalFabricStock} เมตร</h2>
            <span className="dash-extra green">▲ เพิ่มขึ้น 8 เมตร</span>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon green">📊</div>
          <div>
            <p className="dash-card-title">ผลิตภัณฑ์ทั้งหมด</p>
            <h2 className="dash-number">1,234</h2>
            <span className="dash-extra green">▲ เพิ่มขึ้น 15 รายการ</span>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon yellow">⚠️</div>
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
            <Line
              data={{
                labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
                datasets: [
                  {
                    label: "ยอดขาย (฿)",
                    data: [48000, 52000, 47000, 65000, 58000, 69000],
                    borderColor: "#4A72FF",
                    backgroundColor: "rgba(74,114,255,0.2)",
                    borderWidth: 3,
                    tension: 0.4,
                  },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* PIE CHART */}
        <div className="chart-card">
          <h3 className="chart-title">สัดส่วนผ้าในคลัง</h3>
          <div className="chart-inner">
            <Pie
              data={{
                labels: fabricsData.map(f => f.name),
                datasets: [
                  {
                    data: fabricsData.map(f => f.stock),
                    backgroundColor: [
                      "#4A72FF",
                      "#67C8FF",
                      "#A97DFF",
                      "#FF8FA6",
                      "#FFCD6A",
                    ],
                  },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

      </section>

      {/* FULL BAR */}
      <section className="chart-row-full">
        <div className="chart-card full">
          <h3 className="chart-title">ปริมาณการใช้ผ้ารายเดือน</h3>
          <div className="chart-inner">
            <Bar
              data={{
                labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
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
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>
      </section>

      {/* BOTTOM SECTION */}
      <section className="bottom-row">

        <div className="list-card">
          <h3>ผลิตภัณฑ์ขายดี</h3>
          <ul>
            <li>#1 ผ้าไหมลายดอก สีฟ้า – 1250 ม. • ฿856,250</li>
            <li>#2 ผ้าย้อมครามลายขาว – 980 ม. • ฿844,100</li>
            <li>#3 ผ้าตะขาบโบราณ – 875 ม. • ฿839,375</li>
            <li>#4 ผ้าฝ้ายลายดอกแดง – 720 ม. • ฿832,400</li>
            <li>#5 ผ้าไหมทอง – 650 ม. • ฿829,250</li>
          </ul>
        </div>

        <div className="list-card">
          <h3>แจ้งเตือนสต็อก</h3>
          <div className="alert low">ผ้าไหมสีแดง: 12 เมตร</div>
          <div className="alert medium">ผ้าย้อมครามขาวดำ: 45 เมตร</div>
          <div className="alert low">ผ้าฝ้ายสีเขียว: 8 เมตร</div>
          <div className="alert low">ผ้าทอพิเศษ: 5 ม้วน</div>
        </div>

      </section>
    </>
  );
}