// src/pages/Orders.jsx
import { useState } from "react";
import {
  FiCalendar,
  FiUser,
  FiStar,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";

import "../styles/orders.css";

export default function Orders() {
  const [tab, setTab] = useState("orders");

  // -----------------------------
  // MOCK DATA
  // -----------------------------
  const [orders, setOrders] = useState([
    {
      id: "PO-2025-001",
      date: "2025-11-25",
      supplier: "บริษัท ผ้าไหมไทย จำกัด",
      items: 5,
      price: 45000,
      delivery: "2025-12-05",
      receiveStatus: "รับครบแล้ว",
      receivedQty: 5,
    },
    {
      id: "PO-2025-002",
      date: "2025-11-28",
      supplier: "ห้างหุ้นส่วน ผ้าฝ้ายคุณภาพ",
      items: 3,
      price: 28000,
      delivery: "2025-12-08",
      receiveStatus: "รอสินค้า",
      receivedQty: 0,
    },
  ]);

  const [suppliers] = useState([
    { id: 1, name: "บริษัท ผ้าไหมไทย จำกัด", count: 12, total: 540000, rate: 4.8 },
    { id: 2, name: "ห้างหุ้นส่วน ผ้าฝ้ายคุณภาพ", count: 8, total: 280000, rate: 4.5 },
    { id: 3, name: "บริษัท ผ้าโพธิเซสเตอร์ จำกัด", count: 6, total: 195000, rate: 4.2 },
    { id: 4, name: "ห้างหุ้นส่วน ผ้าทอมือ", count: 5, total: 175000, rate: 4.6 },
  ]);

  // -----------------------------
  // MODAL STATE
  // -----------------------------
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState(null);
  const [receiveQty, setReceiveQty] = useState("");

  const [form, setForm] = useState({
    id: "",
    date: "",
    supplier: "",
    items: "",
    price: "",
    delivery: "",
    receiveStatus: "รอสินค้า",
    receivedQty: 0,
  });

  // -----------------------------
  // MAIN FORM
  // -----------------------------
  const updateForm = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveOrder = () => {
    const parsedItems = Number(form.items) || 0;
    const parsedPrice = Number(form.price) || 0;

    const payload = {
      ...form,
      items: parsedItems,
      price: parsedPrice,
      receivedQty: Number(form.receivedQty || 0),
    };

    if (editing) {
      setOrders((prev) => prev.map((o) => (o.id === editing ? payload : o)));
    } else {
      setOrders((prev) => [...prev, payload]);
    }
    closeMainModal();
  };

  const editOrder = (order) => {
    setEditing(order.id);
    setForm({
      id: order.id,
      date: order.date,
      supplier: order.supplier,
      items: order.items,
      price: order.price,
      delivery: order.delivery,
      receiveStatus: order.receiveStatus || "รอสินค้า",
      receivedQty: order.receivedQty ?? 0,
    });
    setShowModal(true);
  };

  const deleteOrder = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const openAddModal = () => {
    setEditing(null);
    setForm({
      id: "",
      date: "",
      supplier: "",
      items: "",
      price: "",
      delivery: "",
      receiveStatus: "รอสินค้า",
      receivedQty: 0,
    });
    setShowModal(true);
  };

  const closeMainModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  // -----------------------------
  // RECEIVE MODAL
  // -----------------------------
  const openReceiveModal = (order) => {
    setReceiveTarget(order);
    setReceiveQty(
      typeof order.receivedQty === "number" ? String(order.receivedQty) : ""
    );
    setShowReceiveModal(true);
  };

  const closeReceiveModal = () => {
    setShowReceiveModal(false);
    setReceiveTarget(null);
    setReceiveQty("");
  };

  const handleConfirmReceive = () => {
    if (!receiveTarget) return;

    const qtyNum = Number(receiveQty) || 0;
    const total = Number(receiveTarget.items) || 0;
    const status = qtyNum >= total ? "รับครบแล้ว" : "รอสินค้า";

    setOrders((prev) =>
      prev.map((o) =>
        o.id === receiveTarget.id
          ? { ...o, receivedQty: qtyNum, receiveStatus: status }
          : o
      )
    );

    closeReceiveModal();
  };

  // -----------------------------
  // SUMMARY
  // -----------------------------
  const totalOrders = orders.length;
  const receivedCount = orders.filter(
    (o) => o.receiveStatus === "รับครบแล้ว"
  ).length;
  const waitingCount = orders.filter(
    (o) => o.receiveStatus === "รอสินค้า"
  ).length;
  const totalValue = orders.reduce(
    (sum, o) => sum + Number(o.price || 0),
    0
  );

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="orders-page">
      {/* HEADER */}
      <div className="orders-header-row">
        <div>
          <h1 className="page-title">จัดซื้อ</h1>
          <p className="page-subtitle">
            จัดการคำสั่งซื้อวัตถุดิบและซัพพลายเออร์
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="orders-summary-grid">
        <div className="summary-card">
          <span className="icon-box purple">
            <FiCalendar />
          </span>
          <div>
            <p className="sum-title">ใบสั่งซื้อทั้งหมด</p>
            <h2>{totalOrders}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="icon-box green">✔</span>
          <div>
            <p className="sum-title">รับครบแล้ว</p>
            <h2>{receivedCount}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="icon-box yellow">⏱</span>
          <div>
            <p className="sum-title">รอสินค้า</p>
            <h2>{waitingCount}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="icon-box blue">$</span>
          <div>
            <p className="sum-title">มูลค่ารวม</p>
            <h2>฿{totalValue.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* TOOLBAR (Tabs + Add button) */}
      <div className="orders-toolbar">
        <div className="orders-tabs">
          <button
            className={tab === "orders" ? "tab active" : "tab"}
            onClick={() => setTab("orders")}
          >
            คำสั่งซื้อ
          </button>
          <button
            className={tab === "suppliers" ? "tab active" : "tab"}
            onClick={() => setTab("suppliers")}
          >
            ซัพพลายเออร์
          </button>
        </div>

        {tab === "orders" && (
          <button className="btn-add" onClick={openAddModal}>
            <FiPlus size={14} />
            <span>สร้างใบสั่งซื้อ</span>
          </button>
        )}
      </div>

      {/* TAB: คำสั่งซื้อ */}
      {tab === "orders" && (
        <div className="orders-table-section">
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>เลขที่ใบสั่งซื้อ</th>
                  <th>วันที่สั่ง</th>
                  <th>ซัพพลายเออร์</th>
                  <th>จำนวน</th>
                  <th>มูลค่า</th>
                  <th>วันที่ส่งของ</th>
                  <th>สถานะรับของ</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.date}</td>
                    <td>{o.supplier}</td>
                    <td>{o.items} รายการ</td>
                    <td className="blue-text">
                      ฿{Number(o.price || 0).toLocaleString()}
                    </td>
                    <td>{o.delivery}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          o.receiveStatus === "รับครบแล้ว"
                            ? "status-success"
                            : "status-pending"
                        }`}
                      >
                        {o.receiveStatus}
                      </span>
                      {typeof o.receivedQty === "number" && (
                        <span className="status-note">
                          {o.receivedQty}/{o.items} ชิ้น
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="orders-actions">
                        <button
                          className="icon-btn receive"
                          title="บันทึกการรับสินค้า"
                          onClick={() => openReceiveModal(o)}
                        >
                          <FiCheckCircle />
                        </button>
                        <button
                          className="icon-btn edit"
                          onClick={() => editOrder(o)}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="icon-btn delete"
                          onClick={() => deleteOrder(o.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ซัพพลายเออร์ – แสดงเป็น “ตาราง” */}
      {tab === "suppliers" && (
        <div className="suppliers-table-wrapper">
          <div className="orders-table suppliers-table">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>#</th>
                  <th>ชื่อซัพพลายเออร์</th>
                  <th>จำนวนคำสั่งซื้อ</th>
                  <th>มูลค่ารวม</th>
                  <th>เรตติ้ง</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s, index) => (
                  <tr key={s.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="supplier-cell-name">
                        <FiUser className="sup-icon-table" />
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td>{s.count} ครั้ง</td>
                    <td>฿{s.total.toLocaleString()}</td>
                    <td>
                      <span className="rating-chip">
                        <FiStar /> {s.rate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: เพิ่ม/แก้ใบสั่งซื้อ */}
      {showModal && (
        <div className="modal-bg">
          <div className="modal-box">
            <h2 className="modal-title">
              {editing ? "แก้ไขใบสั่งซื้อ" : "เพิ่มใบสั่งซื้อ"}
            </h2>

            <div className="modal-form">
              <label>เลขที่ใบสั่งซื้อ</label>
              <input name="id" value={form.id} onChange={updateForm} />

              <label>วันที่สั่ง</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={updateForm}
              />

              <label>ซัพพลายเออร์</label>
              <input
                name="supplier"
                value={form.supplier}
                onChange={updateForm}
              />

              <label>จำนวนรายการ</label>
              <input
                type="number"
                min="0"
                name="items"
                value={form.items}
                onChange={updateForm}
              />

              <label>ราคา</label>
              <input
                type="number"
                min="0"
                name="price"
                value={form.price}
                onChange={updateForm}
              />

              <label>วันที่ส่งของ</label>
              <input
                type="date"
                name="delivery"
                value={form.delivery}
                onChange={updateForm}
              />

              <label>สถานะการรับสินค้า</label>
              <select
                name="receiveStatus"
                value={form.receiveStatus}
                onChange={updateForm}
              >
                <option value="รอสินค้า">รอสินค้า</option>
                <option value="รับครบแล้ว">รับครบแล้ว</option>
              </select>
            </div>

            <div className="modal-buttons">
              <button className="btn-cancel" onClick={closeMainModal}>
                ยกเลิก
              </button>
              <button className="btn-save" onClick={saveOrder}>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: บันทึกรับสินค้า */}
      {showReceiveModal && (
        <div className="modal-bg">
          <div className="modal-box receive-modal">
            <h2 className="modal-title">บันทึกการรับสินค้า</h2>
            <p className="modal-sub">
              ใบสั่งซื้อ <strong>{receiveTarget?.id}</strong> —{" "}
              {receiveTarget?.supplier}
            </p>

            <div className="modal-form two-col">
              <div className="modal-field">
                <label>จำนวนตามใบสั่งซื้อ</label>
                <input readOnly value={receiveTarget?.items ?? ""} />
              </div>
              <div className="modal-field">
                <label>จำนวนที่ได้รับจริง</label>
                <input
                  type="number"
                  min="0"
                  max={receiveTarget?.items ?? undefined}
                  value={receiveQty}
                  onChange={(e) => setReceiveQty(e.target.value)}
                />
              </div>
            </div>

           

            <div className="modal-buttons">
              <button className="btn-cancel" onClick={closeReceiveModal}>
                ยกเลิก
              </button>
              <button className="btn-save" onClick={handleConfirmReceive}>
                บันทึกการรับสินค้า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}