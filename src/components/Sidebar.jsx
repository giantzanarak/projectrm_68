// src/components/Sidebar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  FiGrid,
  FiBox,
  FiShoppingCart,
  FiTag,
  FiUsers,
  FiChevronDown,
  FiFileText
} from "react-icons/fi";

import { BiCalculator } from "react-icons/bi"; // ← ใช้แทน FiCalculator ที่ไม่มีอยู่จริง

import "../styles/sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const [openEmployee, setOpenEmployee] = useState(true);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">

      {/* TOP */}
      <div className="sidebar-top">

        <ul className="menu">

          {/* หน้าแรก */}
          <li className={isActive("/") ? "active" : ""}>
            <Link to="/">
              <FiGrid className="icon" />
              หน้าแรก
            </Link>
          </li>

          {/* ผลิตภัณฑ์ */}
          <li className={isActive("/products") ? "active" : ""}>
            <Link to="/products">
              <FiBox className="icon" />
              ผลิตภัณฑ์
            </Link>
          </li>

          {/* จัดซื้อ */}
          <li className={isActive("/orders") ? "active" : ""}>
            <Link to="/orders">
              <FiShoppingCart className="icon" />
              การสั่งซื้อของ
            </Link>
          </li>

          {/* โปรโมชั่น */}
          <li className={isActive("/promotions") ? "active" : ""}>
            <Link to="/promotions">
              <FiTag className="icon" />
              โปรโมชั่น
            </Link>
          </li>

          {/* คำนวณผ้า */}
          <li className={isActive("/fabriccalc") ? "active" : ""}>
            <Link to="/fabriccalc">
              <BiCalculator className="icon" />
              คำนวณผ้า
            </Link>
          </li>

          {/* พนักงาน */}
          <li
            className="parent"
            onClick={() => setOpenEmployee(!openEmployee)}
          >
            <div className="parent-row">
              <FiUsers className="icon" />
              รายการ
              <FiChevronDown className={`chevron ${openEmployee ? "rotate" : ""}`} />
            </div>
          </li>

          {/* SUBMENU */}
          {openEmployee && (
            <div className="submenu">

              <Link
                to="/salesrecord"
                className={isActive("/salesrecord") ? "sub-active" : ""}
              >
                บันทึกการขาย
              </Link>

              <Link
                to="/checkorders"
                className={isActive("/checkorders") ? "sub-active" : ""}
              >
                ตรวจสอบคำสั่งซื้อ
              </Link>

            </div>
          )}

          {/* Logs */}
          <li className={isActive("/logs") ? "active" : ""}>
            <Link to="/logs">
              <FiFileText className="icon" />
              บันทึก
            </Link>
          </li>

        </ul>
      </div>

      {/* LOGOUT BUTTON */}
      <button className="logout-btn">ออกจากระบบ</button>

    </div>
  );
}