import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  baht,
  getBills, getBillDetails, getPayments,
  cancelBill,
} from "../api/billApi";
import { getTailoringOrders } from "../api/fetch_api_admin";
import { FiTrendingUp, FiFileText, FiDollarSign, FiCreditCard } from "react-icons/fi";
import "../css/CheckOrders.css";
import Select from "../components/Select";

const swalTheme = {
  popup: "pos-swal-popup",
  confirmButton: "pos-swal-confirm",
  cancelButton: "pos-swal-cancel",
};
const swalDanger = { ...swalTheme, confirmButton: "pos-swal-danger" };

const PAGE_SIZE = 10;
const dayKey = (d) => {
  const dt = new Date(d);
  if (!d || Number.isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

const formatDateTime = (d) => {
  const dt = new Date(d);
  if (!d || Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("th-TH", {
    day: "2-digit", month: "short", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

export default function CheckOrders() {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [details, setDetails] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tailoringOrders, setTailoringOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [b, d, p, tOrders] = await Promise.all([
        getBills(), getBillDetails(), getPayments(),
        getTailoringOrders().catch(() => []),
      ]);
      setBills(b);
      setDetails(d);
      setPayments(p);
      setTailoringOrders(tOrders);
    } catch {
      Swal.fire({
        icon: "error", title: "โหลดข้อมูลไม่สำเร็จ",
        text: "เชื่อมต่อระบบไม่ได้ ตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่",
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
    } finally {
      setLoading(false);
    }
  };

  const payName = (id) =>
    payments.find((p) => String(p.id_payment) === String(id))?.Payment_type || "—";

  const openOrder = (idBill) => navigate(`/staff/order/${idBill}`);

  const linesOf = (idBill) =>
    details.filter((d) => String(d.Bill_idBill) === String(idBill));

  const itemCountOf = (idBill) =>
    linesOf(idBill).reduce((s, d) => s + (Number(d.quantity) || 0), 0);

  const tailoringOf = (idBill) =>
    tailoringOrders.filter((t) => String(t.bill_id) === String(idBill));

  const tailoringMoneyOf = (b) => {
    const list = tailoringOf(b.idBill);
    if (list.length === 0) return null;
    const sum = (key) => list.reduce((s, t) => s + (Number(t[key]) || 0), 0);
    const billed = Number(b.totalAmount) || 0;
    const full = billed - sum("deposit") + sum("pieces_total") + sum("alterations_total");
    const paid = billed + sum("final_paid_amount");
    return { full, paid, outstanding: Math.max(0, full - paid) };
  };

  const today = dayKey(new Date());
  const stats = useMemo(() => {
    const todayBills = bills.filter((b) => dayKey(b.created_at) === today);
    const sum = (arr) => arr.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
    return {
      todayCount: todayBills.length,
      todaySales: sum(todayBills),
      allCount: bills.length,
      allSales: sum(bills),
    };
  }, [bills, today]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return bills
      .filter((b) => {
        const matchSearch = !term
          || String(b.Bill_details || "").toLowerCase().includes(term)
          || String(b.notes || "").toLowerCase().includes(term)
          || String(b.customer_name || "").toLowerCase().includes(term)
          || String(b.customer_phone || "").replace(/\D/g, "").includes(term.replace(/\D/g, "") || " ")
          || String(b.idBill).includes(term);
        const matchPay = payFilter === "all" || String(b.Payment_idPayment) === payFilter;
        const matchDate = !dateFilter || dayKey(b.created_at) === dateFilter;
        return matchSearch && matchPay && matchDate;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [bills, search, payFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filteredSales = filtered.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);

  const payBreakdown = useMemo(() => {
    const rows = payments.map((p) => {
      const list = bills.filter((b) => String(b.Payment_idPayment) === String(p.id_payment));
      return {
        id: p.id_payment,
        name: p.Payment_type,
        count: list.length,
        total: list.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0),
        isCash: /เงินสด/.test(p.Payment_type || ""),
      };
    });
    const known = new Set(payments.map((p) => String(p.id_payment)));
    const others = bills.filter((b) => !known.has(String(b.Payment_idPayment)));
    if (others.length) {
      rows.push({
        id: "other", name: "อื่น ๆ / ไม่ระบุ", count: others.length,
        total: others.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0), isCash: false,
      });
    }
    return rows.filter((r) => r.count > 0);
  }, [bills, payments]);

  const resetFilters = () => { setSearch(""); setPayFilter("all"); setDateFilter(""); setPage(1); };

  const handleCancel = async (b) => {
    const ok = await Swal.fire({
      icon: "warning",
      title: "ยกเลิกบิลนี้?",
      html: `<b>${b.Bill_details}</b> · ${baht(b.totalAmount)}<br/>บิลจะถูกตัดออกจากรายการ (ข้อมูลยังอยู่ในระบบ)`,
      showCancelButton: true, confirmButtonText: "ยกเลิกบิล", cancelButtonText: "ไม่",
      reverseButtons: true, buttonsStyling: false, customClass: swalDanger,
    });
    if (!ok.isConfirmed) return;

    try {
      await cancelBill(b.idBill);
      setBills((prev) => prev.filter((x) => x.idBill !== b.idBill));
      Swal.fire({
        icon: "success", title: "ยกเลิกบิลแล้ว",
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
    } catch (err) {
      Swal.fire({
        icon: "error", title: "ยกเลิกไม่สำเร็จ",
        text: err?.response?.data?.message || "เกิดข้อผิดพลาด",
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
      loadAll();
    }
  };

  return (
    <div className="pos-root"> 
      <header className="pos-top">
        <div>
          <h1 className="pos-title">ประวัติการขาย</h1>
          
        </div>
        <button className="pos-btn-save pos-btn-inline" onClick={() => navigate("/staff/neworder")}>
          + สร้างบิลใหม่
        </button>
      </header>

      <div className="summary-container">
        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">ยอดขายวันนี้</span>
            <h2 className="card-value">{baht(stats.todaySales)}</h2>
            <span className="card-note">
              {stats.todayCount} บิล · {new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
            </span>
          </div>
          <div className="card-icon-box bg-gray-light"><FiTrendingUp size={24} /></div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">ยอดขายรวมทั้งหมด</span>
            <h2 className="card-value">{baht(stats.allSales)}</h2>
            <span className="card-note">{stats.allCount} บิล</span>
          </div>
          <div className="card-icon-box bg-gray-light"><FiFileText size={24} /></div>
        </div>

        {payBreakdown.map((r) => (
          <div className="summary-card" key={r.id}>
            <div className="card-content">
              <span className="card-label">
                {r.isCash ? "เงินสด" : r.name.replace("โอนผ่านธนาคาร", "โอนเงิน")}
              </span>
              <h2 className="card-value">{baht(r.total)}</h2>
              <span className="card-note">{r.count} บิล</span>
            </div>
            <div className="card-icon-box bg-gray-light">
              {r.isCash ? <FiDollarSign size={24} /> : <FiCreditCard size={24} />}
            </div>
          </div>
        ))}
      </div>

      <div className="pos-filters pos-filters-bar">
        <div className="pos-search">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input placeholder="ค้นหาเลขบิล / ชื่อลูกค้า / เบอร์โทร..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>

        <Select value={payFilter} onChange={(e) => { setPayFilter(e.target.value); setPage(1); }}>
          <option value="all">ทุกวิธีชำระ</option>
          {payments.map((p) => (
            <option key={p.id_payment} value={p.id_payment}>{p.Payment_type}</option>
          ))}
        </Select>

        <input type="date" value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} />

        {(search || payFilter !== "all" || dateFilter) && (
          <button className="pos-clear" onClick={resetFilters}>ล้างตัวกรอง ✕</button>
        )}

        <span className="pos-count">
          {filtered.length} บิล · {baht(filteredSales)}
        </span>
      </div>

      {loading ? (
        <p className="pos-empty">กำลังโหลดบิล...</p>
      ) : pageItems.length === 0 ? (
        <p className="pos-empty">ไม่พบบิลที่ตรงกับเงื่อนไข</p>
      ) : (
        <div className="pos-list">
          <div className="pos-list-head">
            <span>เลขบิล</span>
            <span>ลูกค้า</span>
            <span>วันเวลา</span>
            <span>วิธีชำระ</span>
            <span className="pos-c">จำนวน</span>
            <span className="pos-r">ส่วนลด</span>
            <span className="pos-r">ยอดชำระแล้ว</span>
            <span className="pos-c">จัดการ</span>
          </div>

          {pageItems.map((b) => {
            const tMoney = tailoringMoneyOf(b);
            return (
              <article className="pos-row" key={b.idBill}>
                <span className="pos-row-no" onClick={() => openOrder(b.idBill)}>{b.Bill_details}</span>
                <span className="pos-row-cust">
                  {b.customer_name || b.customer_phone
                    ? <>{b.customer_name || "—"}{b.customer_phone && <i>{b.customer_phone}</i>}</>
                    : <em>ไม่ระบุ</em>}
                </span>
                <span className="pos-row-date">{formatDateTime(b.created_at)}</span>
                <span className="pos-row-pay">{payName(b.Payment_idPayment)}</span>
                <span className="pos-c pos-row-items">
                  {itemCountOf(b.idBill)} ชิ้น
                  {tailoringOf(b.idBill).length > 0 && (
                    <i className="pos-row-tailoring-badge">+{tailoringOf(b.idBill).length} ใบสั่งตัด</i>
                  )}
                </span>
                <span className="pos-r pos-row-disc">
                  {Number(b.discount_amount) > 0
                    ? `− ${baht(b.discount_amount)}`
                    : <span className="pos-row-none">—</span>}
                </span>
                <span className="pos-r pos-row-total">
                  <span className="pos-row-total-amt">{baht(tMoney ? tMoney.paid : b.totalAmount)}</span>
                  {tMoney && (
                    <i className="pos-row-total-note">
                      <span>ราคาเต็ม {baht(tMoney.full)}</span>
                      {tMoney.outstanding > 0
                        ? <b>ค้างชำระ {baht(tMoney.outstanding)}</b>
                        : <b className="paid">ชำระครบแล้ว</b>}
                    </i>
                  )}
                </span>
                <span className="pos-c pos-row-act">
                  <button className="pos-icon" title="ดูรายละเอียด" onClick={() => openOrder(b.idBill)}>
                    <svg viewBox="0 0 20 20" width="15" height="15" fill="none">
                      <ellipse cx="10" cy="10" rx="8" ry="5" stroke="currentColor" strokeWidth="1.6" />
                      <circle cx="10" cy="10" r="2.5" fill="currentColor" />
                    </svg>
                  </button>
                  <button className="pos-icon del" title="ยกเลิกบิล" onClick={() => handleCancel(b)}>
                    <svg viewBox="0 0 20 20" width="15" height="15" fill="none">
                      <path d="M5 7h10l-1 9H6L5 7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      <path d="M3 7h14M8 7V5h4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pos-pager">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹ ก่อนหน้า</button>
          <div className="pos-dots">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={n === page ? "active" : ""} onClick={() => setPage(n)}>{n}</button>
            ))}
          </div>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>ถัดไป ›</button>
        </div>
      )}

    </div>
  );
}
