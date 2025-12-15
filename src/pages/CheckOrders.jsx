// src/pages/CheckOrders.jsx
import { useState } from "react";
import {
  FiClipboard,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";

import "../styles/orders.css";

function formatTHB(value) {
  return value.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  });
}

export default function CheckOrders() {
  const [orders] = useState([
    {
      id: "ORD-001",
      datetime: "2025-11-30 10:30",
      customer: "นางสาวสมหญิง ใจดี",
      phone: "081-234-5678",
      items: 2,
      total: 9700,
      method: "เงินสด",
      status: "สำเร็จ",
    },
    {
      id: "ORD-002",
      datetime: "2025-11-30 11:15",
      customer: "นายสมชาย รักงาน",
      phone: "089-876-5432",
      items: 1,
      total: 4500,
      method: "บัตรเครดิต",
      status: "สำเร็จ",
    },
    {
      id: "ORD-003",
      datetime: "2025-11-30 12:00",
      customer: "นางสาววิมล สุขใจ",
      phone: "092-345-6789",
      items: 3,
      total: 14200,
      method: "โอนเงิน",
      status: "รอดำเนินการ",
    },
    {
      id: "ORD-004",
      datetime: "2025-11-30 13:45",
      customer: "นายประยุทธ มีสุข",
      phone: "084-567-8901",
      items: 1,
      total: 3500,
      method: "เงินสด",
      status: "ยกเลิก",
    },
    {
      id: "ORD-005",
      datetime: "2025-11-30 14:20",
      customer: "นางสาวจรุงศรี ดีใจ",
      phone: "095-123-4567",
      items: 2,
      total: 8400,
      method: "บัตรเครดิต",
      status: "สำเร็จ",
    },
    {
      id: "ORD-006",
      datetime: "2025-11-30 15:10",
      customer: "นายมนัส ชื่นชม",
      phone: "082-345-9000",
      items: 1,
      total: 5200,
      method: "โอนเงิน",
      status: "รอดำเนินการ",
    },
  ]);

  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);

  const totalOrders = orders.length;
  const successCount = orders.filter((o) => o.status === "สำเร็จ").length;
  const pendingCount = orders.filter((o) => o.status === "รอดำเนินการ").length;
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

  const openDetail = (order) => {
    setSelected(order);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setSelected(null);
    setShowDetail(false);
  };

  return (
    <div className="orders-page">
      {/* HEADER */}
      <div className="orders-header-row">
        <div>
          <h1 className="page-title">ตรวจสอบคำสั่งซื้อ</h1>
          <p className="page-subtitle">
            ติดตามและจัดการคำสั่งซื้อทั้งหมด
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS (ไอคอน & สีไม่ซ้ำหน้า จัดซื้อ) */}
      <div className="orders-summary-grid">
        <div className="summary-card">
          <span className="icon-box purple">
            <FiClipboard />
          </span>
          <div>
            <p className="sum-title">คำสั่งซื้อทั้งหมด</p>
            <h2>{totalOrders}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="icon-box green">
            <FiCheckCircle />
          </span>
          <div>
            <p className="sum-title">สำเร็จ</p>
            <h2>{successCount}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="icon-box yellow">
            <FiClock />
          </span>
          <div>
            <p className="sum-title">รอดำเนินการ</p>
            <h2>{pendingCount}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="icon-box blue">
            <FiDollarSign />
          </span>
          <div>
            <p className="sum-title">ยอดขายรวม</p>
            <h2>{formatTHB(totalSales)}</h2>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="orders-table-section">
        <div className="table-header-row">
          <div className="table-header-left">
            <p className="sum-title table-title">รายการคำสั่งซื้อ</p>
            <p className="table-sub-note">พบ {orders.length} รายการ</p>
          </div>
          <div />
        </div>

        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>เลขที่คำสั่งซื้อ</th>
                <th>วันที่+เวลา</th>
                <th>ลูกค้า</th>
                <th>โทรศัพท์</th>
                <th>จำนวนสินค้า</th>
                <th>ยอดรวม</th>
                <th>การชำระ</th>
                <th>สถานะ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.datetime}</td>
                  <td>{o.customer}</td>
                  <td>{o.phone}</td>
                  <td>{o.items} รายการ</td>
                  <td className="blue-text">{formatTHB(o.total)}</td>
                  <td>{o.method}</td>
                  <td>
                    <span
                      className={`status ${
                        o.status === "สำเร็จ"
                          ? "success"
                          : o.status === "รอดำเนินการ"
                          ? "pending"
                          : "cancel"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-detail"
                      onClick={() => openDetail(o)}
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL รายละเอียดคำสั่งซื้อ */}
      {showDetail && selected && (
        <div className="order-detail-modal-overlay">
          <div className="order-detail-modal">
            <div className="order-detail-modal-header">
              <h2>รายละเอียดคำสั่งซื้อ</h2>
              <button
                type="button"
                className="order-detail-close-icon"
                onClick={closeDetail}
              >
                ×
              </button>
            </div>

            <div className="order-detail-modal-body">
              <div className="order-detail-row">
                <div>
                  <div className="od-label">เลขที่คำสั่งซื้อ</div>
                  <div className="od-value">{selected.id}</div>
                </div>
                <div>
                  <div className="od-label">วันที่+เวลา</div>
                  <div className="od-value">{selected.datetime}</div>
                </div>
              </div>

              <div className="order-detail-row">
                <div>
                  <div className="od-label">ชื่อลูกค้า</div>
                  <div className="od-value">{selected.customer}</div>
                </div>
                <div>
                  <div className="od-label">เบอร์โทรศัพท์</div>
                  <div className="od-value">{selected.phone}</div>
                </div>
              </div>

              <div className="order-detail-row">
                <div>
                  <div className="od-label">วิธีชำระเงิน</div>
                  <div className="od-chip">{selected.method}</div>
                </div>
                <div>
                  <div className="od-label">สถานะ</div>
                  <span
                    className={`status ${
                      selected.status === "สำเร็จ"
                        ? "success"
                        : selected.status === "รอดำเนินการ"
                        ? "pending"
                        : "cancel"
                    }`}
                  >
                    {selected.status}
                  </span>
                </div>
              </div>

              <div className="order-detail-row">
                <div>
                  <div className="od-label">จำนวนสินค้า</div>
                  <div className="od-value">
                    {selected.items} รายการ
                  </div>
                </div>
              </div>

              <hr className="order-detail-divider" />

              <div className="order-detail-total-row">
                <span>ยอดรวมทั้งหมด</span>
                <span className="order-detail-total-amount">
                  {formatTHB(selected.total)}
                </span>
              </div>
            </div>

            <div className="order-detail-modal-actions">
              <button
                type="button"
                className="order-detail-close-btn"
                onClick={closeDetail}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}