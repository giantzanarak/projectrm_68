// src/components/Sidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiShoppingCart,
  FiTag,
  FiFileText,
} from "react-icons/fi";
import { BiCalculator } from "react-icons/bi";

import "../styles/sidebar.css";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role = user?.role || localStorage.getItem("role") || "guest";

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout?.();
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  if (role === "guest") {
    return (
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-guest-hint">
            กรุณาเข้าสู่ระบบเพื่อใช้งานเมนู
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <ul className="menu">
          {/* หน้าแรก */}
          <li className={isActive("/") || isActive("/dashboard") ? "active" : ""}>
            <Link to="/">
              <FiGrid className="icon" />
              แดชบอร์ด
            </Link>
          </li>

          {/* เมนู superadmin */}
          {role === "superadmin" && (
            <>
              <li className={isActive("/products") ? "active" : ""}>
                <Link to="/products">
                  <FiBox className="icon" />
                  ผลิตภัณฑ์
                </Link>
              </li>

              <li className={isActive("/orders") ? "active" : ""}>
                <Link to="/orders">
                  <FiShoppingCart className="icon" />
                  การสั่งซื้อของ
                </Link>
              </li>

              <li className={isActive("/promotions") ? "active" : ""}>
                <Link to="/promotions">
                  <FiTag className="icon" />
                  โปรโมชั่น
                </Link>
              </li>

              <li className={isActive("/fabriccalc") ? "active" : ""}>
                <Link to="/fabriccalc">
                  <BiCalculator className="icon" />
                  คำนวณผ้า
                </Link>
              </li>

              <li className={isActive("/logs") ? "active" : ""}>
                <Link to="/logs">
                  <FiFileText className="icon" />
                  บันทึก
                </Link>
              </li>
            </>
          )}

          {/* เมนู staff+admin */}
          <li className={isActive("/staff/neworder") ? "active" : ""}>
            <Link to="/staff/neworder">
              <FiShoppingCart className="icon" />
              สร้างบิลขาย
            </Link>
          </li>

          <li className={isActive("/staff/search-products") ? "active" : ""}>
            <Link to="/staff/search-products">
              <FiBox className="icon" />
              ค้นหาสินค้า
            </Link>
          </li>

          <li className={isActive("/staff/checkorders") ? "active" : ""}>
            <Link to="/staff/checkorders">
              <FiFileText className="icon" />
              ตรวจสอบคำสั่งซื้อ
            </Link>
          </li>

          <li className={isActive("/staff/sales-report") ? "active" : ""}>
            <Link to="/staff/sales-report">
              <FiFileText className="icon" />
              xxxxxxxx
            </Link>
          </li>
        </ul>

        {/* 🔻 ปุ่มออกจากระบบจะมาติดกับรายงานยอดขายเลย */}
        <button className="logout-btn" onClick={handleLogout}>
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}