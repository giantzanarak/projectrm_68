import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/http";
import Swal from "sweetalert2";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiGift,
  FiCheckCircle,
  FiSlash,
  FiClock,
} from "react-icons/fi";
import "../styles/promotions.css";
import Select from "../components/Select";

const API = API_BASE;
const PAGE_SIZE = 6;

const swalBaseClasses = {
  popup: "promo-swal-popup",
  confirmButton: "promo-swal-confirm",
  cancelButton: "promo-swal-cancel",
};

const swalDeleteClasses = {
  popup: "promo-swal-popup",
  confirmButton: "promo-swal-delete",
  cancelButton: "promo-swal-cancel",
};

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  const emptyForm = {
    idPromotion: null,
    Promotion_details: "",
    promo_code: "",
    PER_ITEM: 0,
    start_at: "",
    end_at: "",
    usage_limit: "",
  };

  const toInputDateTime = (v) => {
    if (!v) return "";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const formatDateTime = (v) => {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString("th-TH", {
      day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  };

  const STATUS_LABEL = {
    active: "เปิดใช้งาน",
    scheduled: "ยังไม่ถึงเวลา",
    expired: "หมดเวลาแล้ว",
    used_up: "สิทธิ์เต็มแล้ว",
    off: "ปิดใช้งาน",
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

    return promotions.filter((p) => {
      const details = (p.Promotion_details || "").toLowerCase();
      const code = (p.promo_code || "").toLowerCase();
      const idText = String(p.idPromotion || "");
      const isActive = Number(p.is_active) === 1;

      const matchSearch =
        !term ||
        details.includes(term) ||
        code.includes(term) ||
        idText.includes(term);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchSearch && matchStatus;
    });
  }, [promotions, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPromotions.length / PAGE_SIZE)
  );

  const currentPagePromotions = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredPromotions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredPromotions, page]);

  const totalCount = promotions.length;
  const activeCount = promotions.filter(
    (p) => Number(p.is_active) === 1
  ).length;
  const inactiveCount = totalCount - activeCount;
  const autoClosedCount = promotions.filter(
    (p) => p.status === "expired" || p.status === "used_up"
  ).length;

  const selectStatus = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handlePrevPage = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () =>
    setPage((prev) => Math.min(totalPages, prev + 1));

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
      start_at: toInputDateTime(promo.start_at),
      end_at: toInputDateTime(promo.end_at),
      usage_limit: promo.usage_limit === null || promo.usage_limit === undefined ? "" : String(promo.usage_limit),
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

  const clearField = (field) => {
    setForm((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSave = async () => {
    if (!form.Promotion_details || !form.promo_code) {
      await Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: "กรุณากรอก รายละเอียดโปรโมชั่น และ รหัสโปรฯ",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: swalBaseClasses,
      });
      return;
    }

    if (form.start_at && form.end_at && form.end_at < form.start_at) {
      await Swal.fire({
        icon: "warning",
        title: "ช่วงเวลาไม่ถูกต้อง",
        text: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: swalBaseClasses,
      });
      return;
    }

    try {
      setLoading(true);
      setErr("");

      if (editingPromo) {
        const result = await Swal.fire({
          icon: "question",
          title: "ยืนยันการแก้ไข?",
          text: "คุณต้องการบันทึกการเปลี่ยนแปลงโปรโมชั่นนี้ใช่หรือไม่",
          showCancelButton: true,
          confirmButtonText: "ใช่, บันทึกเลย",
          cancelButtonText: "ยกเลิก",
          reverseButtons: true,
          buttonsStyling: false,
          customClass: swalBaseClasses,
        });

        if (!result.isConfirmed) {
          setLoading(false);
          return;
        }

        await axios.put(`${API}/promotion/${form.idPromotion}`, {
          Promotion_details: form.Promotion_details,
          promo_code: form.promo_code,
          PER_ITEM: form.PER_ITEM,
          start_at: form.start_at,
          end_at: form.end_at,
          usage_limit: form.usage_limit,
        });

        await Swal.fire({
          icon: "success",
          title: "แก้ไขสำเร็จ",
          text: "อัปเดตโปรโมชั่นเรียบร้อยแล้ว",
          confirmButtonText: "ตกลง",
          buttonsStyling: false,
          customClass: swalBaseClasses,
        });
      } else {
        const result = await Swal.fire({
          icon: "question",
          title: "ยืนยันการเพิ่มโปรโมชั่น?",
          text: "คุณต้องการเพิ่มโปรโมชั่นใหม่นี้ใช่หรือไม่",
          showCancelButton: true,
          confirmButtonText: "ใช่, เพิ่มเลย",
          cancelButtonText: "ยกเลิก",
          reverseButtons: true,
          buttonsStyling: false,
          customClass: swalBaseClasses,
        });

        if (!result.isConfirmed) {
          setLoading(false);
          return;
        }

        await axios.post(`${API}/promotion`, {
          Promotion_details: form.Promotion_details,
          promo_code: form.promo_code,
          PER_ITEM: form.PER_ITEM,
          start_at: form.start_at,
          end_at: form.end_at,
          usage_limit: form.usage_limit,
        });

        await Swal.fire({
          icon: "success",
          title: "เพิ่มสำเร็จ",
          text: "เพิ่มโปรโมชั่นเรียบร้อยแล้ว",
          confirmButtonText: "ตกลง",
          buttonsStyling: false,
          customClass: swalBaseClasses,
        });
      }

      closeModal();
      await fetchPromotions();
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: e?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: swalBaseClasses,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (promo) => {
    const isActive = Number(promo.is_active) === 1;

    const result = await Swal.fire({
      icon: "question",
      title: isActive ? "ปิดการใช้งานโปรโมชั่น?" : "เปิดการใช้งานโปรโมชั่น?",
      text: isActive
        ? "คุณต้องการปิดการใช้งานโปรโมชั่นนี้ใช่หรือไม่"
        : "คุณต้องการเปิดการใช้งานโปรโมชั่นนี้ใช่หรือไม่",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: swalBaseClasses,
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await axios.put(`${API}/promotion/toggle/${promo.idPromotion}`);
      await fetchPromotions();

      await Swal.fire({
        icon: "success",
        title: "เปลี่ยนสถานะสำเร็จ",
        text: isActive
          ? "ปิดการใช้งานโปรโมชั่นแล้ว"
          : "เปิดการใช้งานโปรโมชั่นแล้ว",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: swalBaseClasses,
      });
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "เปลี่ยนสถานะไม่สำเร็จ",
        text: e?.response?.data?.message || "เกิดข้อผิดพลาด",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: swalBaseClasses,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (idPromotion) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบโปรโมชั่นนี้ใช่หรือไม่",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: swalDeleteClasses,
    });

    if (!result.isConfirmed) return;

    try {
      setPromotions((prev) =>
        prev.filter((p) => p.idPromotion !== idPromotion)
      );
      await axios.put(`${API}/promotion/delete/${idPromotion}`);

      await Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        text: "ลบโปรโมชั่นเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: swalBaseClasses,
      });
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "ลบไม่สำเร็จ",
        text: e?.response?.data?.message || "เกิดข้อผิดพลาดในการลบข้อมูล",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: swalBaseClasses,
      });
      await fetchPromotions();
    }
  };

  return (
    <div className="promotions-wrapper">
      <header className="promo-top">
        <div>
          <h1 className="promo-title">จัดการโปรโมชั่น</h1>
        </div>
        <button className="promo-add-btn" onClick={openAddModal}>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          เพิ่มโปรโมชั่นใหม่
        </button>
      </header>

      {err && <div className="promo-empty">{err}</div>}

      <div className="summary-container">
        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">โปรโมชั่นทั้งหมด</span>
            <h2 className="card-value">{totalCount}<small>รายการ</small></h2>
          </div>
          <div className="card-icon-box bg-gray-light"><FiGift size={24} /></div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">กำลังเปิดใช้งาน</span>
            <h2 className="card-value">{activeCount}<small>รายการ</small></h2>
          </div>
          <div className="card-icon-box bg-gray-light"><FiCheckCircle size={24} /></div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">ปิดใช้งานอยู่</span>
            <h2 className="card-value">{inactiveCount}<small>รายการ</small></h2>
          </div>
          <div className="card-icon-box bg-gray-light"><FiSlash size={24} /></div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">หมดเวลา / สิทธิ์เต็ม</span>
            <h2 className="card-value">{autoClosedCount}<small>รายการ</small></h2>
          </div>
          <div className="card-icon-box bg-gray-light"><FiClock size={24} /></div>
        </div>
      </div>

      <div className="promo-toolbar">
        <div className="promo-search">
          <FiSearch className="icon" />
          <input
            type="text"
            placeholder="ค้นหารหัสโปรฯ / รายละเอียด..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          className="promo-select"
          value={statusFilter}
          onChange={(e) => selectStatus(e.target.value)}
        >
          <option value="all">ทุกสถานะ</option>
          <option value="active">เปิดใช้งาน</option>
          <option value="inactive">ปิดใช้งาน</option>
        </Select>

        {(search || statusFilter !== "all") && (
          <button
            className="promo-clear-btn"
            onClick={() => { setSearch(""); setStatusFilter("all"); setPage(1); }}
          >
            ล้างตัวกรอง ✕
          </button>
        )}

        <span className="promo-result-count">พบ {filteredPromotions.length} รายการ</span>
      </div>

      {loading ? (
        <div className="promo-empty">กำลังโหลดข้อมูลโปรโมชั่น...</div>
      ) : currentPagePromotions.length === 0 ? (
        <div className="promo-empty">ไม่พบโปรโมชั่นที่ตรงกับเงื่อนไข</div>
      ) : (
        <>
          <div className="promo-list">
            <div className="promo-list-head">
              <span>ส่วนลด</span>
              <span>โปรโมชั่น</span>
              <span className="promo-h-code">รหัสโปรฯ</span>
              <span>ช่วงเวลา</span>
              <span className="promo-col-c">สิทธิ์</span>
              <span className="promo-col-c">สถานะ</span>
              <span className="promo-col-c">เปิด / ปิด</span>
              <span className="promo-col-c">จัดการ</span>
            </div>

            {currentPagePromotions.map((p) => {
              const isActive = Number(p.is_active) === 1;
              const discount = Number(p.PER_ITEM || 0);
              const created = String(p.created_at || "").slice(0, 10);
              const status = p.status || (isActive ? "active" : "off");
              const startText = formatDateTime(p.start_at);
              const endText = formatDateTime(p.end_at);
              const used = Number(p.used_count || 0);
              const limit = p.usage_limit === null || p.usage_limit === undefined
                ? null : Number(p.usage_limit);
              const quotaPct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;

              return (
                <article
                  key={p.idPromotion}
                  className={`promo-row ${isActive ? "" : "is-off"}`}
                >
                  <div className="promo-row-tile">
                    <span className="promo-cell-label">ส่วนลด</span>
                    <span className="promo-tile-num">{discount}</span>
                    <span className="promo-tile-unit">%</span>
                  </div>

                  <div className="promo-row-main">
                    <h3 className="promo-row-name">{p.Promotion_details}</h3>
                    <p className="promo-row-sub">
                      #{p.idPromotion}{created ? ` · สร้างเมื่อ ${created}` : ""}
                    </p>
                  </div>

                  <div className="promo-row-code">
                    <span className="promo-cell-label">รหัสโปรฯ</span>
                    <span className="promo-code-chip">{p.promo_code}</span>
                  </div>

                  <div className="promo-row-period">
                    <span className="promo-cell-label">ช่วงเวลา</span>
                    {startText || endText ? (
                      <span className="promo-period-text">
                        {startText ? `เริ่ม ${startText}` : "เริ่มได้ทันที"}
                        <i>{endText ? `ถึง ${endText}` : "ไม่มีวันหมด"}</i>
                      </span>
                    ) : (
                      <span className="promo-period-text muted">ไม่จำกัดเวลา</span>
                    )}
                  </div>

                  <div className="promo-row-quota">
                    <span className="promo-cell-label">สิทธิ์</span>
                    {limit === null ? (
                      <span className="promo-quota-text muted">ใช้แล้ว {used} · ไม่จำกัด</span>
                    ) : (
                      <>
                        <span className={`promo-quota-text ${used >= limit ? "full" : ""}`}>
                          {used} / {limit} สิทธิ์
                        </span>
                        <span className="promo-quota-bar">
                          <i style={{ width: `${quotaPct}%` }} />
                        </span>
                      </>
                    )}
                  </div>

                  <div className="promo-row-status">
                    <span className={`promo-badge badge-${status}`}>
                      <i className={`promo-dot ${
                        status === "active" ? "dot-green"
                          : status === "scheduled" ? "dot-blue"
                            : status === "off" ? "dot-orange"
                              : "dot-gray"
                      }`} />
                      {STATUS_LABEL[status] || (isActive ? "เปิดใช้งาน" : "ปิดใช้งาน")}
                    </span>
                  </div>

                  <div className="promo-row-toggle">
                    <span className="promo-cell-label">เปิด / ปิด</span>
                    <label
                      className="promo-ios-switch"
                      title={
                        status === "expired" ? "หมดเวลาแล้ว — แก้เวลาสิ้นสุดก่อนจึงจะเปิดได้"
                          : status === "used_up" ? "สิทธิ์ถูกใช้ครบแล้ว — เพิ่มจำนวนสิทธิ์ก่อนจึงจะเปิดได้"
                            : undefined
                      }
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        disabled={status === "expired" || status === "used_up"}
                        onChange={() => handleToggleActive(p)}
                      />
                      <span className="promo-ios-slider"></span>
                    </label>
                  </div>

                  <div className="promo-row-actions">
                    <button
                      className="promo-icon-btn edit"
                      onClick={() => openEditModal(p)}
                      title="แก้ไข"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="promo-icon-btn del"
                      onClick={() => handleDelete(p.idPromotion)}
                      title="ลบ"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="promo-pagination">
              <button
                className="promo-page-btn"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <FiChevronLeft /> ก่อนหน้า
              </button>

              <div className="promo-page-dots">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className={`promo-page-dot ${n === page ? "active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                className="promo-page-btn"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                ถัดไป <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <div className="promo-modal-overlay" onClick={closeModal}>
          <div
            className="promo-modal-card promo-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">
              {editingPromo ? "แก้ไขโปรโมชั่น" : "เพิ่มโปรโมชั่นใหม่"}
            </h2>

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

              <div className="field">
                <div className="promo-label-row">
                  <label>เริ่มใช้ได้</label>
                  {form.start_at && (
                    <button type="button" className="promo-field-clear" onClick={() => clearField("start_at")}>
                      ล้าง
                    </button>
                  )}
                </div>
                <input
                  type="datetime-local"
                  name="start_at"
                  value={form.start_at}
                  onChange={handleFormChange}
                />
              </div>

              <div className="field">
                <div className="promo-label-row">
                  <label>สิ้นสุด</label>
                  {form.end_at && (
                    <button type="button" className="promo-field-clear" onClick={() => clearField("end_at")}>
                      ล้าง
                    </button>
                  )}
                </div>
                <input
                  type="datetime-local"
                  name="end_at"
                  value={form.end_at}
                  onChange={handleFormChange}
                />
                
              </div>

              <div className="field full">
                <label>จำนวนสิทธิ์ทั้งหมด</label>
                <input
                  type="number"
                  name="usage_limit"
                  min="0"
                  placeholder="เว้นว่าง = ไม่จำกัดสิทธิ์"
                  value={form.usage_limit}
                  onChange={handleFormChange}
                />
                <small className="promo-field-hint">
                 
                  {editingPromo && ` (ตอนนี้ใช้ไปแล้ว ${Number(editingPromo.used_count || 0)} สิทธิ์)`}
                </small>
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
