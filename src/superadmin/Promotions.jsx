// src/pages/Promotions.jsx
import { useState, useMemo } from "react";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import "../styles/promotions.css";
import "../styles/modal.css";

const STATUS_OPTIONS = ["เปิดใช้งาน", "ปิดใช้งาน"];
const PAGE_SIZE = 4;

const initialPromotions = [
  {
    id: "PR-001",
    title: "โปรเปิดร้านใหม่",
    desc: "ซื้อชุดไทยครบ 1 ชุด ลด 10% สำหรับชุดผ้าไหมทุกแบบ",
    discount: 10,
    start: "2025-01-01",
    end: "2025-01-31",
    status: "เปิดใช้งาน",
  },
  {
    id: "PR-002",
    title: "ชุดไทยคู่แม่ลูก",
    desc: "ซื้อชุดแม่ + ชุดลูก รับส่วนลดเพิ่ม 15% จากยอดรวม",
    discount: 15,
    start: "2025-02-01",
    end: "2025-02-28",
    status: "เปิดใช้งาน",
  },
  {
    id: "PR-003",
    title: "โปรผ้าซิ่นมัดหมี่",
    desc: "ซื้อผ้าซิ่นมัดหมี่ 2 ผืนขึ้นไป ลด 12%",
    discount: 12,
    start: "2025-01-15",
    end: "2025-03-31",
    status: "เปิดใช้งาน",
  },
  {
    id: "PR-004",
    title: "โปรสะสมแต้มลูกค้าประจำ",
    desc: "ลูกค้าเก่าที่มีประวัติการซื้อเกิน 10,000 บาท รับส่วนลด 20%",
    discount: 20,
    start: "2024-12-01",
    end: "2025-01-10",
    status: "ปิดใช้งาน",
  },
];

export default function Promotions() {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [loading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  const emptyForm = {
    id: null,
    title: "",
    desc: "",
    discount: 0,
    start: "",
    end: "",
    status: "เปิดใช้งาน",
  };
  const [form, setForm] = useState(emptyForm);

  // -------- SEARCH + FILTER --------
  const filteredPromotions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return promotions;

    return promotions.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(term) ||
        (p.desc || "").toLowerCase().includes(term)
    );
  }, [promotions, search]);

  // -------- PAGINATION --------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPromotions.length / PAGE_SIZE)
  );

  const currentPagePromotions = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredPromotions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredPromotions, page]);

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  // เช็คว่าใกล้หมดอายุภายใน X วันไหม
  const isSoonExpire = (promo, days = 7) => {
    if (!promo.end) return false;
    const today = new Date();
    const end = new Date(promo.end);
    const diffDays = (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= days;
  };

  // -------- MODAL / FORM --------
  const openAddModal = () => {
    setEditingPromo(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setForm({
      id: promo.id,
      title: promo.title || "",
      desc: promo.desc || "",
      discount: Number(promo.discount || 0),
      start: promo.start || "",
      end: promo.end || "",
      status: promo.status || "เปิดใช้งาน",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPromo(null);
    setForm(emptyForm);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "discount" ? Number(value) || 0 : value,
    }));
  };

  const handleSave = () => {
    if (!form.title || !form.discount) {
      alert("กรุณากรอกชื่อโปรโมชั่นและส่วนลด");
      return;
    }

    if (editingPromo) {
      setPromotions((prev) =>
        prev.map((p) => (p.id === form.id ? { ...p, ...form } : p))
      );
    } else {
      const newId = `PR-${Date.now()}`;
      const newPromo = { ...form, id: newId };
      setPromotions((prev) => [...prev, newPromo]);
    }

    closeModal();
  };

  const handleDelete = (id) => {
    if (!window.confirm("ยืนยันการลบโปรโมชั่นนี้หรือไม่")) return;
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  };

  // -------- SUMMARY --------
  const totalCount = promotions.length;
  const activeCount = promotions.filter(
    (p) => p.status === "เปิดใช้งาน"
  ).length;

  const avgDiscount =
    totalCount > 0
      ? (
          promotions.reduce(
            (s, p) => s + Number(p.discount || 0),
            0
          ) / totalCount
        ).toFixed(1)
      : "0.0";

  const maxDiscount =
    totalCount > 0
      ? Math.max(...promotions.map((p) => Number(p.discount || 0)))
      : 0;

  // -------- RENDER --------
  return (
    <div className="promotions-wrapper">
      {/* HEADER */}
      <div className="promo-header">
        <div>
          <h2 className="promo-title">จัดการโปรโมชั่น</h2>
          <span className="promo-sub">
            จัดการโปรโมชั่นและส่วนลดพิเศษของร้านผ้าทอพื้นเมือง
          </span>
        </div>

        <button className="promo-add-btn" onClick={openAddModal}>
          + เพิ่มโปรโมชั่นใหม่
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="promo-summary-grid">
        <div className="promo-summary-card">
          <p>โปรโมชั่นทั้งหมด</p>
          <h3>{totalCount} รายการ</h3>
        </div>
        <div className="promo-summary-card">
          <p>กำลังเปิดใช้งาน</p>
          <h3>{activeCount} รายการ</h3>
        </div>
        <div className="promo-summary-card">
          <p>ส่วนลดเฉลี่ย</p>
          <h3>{avgDiscount}%</h3>
        </div>
        <div className="promo-summary-card">
          <p>ส่วนลดสูงสุด</p>
          <h3>{maxDiscount}%</h3>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="promo-search">
        <FiSearch className="icon" />
        <input
          type="text"
          placeholder="ค้นหาโปรโมชั่น..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* LIST / TABLE */}
      {loading ? (
        <div className="promo-empty">กำลังโหลดข้อมูลโปรโมชั่น...</div>
      ) : (
        <>
          <div className="promo-table-wrapper">
            <table className="promo-table">
              <thead>
                <tr>
                  <th>รหัสโปรฯ</th>
                  <th>ชื่อโปรโมชั่น</th>
                  <th>ส่วนลด</th>
                  <th>ช่วงเวลา</th>
                  <th>สถานะ</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentPagePromotions.map((p) => {
                  const soon = p.status === "เปิดใช้งาน" && isSoonExpire(p, 7);
                  const label =
                    soon && p.status === "เปิดใช้งาน"
                      ? "ใกล้หมดอายุ"
                      : p.status;

                  return (
                    <tr key={p.id}>
                      <td>{p.id}</td>

                      <td>
                        <div className="promo-name-cell">
                          <div className="promo-name-main">{p.title}</div>
                          <div className="promo-name-desc">{p.desc}</div>
                        </div>
                      </td>

                      <td className="promo-discount-cell">
                        {p.discount}%
                      </td>

                      <td>
                        <div className="promo-date-cell">
                          <span>{p.start || "-"}</span>
                          <span className="promo-date-arrow">→</span>
                          <span>{p.end || "-"}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`promo-status-pill ${
                            p.status === "เปิดใช้งาน"
                              ? "status-active"
                              : "status-inactive"
                          } ${soon ? "status-soon" : ""}`}
                        >
                          {label}
                        </span>
                      </td>

                      <td>
                        <div className="promo-actions">
                          <button
                            className="promo-icon-btn edit"
                            onClick={() => openEditModal(p)}
                            title="แก้ไข"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="promo-icon-btn delete"
                            onClick={() => handleDelete(p.id)}
                            title="ลบ"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {currentPagePromotions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="promo-empty-cell">
                      ไม่พบโปรโมชั่นที่ตรงกับคำค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="promo-pagination">
              <button
                className="page-btn"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <FiChevronLeft />
              </button>
              <span>
                หน้า {page} / {totalPages}
              </span>
              <button
                className="page-btn"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL ADD / EDIT */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box promo-modal-box">
            <h2 className="modal-title">
              {editingPromo ? "แก้ไขโปรโมชั่น" : "เพิ่มโปรโมชั่นใหม่"}
            </h2>

            <div className="promo-modal-grid">
              <div className="field">
                <label>ชื่อโปรโมชั่น</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="เช่น ลดรับปีใหม่"
                />
              </div>

              <div className="field full">
                <label>รายละเอียด</label>
                <input
                  name="desc"
                  value={form.desc}
                  onChange={handleFormChange}
                  placeholder="คำอธิบายสั้น ๆ"
                />
              </div>

              <div className="field">
                <label>ส่วนลด (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={form.discount}
                  onChange={handleFormChange}
                  min="0"
                  max="100"
                />
              </div>

              <div className="field">
                <label>สถานะ</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>วันที่เริ่ม</label>
                <input
                  type="date"
                  name="start"
                  value={form.start}
                  onChange={handleFormChange}
                />
              </div>

              <div className="field">
                <label>วันที่สิ้นสุด</label>
                <input
                  type="date"
                  name="end"
                  value={form.end}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="modal-footer promo-modal-footer">
              <button className="cancel-btn" onClick={closeModal}>
                ยกเลิก
              </button>
              <button className="save-btn" onClick={handleSave}>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}