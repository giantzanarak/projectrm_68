import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import "../styles/promotions.css";

const API = "http://localhost:3010";
const PAGE_SIZE = 6;

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  const emptyForm = {
    idPromotion: null,
    Promotion_details: "",
    promo_code: "",
    PER_ITEM: 0,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(`${API}/promotion`);
      setPromotions(res.data || []);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "โหลดโปรโมชั่นไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const filteredPromotions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return promotions;
    return promotions.filter((p) => {
      const a = (p.Promotion_details || "").toLowerCase();
      const b = (p.promo_code || "").toLowerCase();
      return a.includes(term) || b.includes(term) || String(p.idPromotion).includes(term);
    });
  }, [promotions, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPromotions.length / PAGE_SIZE));
  const currentPagePromotions = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredPromotions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredPromotions, page]);

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  const totalCount = promotions.length;
  const activeCount = promotions.filter((p) => Number(p.is_active) === 1).length;

  const avgDiscount =
    totalCount > 0
      ? (promotions.reduce((s, p) => s + Number(p.PER_ITEM || 0), 0) / totalCount).toFixed(1)
      : "0.0";

  const maxDiscount =
    totalCount > 0 ? Math.max(...promotions.map((p) => Number(p.PER_ITEM || 0))) : 0;

  const openAddModal = () => {
    setEditingPromo(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setForm({
      idPromotion: promo.idPromotion,
      Promotion_details: promo.Promotion_details || "",
      promo_code: promo.promo_code || "",
      PER_ITEM: Number(promo.PER_ITEM || 0),
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
      [name]: name === "PER_ITEM" ? Number(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    if (!form.Promotion_details || !form.promo_code) {
      alert("กรุณากรอก รายละเอียดโปรโมชั่น และ รหัสโปรฯ");
      return;
    }

    try {
      setLoading(true);
      setErr("");

      if (editingPromo) {
        await axios.put(`${API}/promotion/${form.idPromotion}`, {
          Promotion_details: form.Promotion_details,
          promo_code: form.promo_code,
          PER_ITEM: form.PER_ITEM,
        });
      } else {
        await axios.post(`${API}/promotion`, {
          Promotion_details: form.Promotion_details,
          promo_code: form.promo_code,
          PER_ITEM: form.PER_ITEM,
        });
      }

      closeModal();
      await fetchPromotions();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "บันทึกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // ✅ เปิด/ปิด (ใช้สวิตช์)
  const handleToggleActive = async (idPromotion) => {
    try {
      setLoading(true);
      await axios.put(`${API}/promotion/toggle/${idPromotion}`);
      await fetchPromotions();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "เปลี่ยนสถานะไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ลบแบบ soft delete
  const handleDelete = async (idPromotion) => {
    const ok = window.confirm("ยืนยันลบ?");
    if (!ok) return;

    try {
      setPromotions((prev) => prev.filter((p) => p.idPromotion !== idPromotion));
      await axios.put(`${API}/promotion/delete/${idPromotion}`);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "ลบไม่สำเร็จ");
      await fetchPromotions();
    }
  };

  return (
    <div className="promotions-wrapper">
      <div className="promo-header">
        <div>
          <h2 className="promo-title">จัดการโปรโมชั่น</h2>
          <span className="promo-sub">ดึงข้อมูลจากฐานข้อมูลจริง </span>
        </div>

        <button className="promo-add-btn" onClick={openAddModal}>
          + เพิ่มโปรโมชั่นใหม่
        </button>
      </div>

      {err && <div className="promo-empty">{err}</div>}

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

      <div className="promo-search">
        <FiSearch className="icon" />
        <input
          type="text"
          placeholder="ค้นหา (รหัสโปรฯ / รายละเอียด)..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <div className="promo-empty">กำลังโหลดข้อมูลโปรโมชั่น...</div>
      ) : (
        <>
          <div className="promo-table-wrapper">
            <table className="promo-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>รายละเอียด</th>
                  <th>รหัสโปรฯ</th>
                  <th>ส่วนลด</th>
                  <th>สถานะ</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>

              <tbody>
                {currentPagePromotions.map((p) => {
                  const isActive = Number(p.is_active) === 1;

                  return (
                    <tr key={p.idPromotion}>
                      <td>{p.idPromotion}</td>

                      <td>
                        <div className="promo-name-cell">
                          <div className="promo-name-main">{p.Promotion_details}</div>
                          <div className="promo-name-desc">
                            created: {String(p.created_at || "").slice(0, 10) || "-"}
                          </div>
                        </div>
                      </td>

                      <td style={{ fontWeight: 700 }}>{p.promo_code}</td>
                      <td className="promo-discount-cell">{Number(p.PER_ITEM || 0)}%</td>

                      <td>
                        <span className={`promo-status-pill ${isActive ? "status-active" : "status-inactive"}`}>
                          {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
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

                          {/* ✅ สวิตช์เปิด/ปิด */}
                          <button
  type="button"
  className={`status-toggle ${isActive ? "on" : "off"}`}
  onClick={() => handleToggleActive(p.idPromotion)}
  title={isActive ? "คลิกเพื่อปิดใช้งาน" : "คลิกเพื่อเปิดใช้งาน"}
>
  <span className="status-dot" />
  <span className="status-text">{isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
</button>

                          <button
                            className="promo-icon-btn delete"
                            onClick={() => handleDelete(p.idPromotion)}
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

          {totalPages > 1 && (
            <div className="promo-pagination">
              <button className="page-btn" onClick={handlePrevPage} disabled={page === 1}>
                <FiChevronLeft />
              </button>
              <span>
                หน้า {page} / {totalPages}
              </span>
              <button className="page-btn" onClick={handleNextPage} disabled={page === totalPages}>
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <div className="promo-modal-overlay" onClick={closeModal}>
          <div className="promo-modal-card promo-modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingPromo ? "แก้ไขโปรโมชั่น" : "เพิ่มโปรโมชั่นใหม่"}</h2>

            <div className="promo-modal-grid">
              <div className="field full">
                <label>รายละเอียดโปรโมชั่น</label>
                <input
                  name="Promotion_details"
                  value={form.Promotion_details}
                  onChange={handleFormChange}
                  placeholder="เช่น ลดรับปีใหม่"
                />
              </div>

              <div className="field">
                <label>รหัสโปรฯ</label>
                <input
                  name="promo_code"
                  value={form.promo_code}
                  onChange={handleFormChange}
                  placeholder="เช่น NEWYEAR2025"
                />
              </div>

              <div className="field">
                <label>ส่วนลด (%)</label>
                <input
                  type="number"
                  name="PER_ITEM"
                  value={form.PER_ITEM}
                  onChange={handleFormChange}
                  min="0"
                  max="100"
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