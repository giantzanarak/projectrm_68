import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/layout.css";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user } = useAuth();

  const roleLabel =
    user?.role === "staff"
      ? "พนักงาน"
      : user?.role === "superadmin"
      ? "ผู้ดูแลระบบ"
      : "";

  return (
    <div className="app-layout">
      <header className="app-topbar">
        <div className="topbar-left">
          <h1 className="app-title">ระบบจัดการร้านผ้าพื้นเมือง</h1>
          {roleLabel && (
            <span className="app-subtitle">
              {roleLabel} : {user?.username}
            </span>
          )}
        </div>

        <div className="topbar-right">
          {user && <span className="topbar-user">สวัสดี, {user.username}</span>}
          <div className="topbar-avatar">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </header>

      <div className="app-body">
        <Sidebar />

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
