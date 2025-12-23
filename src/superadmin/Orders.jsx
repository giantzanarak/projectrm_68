// src/pages/Orders.jsx
import { useState } from "react";
import {
  FiCalendar,
  FiUser,
  FiStar,
  FiPlus,
  FiEdit,
  FiTrash2
} from "react-icons/fi";

import "../styles/orders.css";

export default function Orders() {

  // -------------------------------
  // STATE
  // -------------------------------
  const [tab, setTab] = useState("orders");

  // คำสั่งซื้อ
  const [orders, setOrders] = useState([
    {
      id: "PO-2025-001",
      date: "2025-11-25",
      supplier: "บริษัท ผ้าไหมไทย จำกัด",
      items: 5,
      price: 45000,
      delivery: "2025-12-05",
      status: "อนุมัติแล้ว"
    },
    {
      id: "PO-2025-002",
      date: "2025-11-28",
      supplier: "ห้างหุ้นส่วน ผ้าฝ้ายคุณภาพ",
      items: 3,
      price: 28000,
      delivery: "2025-12-08",
      status: "รออนุมัติ"
    }
  ]);

  // ซัพพลายเออร์
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: "บริษัท ผ้าไหมไทย จำกัด", count: 12, total: 540000, rate: 4.8 },
    { id: 2, name: "ห้างหุ้นส่วน ผ้าฝ้ายคุณภาพ", count: 8, total: 280000, rate: 4.5 },
    { id: 3, name: "บริษัท ผ้าโพธิเซสเตอร์ จำกัด", count: 6, total: 195000, rate: 4.2 },
    { id: 4, name: "ห้างหุ้นส่วน ผ้าทอมือ", count: 5, total: 175000, rate: 4.6 }
  ]);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // ฟอร์ม
  const [form, setForm] = useState({
    id: "",
    date: "",
    supplier: "",
    items: "",
    price: "",
    delivery: "",
    status: "รออนุมัติ"
  });

  // -------------------------------
  // HANDLE INPUT
  // -------------------------------
  const updateForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // -------------------------------
  // ADD / EDIT ORDER
  // -------------------------------
  const saveOrder = () => {
    if (editing) {
      // แก้ไข
      setOrders(
        orders.map((o) =>
          o.id === editing ? { ...form } : o
        )
      );
    } else {
      // เพิ่มใหม่
      setOrders([...orders, { ...form }]);
    }

    closeModal();
  };

  // เปิดแก้ไข
  const editOrder = (order) => {
    setEditing(order.id);
    setForm(order);
    setShowModal(true);
  };

  // ลบ
  const deleteOrder = (id) => {
    setOrders(orders.filter((o) => o.id !== id));
  };

  // Reset Modal
  const openAddModal = () => {
    setEditing(null);
    setForm({
      id: "",
      date: "",
      supplier: "",
      items: "",
      price: "",
      delivery: "",
      status: "รออนุมัติ"
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  return (
    <div className="orders-page">

      {/* HEADER */}
      <div className="orders-header-row">
        <div>
          <h1 className="page-title">จัดซื้อ</h1>
          <p className="page-subtitle">จัดการคำสั่งซื้อวัตถุดิบและซัพพลายเออร์</p>
        </div>
      </div>


      {/* SUMMARY CARDS */}
      <div className="orders-summary-grid">
        <div className="summary-card">
          <span className="icon-box purple"><FiCalendar /></span>
          <div>
            <p className="sum-title">ใบสั่งซื้อทั้งหมด</p>
            <h2>{orders.length}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="icon-box green">✔</span>
          <div>
            <p className="sum-title">อนุมัติแล้ว</p>
            <h2>{orders.filter(o => o.status === "อนุมัติแล้ว").length}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="icon-box yellow">⏱</span>
          <div>
            <p className="sum-title">รออนุมัติ</p>
            <h2>{orders.filter(o => o.status === "รออนุมัติ").length}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="icon-box blue">$</span>
          <div>
            <p className="sum-title">มูลค่ารวม</p>
            <h2>
              ฿{orders.reduce((sum, o) => sum + Number(o.price), 0).toLocaleString()}
            </h2>
          </div>
        </div>
      </div>

      {/* TAB SWITCH */}
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


      {/* =============================
          TAB : คำสั่งซื้อ
      ============================== */}
      {tab === "orders" && (
  <div className="orders-table-section">

    {/* ปุ่มสร้างใบสั่งซื้อ ด้านบน-ขวา */}
    <div className="table-header-row">
      <div></div> {/* เว้นด้านซ้ายไว้โล่ง */}
      <button className="btn-add" onClick={openAddModal}>
        <FiPlus /> สร้างใบสั่งซื้อ
      </button>
    </div>

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
            <th>สถานะ</th>
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
              <td className="blue-text">฿{o.price.toLocaleString()}</td>
              <td>{o.delivery}</td>
              <td>
                <span className={`status ${
                  o.status === "อนุมัติแล้ว" ? "success" : "pending"
                }`}>
                  {o.status}
                </span>
              </td>

              <td>
                <button className="icon-btn edit" onClick={() => editOrder(o)}>
                  <FiEdit />
                </button>

                <button className="icon-btn delete" onClick={() => deleteOrder(o.id)}>
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
)}


      {/* =============================
          TAB : ซัพพลายเออร์
      ============================== */}
      {tab === "suppliers" && (
        <div className="supplier-grid">
          {suppliers.map((s) => (
            <div className="supplier-card" key={s.id}>
              <div className="sup-row">
                <FiUser className="sup-icon" />
                <h3>{s.name}</h3>
              </div>

              <p>จำนวนคำสั่งซื้อ: {s.count} ครั้ง</p>
              <p>มูลค่ารวม: ฿{s.total.toLocaleString()}</p>

              <p className="rating">
                <FiStar /> {s.rate}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* -----------------------------
           MODAL ฟอร์มเพิ่ม/แก้
      ----------------------------- */}
      {showModal && (
        <div className="modal-bg">
          <div className="modal-box">
            <h2>{editing ? "แก้ไขใบสั่งซื้อ" : "เพิ่มใบสั่งซื้อ"}</h2>

            <div className="modal-form">

              <label>เลขที่ใบสั่งซื้อ</label>
              <input name="id" value={form.id} onChange={updateForm} />

              <label>วันที่สั่ง</label>
              <input type="date" name="date" value={form.date} onChange={updateForm} />

              <label>ซัพพลายเออร์</label>
              <input name="supplier" value={form.supplier} onChange={updateForm} />

              <label>จำนวนรายการ</label>
              <input name="items" value={form.items} onChange={updateForm} />

              <label>ราคา</label>
              <input name="price" value={form.price} onChange={updateForm} />

              <label>วันที่ส่งของ</label>
              <input type="date" name="delivery" value={form.delivery} onChange={updateForm} />

              <label>สถานะ</label>
              <select name="status" value={form.status} onChange={updateForm}>
                <option>รออนุมัติ</option>
                <option>อนุมัติแล้ว</option>
              </select>

            </div>

            <div className="modal-buttons">
              <button className="btn-cancel" onClick={closeModal}>ยกเลิก</button>
              <button className="btn-save" onClick={saveOrder}>บันทึก</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}