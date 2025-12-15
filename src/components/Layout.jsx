// src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../styles/layout.css";

export default function Layout() {
  return (
    <div className="layout-wrapper">
      
      {/* NAVBAR ด้านบน (เต็มความกว้าง) */}
      <Navbar />

      <div className="layout-body">

        {/* SIDEBAR ด้านซ้าย */}
        <aside className="layout-sidebar">
          <Sidebar />
        </aside>

        {/* MAIN CONTENT */}
        <main className="layout-content">
          <div className="layout-content-inner">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}