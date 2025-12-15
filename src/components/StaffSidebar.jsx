import { NavLink, Outlet } from "react-router-dom";
import "../css/StaffSidebar.css";

export default function StaffLayout() {
  return (
    <div className="layout-container">

      <div className="body-wrapper">

        {/* ===== SIDEBAR ===== */}
        <aside className="sidebar">

          {/* กลุ่มเมนูหลัก */}
          <div className="menu-group">

            <NavLink to="/admin/dashboard" className="menu-item">
              <img src="/pics/home.png" className="menu-icon" /> หน้าแรก
            </NavLink>

            <NavLink to="/admin/search" className="menu-item">
              <img src="/pics/search.png" className="menu-icon" /> ค้นหาสินค้า
            </NavLink>

            <NavLink to="admin/neworder" className="menu-item">
              <img src="/pics/cart.png" className="menu-icon" /> บันทึกการขาย
            </NavLink>

            <NavLink to="/admin/checkorders" className="menu-item">
              <img src="/pics/box.png" className="menu-icon" /> ตรวจสอบคำสั่งซื้อ
            </NavLink>

            <NavLink to="/admin/salesreport" className="menu-item">
              <img src="/pics/chart.png" className="menu-icon" /> รายงานยอดขาย
            </NavLink>

          </div> {/* ← ปิด menu-group ตรงนี้ถูกต้อง */}

          {/* ปุ่มออกจากระบบ (อยู่ล่างสุด) */}
          <button className="logout-btn">
            <img src="/pics/logout.png" className="logout-icon" />
            ออกจากระบบ
          </button>

        </aside>   {/* ← ปิด aside ตรงนี้ถูกต้อง */}

        {/* CONTENT */}
        <main className="content-area">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
