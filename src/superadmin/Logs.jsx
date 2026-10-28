import { useState, useEffect } from "react";
import {
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
} from "react-icons/fi";
import { getActivityLogs } from "../api/activityLog";
import "../styles/fabric.css";
import "../styles/logs.css";
import Select from "../components/Select";

/* value = รหัส module ที่เก็บในฐานข้อมูล (คั่น comma ได้ เพราะข้อมูลเก่าใช้ชื่อต่างกัน) */
const MODULE_OPTIONS = [
  { value: "all",         label: "ทุกส่วนของระบบ" },
  { value: "users,login", label: "ผู้ใช้งาน" },
  { value: "products",    label: "ผลิตภัณฑ์" },
  { value: "sales,orders", label: "การขาย" },
  { value: "stock",       label: "คลังสินค้า" },
  { value: "promotion",   label: "โปรโมชั่น" },
  { value: "settings",    label: "ตั้งค่าระบบ" },
  { value: "reports",     label: "รายงาน" },
];

const MODULE_TH = {
  users: "ผู้ใช้งาน",
  login: "ผู้ใช้งาน",
  products: "ผลิตภัณฑ์",
  sales: "การขาย",
  orders: "การขาย",
  stock: "คลังสินค้า",
  promotion: "โปรโมชั่น",
  settings: "ตั้งค่าระบบ",
  reports: "รายงาน",
  other: "อื่น ๆ",
};

const ACTION_TH = {
  login: "เข้าสู่ระบบ",
  login_success: "เข้าสู่ระบบ",
  logout: "ออกจากระบบ",
  print: "สั่งพิมพ์",
  register: "สมัครสมาชิก",
  create: "เพิ่มข้อมูล",
  update: "แก้ไขข้อมูล",
  update_status: "เปลี่ยนสถานะ",
  delete: "ลบข้อมูล",
  toggle: "เปิด/ปิดใช้งาน",
  settle: "ชำระยอดคงเหลือ",
  link_bill: "ผูกบิล",
  receive: "ตรวจรับสินค้า",
  upload_photo: "อัปโหลดรูป",
  commit: "ตัดสต๊อกผ้า",
  quote: "บันทึกใบเสนอราคา",
  use: "ใช้ผลคำนวณ",
  create_bill: "บันทึกการขาย",
  receive_fabric: "รับผ้าเข้าสต๊อก",
};

const ROLE_TH = { admin: "ผู้ดูแลระบบ", superadmin: "ผู้ดูแลระบบ", staff: "พนักงานขาย" };

const PAGE_SIZE = 10;

const StatusBadge = ({ status }) => {
  const map = {
    success: { cls: "log-badge-success", label: "สำเร็จ" },
    warning: { cls: "log-badge-warning", label: "คำเตือน" },
    error:   { cls: "log-badge-error",   label: "ข้อผิดพลาด" },
  };
  const s = map[status] || { cls: "", label: status || "-" };
  return <span className={`log-status-badge ${s.cls}`}>{s.label}</span>;
};

/* เลขหน้าที่จะแสดง: หน้าแรก หน้าสุดท้าย และรอบ ๆ หน้าปัจจุบัน (log มีได้หลายร้อยหน้า) */
const pageWindow = (page, totalPages) => {
  const pages = new Set([1, totalPages]);
  for (let p = page - 2; p <= page + 2; p++) if (p >= 1 && p <= totalPages) pages.add(p);
  return [...pages].sort((a, b) => a - b);
};

export default function Logs() {
  const [searchTerm, setSearchTerm]     = useState("");
  const [query, setQuery]               = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [fromDate, setFromDate]         = useState("");
  const [toDate, setToDate]             = useState("");
  const [page, setPage]                 = useState(1);

  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [summary, setSummary] = useState({ total: 0, success: 0, warning: 0, error: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  /* หน่วงการค้นหา 300ms ไม่ให้ยิง API ทุกครั้งที่พิมพ์ 1 ตัว */
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getActivityLogs({
      q: query || undefined,
      module: moduleFilter,
      from: fromDate || undefined,
      to: toDate || undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((data) => {
        if (cancelled) return;
        setRows(data.rows || []);
        setTotal(data.total || 0);
        setSummary(data.summary || { total: 0, success: 0, warning: 0, error: 0 });
      })
      .catch(() => {
        if (!cancelled) setError("โหลดข้อมูลบันทึกไม่สำเร็จ กรุณาตรวจสอบว่า server ทำงานอยู่");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [query, moduleFilter, fromDate, toDate, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="fabric-container">

      <div className="fabric-header">
        <div className="header-left">
          <h2 className="fabric-title">บันทึก</h2>
          <p className="fabric-subtitle">
            ติดตามการใช้งานและกิจกรรมในระบบ
          </p>
        </div>
      </div>

      <div className="summary-container-logs">

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">กิจกรรมทั้งหมด</span>
            <h2 className="card-value">{summary.total.toLocaleString()}</h2>
          </div>
          <div className="card-icon-box bg-gray-light">
            <FiFileText size={24} />
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">สำเร็จ</span>
            <h2 className="card-value">{summary.success.toLocaleString()}</h2>
          </div>
          <div className="card-icon-box bg-gray-light">
            <FiCheckCircle size={24} />
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">คำเตือน</span>
            <h2 className="card-value">{summary.warning.toLocaleString()}</h2>
          </div>
          <div className="card-icon-box bg-gray-light">
            <FiAlertTriangle size={24} />
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">ข้อผิดพลาด</span>
            <h2 className="card-value">{summary.error.toLocaleString()}</h2>
          </div>
          <div className="card-icon-box bg-gray-light">
            <FiXCircle size={24} />
          </div>
        </div>

      </div>

      <div className="fabric-filter-section">

        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="ค้นหากิจกรรม (ผู้ใช้, การกระทำ, รายละเอียด)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          className="filter-select"
          value={moduleFilter}
          onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
        >
          {MODULE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>

        <div className="date-wrapper">
          <input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            title="ตั้งแต่วันที่"
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
          />
        </div>

        <div className="date-wrapper">
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            title="ถึงวันที่"
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
          />
        </div>

        <span className="log-result-count">พบ {total.toLocaleString()} รายการ</span>

      </div>

      <div className="fabric-table-container">
        <table className="fabric-main-table log-table">
          <thead>
            <tr>
              <th>วันที่/เวลา</th>
              <th>ผู้ใช้งาน</th>
              <th>บทบาท</th>
              <th>การกระทำ</th>
              <th>ส่วนของระบบ</th>
              <th>รายละเอียด</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {loading || error || rows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  {loading
                    ? "กำลังโหลดข้อมูล..."
                    : error || "ไม่พบข้อมูลกิจกรรมตามเงื่อนไขที่เลือก"}
                </td>
              </tr>
            ) : (
              rows.map((log) => {
                const role = ROLE_TH[String(log.user_role || "").toLowerCase()] || log.user_role || "-";
                return (
                  <tr key={log.id} className={log.status === "error" ? "log-row-error" : log.status === "warning" ? "log-row-warning" : ""}>
                    <td className="log-datetime">{log.created_at}</td>
                    <td className="log-user">{log.user_name || "ไม่ระบุผู้ใช้"}</td>
                    <td>
                      {log.user_role ? (
                        <span className={`log-role-badge ${role === "ผู้ดูแลระบบ" ? "role-admin" : "role-staff"}`}>
                          {role}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="log-action">{ACTION_TH[log.action] || log.action}</td>
                    <td>
                      <span className="log-module-badge">{MODULE_TH[log.module] || log.module}</span>
                    </td>
                    <td className="log-detail">{log.detail || "-"}</td>
                    <td>
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="table-pagination">
            <span>หน้า {page} / {totalPages}</span>
            <div className="pagination-btns">
              <button
                className="page-nav"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹
              </button>
              {pageWindow(page, totalPages).map((n, i, arr) => (
                <span key={n} style={{ display: "contents" }}>
                  {i > 0 && n - arr[i - 1] > 1 && <span className="page-gap">…</span>}
                  <button
                    className={`page-num ${page === n ? "active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                </span>
              ))}
              <button
                className="page-nav"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
