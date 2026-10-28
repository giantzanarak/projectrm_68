import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiGrid,
  FiBox,
  FiShoppingCart,
  FiTruck,
  FiGift,
  FiUsers,
  FiFileText,
  FiScissors,
  FiLogOut,
  FiLayers,
  FiCalendar,
  FiDollarSign,
  FiChevronDown,
} from "react-icons/fi";
import { BiCalculator } from "react-icons/bi";
import { logLogout } from "../api/activityLog";

import "../styles/sidebar.css";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role = user?.role || localStorage.getItem("role") || "guest";

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logLogout();
    logout?.();
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  const CALC_PATHS = ["/fabriccalc", "/outfit-formulas", "/set-price"];
  const inCalcGroup = CALC_PATHS.includes(location.pathname);
  const [calcOpen, setCalcOpen] = useState(inCalcGroup);
  useEffect(() => { if (inCalcGroup) setCalcOpen(true); }, [inCalcGroup]);

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

          {role === "superadmin" && (
            <>
              <li className={isActive("/products") ? "active" : ""}>
                <Link to="/products">
                  <FiBox className="icon" />
                  สินค้าพร้อมขาย
                </Link>
              </li>

              <li className={isActive("/fabric") ? "active" : ""}>
                <Link to="/fabric">
                  <FiLayers className="icon" />
                  จัดการผ้า
                </Link>
              </li>

              <li className={isActive("/orders") ? "active" : ""}>
                <Link to="/orders">
                  <FiShoppingCart className="icon" />
                  จัดซื้อ
                </Link>
              </li>

              <li className={isActive("/Supplier") ? "active" : ""}>
                <Link to="/Supplier">
                  <FiTruck className="icon" />
                  ผู้จัดจำหน่าย
                </Link>
              </li>

              <li className={isActive("/promotions") ? "active" : ""}>
                <Link to="/promotions">
                  <FiGift className="icon" />
                  โปรโมชั่น
                </Link>
              </li>

              <li className={isActive("/manageusers") ? "active" : ""}>
                <Link to="/manageusers">
                  <FiUsers className="icon" />
                  จัดการบัญชี
                </Link>
              </li>

              <li className={isActive("/logs") ? "active" : ""}>
                <Link to="/logs">
                  <FiFileText className="icon" />
                  บันทึก
                </Link>
              </li>

              <li>
                <div className={`menu-parent ${inCalcGroup ? "active" : ""}`}
                  onClick={() => setCalcOpen((v) => !v)}>
                  <BiCalculator className="icon" />
                  คำนวณผ้า
                  <FiChevronDown className={`chevron ${calcOpen ? "rotate" : ""}`} />
                </div>
                {calcOpen && (
                  <ul className="submenu">
                    <li>
                      <Link to="/fabriccalc" className={isActive("/fabriccalc") ? "active" : ""}>
                        <BiCalculator className="icon" />
                        คำนวณต้นทุนชุด
                      </Link>
                    </li>
                    <li>
                      <Link to="/outfit-formulas" className={isActive("/outfit-formulas") ? "active" : ""}>
                        <FiScissors className="icon" />
                        จัดการแบบชุดการคำนวณ
                      </Link>
                    </li>
                    <li>
                      <Link to="/set-price" className={isActive("/set-price") ? "active" : ""}>
                        <FiDollarSign className="icon" />
                        ประวัติการตั้งราคาขาย
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </>
          )}

          <li className={isActive("/staff/neworder") ? "active" : ""}>
            <Link to="/staff/neworder">
              <FiShoppingCart className="icon" />
              เปิดบิลขาย
            </Link>
          </li>

          <li className={isActive("/staff/checkorders") ? "active" : ""}>
            <Link to="/staff/checkorders">
              <FiFileText className="icon" />
              ประวัติการขาย
            </Link>
          </li>
          
          <li className={isActive("/staff/tailoringorders") ? "active" : ""}>
                <Link to="/staff/tailoringorders">
                  <FiScissors className="icon" />
                  คิวตัดชุด
                </Link>
              </li>

          <li className={isActive("/staff/tailoringcalendar") ? "active" : ""}>
                <Link to="/staff/tailoringcalendar">
                  <FiCalendar className="icon" />
                  ปฏิทินในการตัดชุด
                </Link>
              </li>

          <li className={isActive("/") || isActive("/dashboard") ? "active" : ""}>
            <Link to="/">
              <FiGrid className="icon" />
              สรุปยอดขาย
            </Link>
          </li>

          <li className={isActive("/staff/sales-report") ? "active" : ""}>
            <Link to="/staff/sales-report">
              <FiFileText className="icon" />
              รายงานยอดขาย
            </Link>
          </li>

          <li>
            <div className="menu-logout" onClick={handleLogout}>
              <FiLogOut className="icon" />
              ออกจากระบบ
            </div>
          </li>

        </ul>
      </div>
    </aside>
  );
}
