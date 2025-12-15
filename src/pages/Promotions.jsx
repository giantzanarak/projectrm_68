// src/pages/Promotions.jsx
import { useState, useMemo, useEffect } from "react";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiTag,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import "../styles/promotions.css";
import "../styles/modal.css";

import {
  fetchPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../api/promotionsApi";

const STATUS_OPTIONS = ["เปิดใช้งาน", "ปิดใช้งาน"];
const PAGE_SIZE = 4;

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // ---------------- LOAD FROM DB ----------------
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchPromotions();
        // data: [{ id, title, desc, discount, start, end, status }, ...]
        setPromotions(data || []);
      } catch (err) {
        console.error("โหลดโปรโมชั่นผิดพลาด:", err);
        alert("โหลดข้อมูลโปรโมชั่นไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // -------------- SEARCH + FILTER --------------
  const filteredPromotions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return promotions;

    return promotions.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(term) ||
        (p.desc || "").toLowerCase().includes(term)
    );
  }, [promotions, search]);

  // -------------- PAGINATION --------------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPromotions.length / PAGE_SIZE)
  );

  const currentPagePromotions = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredPromotions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredPromotions, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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

  // ---------------- MODAL / FORM ----------------
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
      discount: promo.discount || 0,
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

  const handleSave = async () => {
    if (!form.title || !form.discount) {
      alert("กรุณากรอกชื่อโปรโมชั่นและส่วนลด");
      return;
    }

    try {
      if (editingPromo) {
        // แก้ไข
        const payload = { ...form };
        const updated = await updatePromotion(payload); // คืน row ที่ normalize แล้ว
        setPromotions((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        // เพิ่มใหม่
        const payload = { ...form };
        const created = await createPromotion(payload); // normalize แล้วเหมือนกัน
        setPromotions((prev) => [...prev, created]);
      }

      closeModal();
    } catch (err) {
      console.error("บันทึกโปรโมชั่นผิดพลาด:", err);
      alert("บันทึกโปรโมชั่นไม่สำเร็จ");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบโปรโมชั่นนี้หรือไม่")) return;

    try {
      await deletePromotion(id);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("ลบโปรโมชั่นผิดพลาด:", err);
      alert("ลบโปรโมชั่นไม่สำเร็จ");
    }
  };

  // ---------------- SUMMARY ----------------
  const totalCount = promotions.length;
  const activeCount = promotions.filter(
    (p) => p.status === "เปิดใช้งาน"
  ).length;

  const avgDiscount =
    totalCount > 0
      ? (
          promotions.reduce((s, p) => s + (p.discount || 0), 0) / totalCount
        ).toFixed(1)
      : "0.0";

  const maxDiscount =
    totalCount > 0 ? Math.max(...promotions.map((p) => p.discount || 0)) : 0;

  // ---------------- RENDER ----------------
  return (
    <div className="promotions-wrapper">
      {/* HEADER */}
      <div className="promo-header">
        <div>
          <h2 className="promo-title">จัดการโปรโมชั่น</h2>
          <span className="promo-sub">จัดการโปรโมชั่นและส่วนลดพิเศษ</span>
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
            setPage(1); // reset page เมื่อ search เปลี่ยน
          }}
        />
      </div>

      {/* PROMOTION LIST */}
      {loading ? (
        <div className="promo-empty">กำลังโหลดข้อมูลโปรโมชั่น...</div>
      ) : (
        <>
          <div className="promo-grid">
            {currentPagePromotions.map((p) => {
              const soon = p.status === "เปิดใช้งาน" && isSoonExpire(p, 7);

              return (
                <div
                  className={`promo-card ${soon ? "soon-expire" : ""}`}
                  key={p.id}
                >
                  <div className="promo-left">
                    <div className="promo-icon">
                      <FiTag />
                    </div>

                    <div>
                      <h3 className="promo-name">{p.title}</h3>
                      <p className="promo-desc">{p.desc}</p>

                      <p className="promo-label">ช่วงเวลา:</p>
                      <p className="promo-date">
                        📅 {p.start || "-"} → {p.end || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="promo-right">
                    <span
                      className={`promo-status ${
                        p.status === "เปิดใช้งาน" ? "active" : "inactive"
                      } ${soon ? "soon" : ""}`}
                    >
                      {soon && p.status === "เปิดใช้งาน"
                        ? "ใกล้หมดอายุ"
                        : p.status}
                    </span>

                    <h2 className="promo-discount">{p.discount}%</h2>

                    <div className="promo-actions">
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(p)}
                      >
                        <FiEdit2 /> แก้ไข
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(p.id)}
                      >
                        <FiTrash2 /> ลบ
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {currentPagePromotions.length === 0 && (
              <div className="promo-empty">
                ไม่พบโปรโมชั่นที่ตรงกับคำค้นหา
              </div>
            )}
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