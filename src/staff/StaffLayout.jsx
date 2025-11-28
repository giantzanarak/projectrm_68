// src/staff/StaffLayout.jsx
import { NavLink, Outlet } from "react-router-dom";
import "./StaffLayout.css";

export default function StaffLayout() {
  return (
    <div className="staff-layout">

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">

        {/* Logo + Title */}
        <div className="logo-wrapper">
          <div className="logo-circle">
            <img src="/pics/fabric-icon.png" className="logo-img" alt="logo" />
          </div>
          <div className="logo-text">
            <h1>Thai Fabric Shop</h1>
            <span>ร้านผ้าทอพื้นเมือง</span>
          </div>
        </div>

        {/* Staff Menu */}
        <div className="menu-title">✨ Staff Menu</div>

        {/* Menu List */}
        <nav className="menu-list">

          <NavLink to="/staff/dashboard" className="menu-item">
            <span className="icon">🏠</span> Dashboard
          </NavLink>

          <NavLink to="/staff/search" className="menu-item">
            <span className="icon">🔍</span> Search Products
          </NavLink>

          <NavLink to="/staff/neworder" className="menu-item">
            <span className="icon">🛒</span> New Order
          </NavLink>


          <NavLink to="/staff/checkorders" className="menu-item">
            <span className="icon">📦</span> Check Orders
          </NavLink>

          <NavLink to="/staff/salesreport" className="menu-item">
            <span className="icon">📊</span> Sales Report
          </NavLink>

          <NavLink to="/staff/export" className="menu-item">
            <span className="icon">🗂️</span> Export Data
          </NavLink>

        </nav>

        {/* Logout Button */}
        <button className="logout-btn">👋 ออกจากระบบ</button>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
}
