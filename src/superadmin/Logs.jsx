// src/pages/Logs.jsx
import { useState, useMemo } from "react";
import {
  FiSearch,
  FiFilter,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
} from "react-icons/fi";

import "../styles/orders.css"; // ใช้ layout + table เดิมของหน้า orders

// ตัวเลือก filter
const MODULE_OPTIONS = [
  "ทุกโมดูล",
  "ผลิตภัณฑ์",
  "การขาย",
  "คลังสินค้า",
  "โปรโมชั่น",
  "ผู้ใช้งาน",
  "รายงาน",
];

// ข้อมูล mock สำหรับตารางบันทึกกิจกรรม
const INITIAL_LOGS = [
  {
    id: 1,
    datetime: "2025-11-30 10:30:15",
    user: "นางสาวสมหญิง ใจดี",
    role: "ผู้ดูแลระบบ",
    action: "เพิ่มผลิตภัณฑ์ใหม่",
    module: "ผลิตภัณฑ์",
    detail: "เพิ่มหมอนผ้าไหมลายดอก รหัส P001",
    status: "สำเร็จ",
  },
  {
    id: 2,
    datetime: "2025-11-30 10:25:42",
    user: "นายสมชาย รักงาน",
    role: "พนักงานขาย",
    action: "บันทึกการขาย",
    module: "การขาย",
    detail: "บันทึกคำสั่งซื้อ ORD123 มูลค่า ฿4,500",
    status: "สำเร็จ",
  },
  {
    id: 3,
    datetime: "2025-11-30 10:20:18",
    user: "นางสาวสมหญิง ใจดี",
    role: "ผู้ดูแลระบบ",
    action: "แก้ไขสต๊อก",
    module: "คลังสินค้า",
    detail: "ปรับสต๊อกผ้าไหมสีเขียวมรกต จาก 100 เป็น 85 เมตร",
    status: "คำเตือน",
  },
  {
    id: 4,
    datetime: "2025-11-30 10:15:33",
    user: "นายสมชาย รักงาน",
    role: "พนักงานขาย",
    action: "ค้นหาสินค้า",
    module: "การขาย",
    detail: "ค้นหา: ผ้าไหม",
    status: "สำเร็จ",
  },
  {
    id: 5,
    datetime: "2025-11-30 10:10:55",
    user: "นางสาวสมหญิง ใจดี",
    role: "ผู้ดูแลระบบ",
    action: "เพิ่มโปรโมชั่น",
    module: "โปรโมชั่น",
    detail: "สร้างโปรโมชัน ลด 15% สำหรับผ้าไหม",
    status: "สำเร็จ",
  },
  {
    id: 6,
    datetime: "2025-11-30 10:05:22",
    user: "นางสาววิมล สุขใจ",
    role: "พนักงานขาย",
    action: "ยืนยันคำสั่งซื้อ",
    module: "การขาย",
    detail: "ยืนยันคำสั่งซื้อ ORD122",
    status: "สำเร็จ",
  },
  {
    id: 7,
    datetime: "2025-11-30 09:58:47",
    user: "นางสาวสมหญิง ใจดี",
    role: "ผู้ดูแลระบบ",
    action: "ยกเลิกคำสั่งซื้อ",
    module: "การขาย",
    detail: "ยกเลิกคำสั่งซื้อ ORD099",
    status: "คำเตือน",
  },
  {
    id: 8,
    datetime: "2025-11-30 09:55:10",
    user: "นายสมชาย รักงาน",
    role: "พนักงานขาย",
    action: "ล็อกอินเข้าสู่ระบบ",
    module: "ผู้ใช้งาน",
    detail: "เข้าสู่ระบบสำเร็จจาก IP 192.168.1.10",
    status: "สำเร็จ",
  },
  {
    id: 9,
    datetime: "2025-11-30 09:52:03",
    user: "นางสาวสมหญิง ใจดี",
    role: "ผู้ดูแลระบบ",
    action: "ลบผู้ใช้งาน",
    module: "ผู้ใช้งาน",
    detail: "ลบบัญชี test_user",
    status: "ข้อผิดพลาด",
  },
  {
    id: 10,
    datetime: "2025-11-30 09:50:18",
    user: "นางสาววิมล สุขใจ",
    role: "พนักงานขาย",
    action: "ดูรายงานยอดขาย",
    module: "รายงาน",
    detail: "ดูรายงานยอดขายประจำวัน",
    status: "สำเร็จ",
  },
];

const PAGE_SIZE = 10; // แสดงหน้าละ 10 รายการ

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ทุกโมดูล");
  const [page, setPage] = useState(1);

  const totalLogs = INITIAL_LOGS.length;
  const successCount = INITIAL_LOGS.filter((l) => l.status === "สำเร็จ").length;
  const warnCount = INITIAL_LOGS.filter((l) => l.status === "คำเตือน").length;
  const errorCount = INITIAL_LOGS.filter((l) => l.status === "ข้อผิดพลาด").length;

  // filter logs ตามคำค้น + โมดูล
  const filteredLogs = useMemo(() => {
    return INITIAL_LOGS.filter((log) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        `${log.user} ${log.role} ${log.action} ${log.detail} ${log.id}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchModule =
        moduleFilter === "ทุกโมดูล" || log.module === moduleFilter;

      return matchSearch && matchModule;
    });
  }, [searchTerm, moduleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));

  const paginatedLogs = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLogs, page]);

  const handlePrevPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <div className="orders-page logs-page">
      {/* HEADER */}
      <div className="orders-header-row">
        <div>
          <h1 className="page-title">บันทึก</h1>
          <p className="page-subtitle">ติดตามการใช้งานและกิจกรรมในระบบ</p>
        </div>
      </div>

      {/* SUMMARY CARDS — ใช้ class ของ dashboard */}
      <div className="dash-summary-grid">
        <div className="dash-card">
          <div className="dash-icon purple">
            <FiFileText />
          </div>
          <div>
            <p className="dash-card-title">กิจกรรมทั้งหมด</p>
            <p className="dash-number">{totalLogs}</p>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon green">
            <FiCheckCircle />
          </div>
          <div>
            <p className="dash-card-title">สำเร็จ</p>
            <p className="dash-number">{successCount}</p>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon yellow">
            <FiAlertTriangle />
          </div>
          <div>
            <p className="dash-card-title">คำเตือน</p>
            <p className="dash-number">{warnCount}</p>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon blue">
            <FiXCircle />
          </div>
          <div>
            <p className="dash-card-title">ข้อผิดพลาด</p>
            <p className="dash-number">{errorCount}</p>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER ROW */}
      <div className="logs-filters-row">
        {/* ค้นหากิจกรรม */}
        <div className="logs-search-wrapper">
          <div className="logs-search-input">
            <FiSearch className="logs-search-icon" />
            <input
              type="text"
              placeholder="ค้นหากิจกรรม (ผู้ใช้, การกระทำ, รายละเอียด)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="logs-result-count">
            พบ {filteredLogs.length} รายการ
          </div>
        </div>

        {/* ฟิลเตอร์ โมดูล */}
        <div className="logs-filter-group">
          <div className="logs-filter-select">
            <FiFilter className="logs-filter-icon" />
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
            >
              {MODULE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="orders-table-section logs-table-section">
        <div className="logs-table-card">
          <div className="logs-table-header">
            <span className="sum-title table-title">รายการกิจกรรม</span>
          </div>

          <div className="orders-table logs-table">
            <table>
              <thead>
                <tr>
                  <th>วันที่/เวลา</th>
                  <th>ผู้ใช้งาน</th>
                  <th>บทบาท</th>
                  <th>การกระทำ</th>
                  <th>โมดูล</th>
                  <th>รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.datetime}</td>
                    <td>{log.user}</td>
                    <td>
                      <span className="role-pill">{log.role}</span>
                    </td>
                    <td>{log.action}</td>
                    <td>
                      <span className="module-pill">{log.module}</span>
                    </td>
                    <td className="log-detail-cell">{log.detail}</td>
                  </tr>
                ))}

                {paginatedLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="logs-empty">
                      ไม่พบข้อมูลกิจกรรมตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {filteredLogs.length > PAGE_SIZE && (
            <div
              className="logs-pagination"
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <button
                className="page-btn"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                ก่อนหน้า
              </button>
              <span className="page-info">
                หน้า {page} / {totalPages}
              </span>
              <button
                className="page-btn"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}