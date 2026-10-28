import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/TailoringOrders.css";
import {
  getTailoringOrders, settleTailoringOrder, deleteTailoringOrder,
} from "../api/fetch_api_admin";
import { ORDER_STATUSES, PAYMENT_METHODS, formatDateInput } from "./AddTailoringOrders";
import { useDialog } from "../context/DialogContext";
import {
  FiPlus, FiSearch, FiChevronLeft, FiChevronRight, FiPrinter, FiEye, FiEdit2, FiTrash2,
  FiImage, FiX,
} from "react-icons/fi";
import { API_BASE } from "../api/http";
import Select from "../components/Select";

const PAGE_SIZE = 10;
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const formatDateTH = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const dayDiff = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - TODAY) / 86400000);
};

const isOverdue = (deadlineStr, status) => {
  if (!deadlineStr || status === "เสร็จแล้ว") return false;
  const diff = dayDiff(deadlineStr);
  return diff !== null && diff < 0;
};

function overallStatus(items) {
  const list = (items || []).map((it) => it.status).filter(Boolean);
  if (!list.length) return "-";
  const uniq = [...new Set(list)];
  if (uniq.length === 1) return uniq[0];
  const pending = uniq.filter((s) => s !== "เสร็จแล้ว");
  return pending.length === 1 ? pending[0] : `${pending.length} สถานะ`;
}

const StatusBadge = ({ status }) => {
  const classMap = {
    วัดตัว: "badge-measure",
    กำลังตัด: "badge-cutting",
    รอลองชุด: "badge-fitting",
    รอแก้ไข: "badge-fix",
    เสร็จแล้ว: "badge-done",
  };
  return <span className={`status-badge ${classMap[status] || "badge-default"}`}>{status}</span>;
};

const baht = (n) => `฿${(Number(n) || 0).toLocaleString("th-TH")}`;

const TailoringOrders = () => {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useDialog();

  const [settling, setSettling] = useState(null);
  const [settleMethod, setSettleMethod] = useState(PAYMENT_METHODS[0]);
  const [savingSettle, setSavingSettle] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState("");
  const [viewingSlip, setViewingSlip] = useState(null);

  const openSettle = (row) => {
    setSettling(row);
    setSettleMethod(PAYMENT_METHODS[0]);
    clearSlip();
  };

  const clearSlip = () => {
    setSlipPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return ""; });
    setSlipFile(null);
  };

  const closeSettle = () => { setSettling(null); clearSlip(); };

  const pickSlip = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    clearSlip();
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const dbOrders = await getTailoringOrders();
      setOrders(dbOrders);
    } catch (err) {
      console.error("โหลดคิวตัดชุดไม่สำเร็จ:", err);
      setOrders([]);
      setLoadError(err?.response?.data?.message || err?.message || "โหลดคิวตัดชุดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(
    () =>
      orders.map((o) => {
        const total = (Number(o.pieces_total) || 0) + (Number(o.alterations_total) || 0);
        const paid = (Number(o.deposit) || 0) + (Number(o.final_paid_amount) || 0);
        const outstanding = Math.max(0, total - paid);
        const pickup = o.pickup_date || o.deadline;
        const today = formatDateInput();
        return {
          orderId: o.order_id,
          orderCode: o.order_code,
          billNo: o.bill_no,
          customerName: o.customer_name || "-",
          customerPhone: o.customer_phone || "-",
          status: overallStatus(o.items),
          pieceCount: (o.items || []).length,
          nextApptDate: o.next_appointment_date || null,
          nextApptTime: o.next_appointment_time || "",
          nextApptPurpose: o.next_appointment_purpose || "",
          deadline: o.deadline,
          billId: o.bill_id,
          total,
          deposit: Number(o.deposit) || 0,
          outstanding,
          isSettled: outstanding <= 0,
          pickupDate: pickup,
          slip: o.final_payment_slip || null,
          paidAt: o.final_paid_at || null,
          paidMethod: o.final_payment_method || "",
          dueForPayment: outstanding > 0 && !!pickup && pickup <= today,
        };
      }),
    [orders]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((o) => {
      const matchSearch =
        !term ||
        o.customerName.toLowerCase().includes(term) ||
        o.orderCode.toLowerCase().includes(term) ||
        String(o.billNo || "").toLowerCase().includes(term) ||
        o.customerPhone.replace(/\D/g, "").includes(term.replace(/\D/g, "") || " ");
      const matchStatus = statusFilter === "ทั้งหมด" || o.status === statusFilter;
      const matchFrom = !dateFrom || (o.nextApptDate && o.nextApptDate >= dateFrom);
      const matchTo = !dateTo || (o.nextApptDate && o.nextApptDate <= dateTo);
      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [rows, search, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetFilters = () => {
    setSearch(""); setStatusFilter("ทั้งหมด"); setDateFrom(""); setDateTo(""); setPage(1);
  };

  const confirmSettle = async () => {
    if (!settling) return;

    if (!slipFile && /โอน/.test(settleMethod)) {
      const ok = await showConfirm(
        "ยังไม่ได้แนบรูปสลิปการโอน ต้องการบันทึกโดยไม่มีหลักฐานหรือไม่?",
        { title: "ไม่มีหลักฐานการชำระเงิน", confirmText: "บันทึกเลย", cancelText: "กลับไปแนบรูป" }
      );
      if (!ok) return;
    }

    try {
      setSavingSettle(true);
      await settleTailoringOrder(settling.orderId, {
        amount: settling.outstanding,
        paymentMethod: settleMethod,
        slipFile,
      });
      closeSettle();
      await loadOrders();
      await showAlert(`รับชำระ ${baht(settling.outstanding)} เรียบร้อยแล้ว`);
    } catch (err) {
      await showAlert(err?.response?.data?.message || "บันทึกการรับชำระไม่สำเร็จ");
    } finally {
      setSavingSettle(false);
    }
  };

  const handleDelete = async (row) => {
    const ok = await showConfirm(
      `ต้องการลบใบสั่งตัด ${row.orderCode} ของ ${row.customerName} ใช่หรือไม่?`,
      { title: "ยืนยันการลบ", confirmText: "ลบ", cancelText: "ยกเลิก" }
    );
    if (!ok) return;
    try {
      await deleteTailoringOrder(row.orderId);
      setOrders((prev) => prev.filter((o) => o.order_id !== row.orderId));
      await showAlert("ลบใบสั่งตัดแล้ว");
    } catch (err) {
      await showAlert(err?.response?.data?.message || "ลบไม่สำเร็จ");
      loadOrders();
    }
  };

  const handleView = (row) => navigate(`/Order/detail/${row.orderCode}`);

  return (
    <div className="to-page-container">
      <div className="to-header">
        <div className="to-header-info">
          <h1>คิวตัดชุด</h1>
          <p>งานตัดทั้งหมดเรียงจากใหม่ไปเก่า ติดตามวันนัดและกำหนดส่งได้ที่นี่</p>
        </div>
        <button className="btn-add-order" onClick={() => navigate("/Order/add", { state: { returnTo: "/staff/neworder" } })}>
          <FiPlus size={16} />
          สร้างคำสั่งตัดชุด
        </button>
      </div>

      <div className="to-filter-bar">
        <div className="to-search-wrapper">
          <FiSearch className="to-search-icon" />
          <input
            type="text"
            placeholder="เลขออเดอร์ / เลขบิล / ชื่อลูกค้า / เบอร์โทร"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <span className="filter-label">วันนัดถัดไป</span>
        <input
          type="date"
          className="to-date-input"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
        />
        <span className="date-sep">–</span>
        <input
          type="date"
          className="to-date-input"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
        />

        <Select
          className="to-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          {["ทั้งหมด", ...ORDER_STATUSES].map((s) => (
            <option key={s} value={s}>{s === "ทั้งหมด" ? "สถานะ: ทั้งหมด" : s}</option>
          ))}
        </Select>

        {(search || statusFilter !== "ทั้งหมด" || dateFrom || dateTo) && (
          <button className="to-clear-btn" onClick={resetFilters}>ล้างตัวกรอง ✕</button>
        )}
      </div>

      <div className="to-table-card">
        <table className="to-table">
          <thead>
            <tr>
              <th>เลขออเดอร์</th>
              <th>เลขบิล</th>
              <th>ลูกค้า</th>
              <th>เบอร์โทร</th>
              <th>สถานะปัจจุบัน</th>
              <th>วันนัดถัดไป</th>
              <th>กำหนดส่ง</th>
              <th className="col-money">ยอดค้างชำระ</th>
              <th className="col-center">พิมพ์</th>
              <th className="col-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="empty-row">กำลังโหลดคิวตัดชุด...</td></tr>
            ) : loadError ? (
              <tr>
                <td colSpan={10} className="empty-row error-row">
                  โหลดคิวตัดชุดไม่สำเร็จ: {loadError}
                  <button type="button" className="btn-retry-load" onClick={loadOrders}>ลองใหม่</button>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={10} className="empty-row">ไม่พบงานตัดที่ตรงกับเงื่อนไข</td></tr>
            ) : (
              paginated.map((order) => {
                const apptDiff = dayDiff(order.nextApptDate);
                const overdue = isOverdue(order.deadline, order.status);
                return (
                  <tr key={order.orderId}>
                    <td>
                      <span
                        className="order-id-link"
                        onClick={() => navigate(`/Order/detail/${order.orderCode}`)}
                      >
                        {order.orderCode}
                      </span>
                      <span className="to-piece-count">{order.pieceCount} ชิ้น</span>
                    </td>
                    <td>
                      {order.billNo
                        ? <span className="to-bill-no">{order.billNo}</span>
                        : <span className="text-sub">ยังไม่ออกบิล</span>}
                    </td>
                    <td className="text-bold">{order.customerName}</td>
                    <td className="text-sub">{order.customerPhone}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>
                      {order.nextApptDate ? (
                        <>
                          {formatDateTH(order.nextApptDate)}
                          {order.nextApptTime && <b className="to-appt-time"> {order.nextApptTime} น.</b>}
                          {order.nextApptPurpose && (
                            <span className="to-appt-purpose">{order.nextApptPurpose}</span>
                          )}
                          {apptDiff === 0 && <span className="today-tag">วันนี้</span>}
                        </>
                      ) : (
                        <span className="text-sub">ยังไม่มีนัด</span>
                      )}
                    </td>
                    <td className={overdue ? "text-overdue" : ""}>
                      {formatDateTH(order.deadline)}
                      {overdue && <span className="to-overdue-tag">เลยกำหนด</span>}
                    </td>

                    <td className="col-money">
                      {order.isSettled ? (
                        <>
                          <span className="to-paid-tag">ชำระครบแล้ว</span>
                          {order.slip && (
                            <button
                              className="to-slip-link"
                              onClick={() => setViewingSlip(order)}
                              title="ดูหลักฐานการชำระเงิน"
                            >
                              ดูสลิป
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <span className={order.dueForPayment ? "to-owe-due" : "to-owe"}>
                            {baht(order.outstanding)}
                          </span>
                          <button
                            className={`to-btn-collect${order.dueForPayment ? "" : " is-early"}`}
                            onClick={() => openSettle(order)}
                            title={
                              order.dueForPayment
                                ? "ถึงกำหนดรับชุดแล้ว — เก็บส่วนที่เหลือ"
                                : `ยังไม่ถึงกำหนด (${formatDateTH(order.pickupDate)}) แต่เก็บได้ถ้าลูกค้ามารับแล้ว`
                            }
                          >
                            รับชำระ
                          </button>
                          {!order.dueForPayment && (
                            <span className="to-owe-note">
                              นัดรับ {formatDateTH(order.pickupDate)}
                            </span>
                          )}
                        </>
                      )}
                    </td>

                    <td className="col-center">
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/Order/detail/${order.orderCode}?print=1`)}
                        title="พิมพ์ใบสั่งตัด"
                      >
                        <FiPrinter size={17} />
                      </button>
                    </td>

                    <td className="col-center">
                      <div className="action-cell">
                        <button
                          className="btn-icon"
                          onClick={() => handleView(order)}
                          title="ดูใบสั่งตัดของออเดอร์นี้"
                        >
                          <FiEye size={17} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => navigate(`/Order/detail/${order.orderCode}`)}
                          title="แก้ไขงานตัด — ขนาดตัว วันนัด และการแก้ไขแต่ละรอบ"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-icon-danger"
                          onClick={() => handleDelete(order)}
                          title="ลบใบสั่งตัด"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="to-pagination">
        <span className="page-info">
          แสดง {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
          {Math.min(safePage * PAGE_SIZE, filtered.length)} จากทั้งหมด {filtered.length} รายการ
        </span>
        <div className="page-controls">
          <button className="page-btn" disabled={safePage === 1} onClick={() => setPage((p) => p - 1)}>
            <FiChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`page-btn ${safePage === n ? "page-btn--active" : ""}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>

      {settling && (
        <div className="to-settle-overlay" onClick={closeSettle}>
          <div className="to-settle-modal" onClick={(e) => e.stopPropagation()}>
            <h3>รับชำระส่วนที่เหลือ</h3>
            <p className="to-settle-sub">
              {settling.orderCode} · {settling.customerName}
            </p>

            <div className="to-settle-rows">
              <div><span>ค่าตัดรวม (รวมค่าแก้ไข)</span><strong>{baht(settling.total)}</strong></div>
              <div><span>มัดจำที่รับไปแล้ว</span><strong>−{baht(settling.deposit)}</strong></div>
              <div className="total"><span>ต้องเก็บวันนี้</span><strong>{baht(settling.outstanding)}</strong></div>
            </div>

            <label className="to-settle-field">
              <span>วิธีชำระเงิน</span>
              <Select value={settleMethod} onChange={(e) => setSettleMethod(e.target.value)}>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
            </label>

            <div className="to-settle-field">
              <span>
                รูปหลักฐานการชำระเงิน
                {/โอน/.test(settleMethod) ? " (แนบสลิป)" : " (ถ้ามี)"}
              </span>

              {slipPreview ? (
                <div className="to-slip-preview">
                  <img src={slipPreview} alt="สลิปการชำระเงิน" />
                  <button type="button" className="to-slip-remove" onClick={clearSlip}>
                    <FiX size={13} /> เอารูปออก
                  </button>
                </div>
              ) : (
                <label className="to-slip-drop">
                  <FiImage size={20} />
                  <span>กดเพื่อแนบรูปสลิป / ใบเสร็จ</span>
                  <input type="file" accept="image/*" hidden onChange={pickSlip} />
                </label>
              )}
            </div>

            <div className="to-settle-actions">
              <button className="to-settle-cancel" onClick={closeSettle}>
                ยกเลิก
              </button>
              <button className="to-settle-confirm" onClick={confirmSettle} disabled={savingSettle}>
                {savingSettle ? "กำลังบันทึก..." : `รับเงิน ${baht(settling.outstanding)}`}
              </button>
            </div>
          </div>
        </div>
      )}
      {viewingSlip && (
        <div className="to-settle-overlay" onClick={() => setViewingSlip(null)}>
          <div className="to-slip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="to-slip-modal-head">
              <div>
                <h3>หลักฐานการชำระเงิน</h3>
                <p>
                  {viewingSlip.orderCode} · {viewingSlip.paidMethod || "-"}
                  {viewingSlip.paidAt && ` · ${formatDateTH(viewingSlip.paidAt)}`}
                </p>
              </div>
              <button className="quick-create-close" onClick={() => setViewingSlip(null)}>
                <FiX size={18} />
              </button>
            </div>
            <a href={`${API_BASE}${viewingSlip.slip}`} target="_blank" rel="noreferrer">
              <img src={`${API_BASE}${viewingSlip.slip}`} alt="สลิปการชำระเงิน" />
            </a>
            <p className="to-slip-modal-hint">กดที่รูปเพื่อเปิดขนาดเต็ม</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TailoringOrders;
