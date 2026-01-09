// src/pages/CheckOrders.jsx
import React, { useState } from "react";
import "../css/CheckOrders.css";

// ---------------- MOCK ORDERS ----------------
const mockOrders = [
  {
    id: "ORD-001",
    datetime: "2025-11-30 10:30",
    customer: "นายจักรกฤษณ์ แก้วโยธา",
    phone: "081-234-5678",
    items: 2,
    total: 8700,
    payMethod: "เงินสด",
    status: "สำเร็จ",
  },
  {
    id: "ORD-002",
    datetime: "2025-11-30 11:15",
    customer: "นายญาณวุฒ ชุ่มใจ",
    phone: "089-876-5432",
    items: 1,
    total: 4500,
    payMethod: "บัตรเครดิต",
    status: "สำเร็จ",
  },
  {
    id: "ORD-003",
    datetime: "2025-11-30 12:00",
    customer: "นางสาวสุจิรา สัตถาผล",
    phone: "092-345-6789",
    items: 3,
    total: 14200,
    payMethod: "โอนเงิน",
    status: "รอดำเนินการ",
  },
  {
    id: "ORD-004",
    datetime: "2025-11-30 13:45",
    customer: "นายภาวัต วงค์มาลาสิทธิ์",
    phone: "084-567-8901",
    items: 2,
    total: 3500,
    payMethod: "เงินสด",
    status: "ยกเลิก",
  },
];

// ---------------- STAT CARD ----------------
function StatCard({ icon, label, value, bg }) {
  const isImage = icon?.includes("/"); // ถ้ามี path → เป็นรูป

  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        {isImage ? (
          <img src={icon} className="stat-img" />
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

// ---------------- MAIN PAGE ----------------
export default function CheckOrders() {
  const [paymentFilter, setPaymentFilter] = useState("ทุกวิธีชำระ");
  const [query, setQuery] = useState("");
  const [showPayMenu, setShowPayMenu] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);

  // ---------------- FILTER LOGIC ----------------
  const filteredOrders = mockOrders.filter((o) => {
    const matchQuery =
      o.id.includes(query) ||
      o.customer.includes(query) ||
      o.phone.includes(query);

    const matchPayment =
      paymentFilter === "ทุกวิธีชำระ" || o.payMethod === paymentFilter;

    return matchQuery && matchPayment;
  });

  return (
    <div className="checkorders-page">
      {/* ===== HEADER ===== */}
      <h2 className="co-title">ตรวจสอบคำสั่งซื้อ</h2>
      <p className="co-subtitle">จัดการคำสั่งซื้อทั้งหมดของร้าน</p>

      {/* ===== STAT CARDS ===== */}
      <div className="co-stat-grid">
        <StatCard
          icon="/pics/box.png"
          label="คำสั่งซื้อทั้งหมด"
          value={mockOrders.length}
          bg="#f1f5f9"
        />

        <StatCard
          icon="/pics/success.png"
          label="สำเร็จ"
          value={mockOrders.filter((o) => o.status === "สำเร็จ").length}
          bg="#dcfce7"
        />

        <StatCard
          icon="/pics/time.png"
          label="รอดำเนินการ"
          value={
            mockOrders.filter((o) => o.status === "รอดำเนินการ").length
          }
          bg="#fef9c3"
        />

        <StatCard
          icon="/pics/money2.png"
          label="ยอดขายรวม"
          value={
            "฿" +
            mockOrders
              .reduce((sum, o) => sum + o.total, 0)
              .toLocaleString()
          }
          bg="#e0f2fe"
        />
      </div>

      {/* ===== FILTER BAR (เหลือแค่วิธีชำระ) ===== */}
      <div className="co-filter-bar-wrapper">
        <div className="co-filter-bar">
          {/* Search */}
          <input
            type="text"
            className="co-search-input"
            placeholder="ค้นหาคำสั่งซื้อ (เลขที่, ชื่อลูกค้า, เบอร์โทร)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* Filter: Payment */}
          <div
            className="co-dropdown"
            onClick={() => {
              setShowPayMenu(!showPayMenu);
            }}
          >
            <span>{paymentFilter}</span>
            <span>⌄</span>

            {showPayMenu && (
              <div className="co-dropdown-menu">
                {["ทุกวิธีชำระ", "เงินสด", "บัตรเครดิต", "โอนเงิน"].map(
                  (item) => (
                    <div
                      key={item}
                      className="co-dropdown-item"
                      onClick={() => {
                        setPaymentFilter(item);
                        setShowPayMenu(false);
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

        <p className="co-result-count">
          พบ <b>{filteredOrders.length}</b> รายการ
        </p>
      </div>

      {/* ===== ORDER TABLE (ตัดคอลัมน์สถานะออก) ===== */}
      <table className="co-table">
        <thead>
          <tr>
            <th>เลขที่คำสั่งซื้อ</th>
            <th>วันที่-เวลา</th>
            <th>ลูกค้า</th>
            <th>โทรศัพท์</th>
            <th>จำนวนสินค้า</th>
            <th>ยอดรวม</th>
            <th>การชำระ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.datetime}</td>
              <td>{o.customer}</td>
              <td>{o.phone}</td>
              <td>{o.items} รายการ</td>
              <td>฿{o.total.toLocaleString()}</td>
              <td>{o.payMethod}</td>
              <td>
                <button
                  className="co-detail-btn"
                  onClick={() => setSelectedOrder(o)}
                >
                  รายละเอียด
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== DETAIL MODAL (เอาบรรทัดสถานะออก) ===== */}
      {selectedOrder && (
        <div
          className="co-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div className="co-modal" onClick={(e) => e.stopPropagation()}>
            <h3>รายละเอียดคำสั่งซื้อ</h3>
            <p>
              <b>เลขที่คำสั่งซื้อ:</b> {selectedOrder.id}
            </p>
            <p>
              <b>วันที่-เวลา:</b> {selectedOrder.datetime}
            </p>
            <p>
              <b>ลูกค้า:</b> {selectedOrder.customer}
            </p>
            <p>
              <b>เบอร์โทร:</b> {selectedOrder.phone}
            </p>
            <p>
              <b>จำนวนสินค้า:</b> {selectedOrder.items}
            </p>
            <p>
              <b>ยอดรวม:</b>{" "}
              ฿{selectedOrder.total.toLocaleString()}
            </p>
            <p>
              <b>การชำระ:</b> {selectedOrder.payMethod}
            </p>

            <button
              className="co-close-btn"
              onClick={() => setSelectedOrder(null)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}