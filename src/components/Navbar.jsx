import { FiBell, FiSearch } from "react-icons/fi";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">

      {/* LEFT */}
      <div className="navbar-left">
        <img src="/logo.png" alt="logo" className="navbar-logo" />
        <div className="navbar-title-block">
          <h3 className="navbar-title">ระบบจัดการร้านผ้าพื้นเมือง</h3>
          <span className="navbar-sub">ผู้ดูแลระบบ</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        <button className="navbar-icon">
          <FiBell />
        </button>

        <div className="navbar-user-box">
          <span className="navbar-user-name">สวัสดี, Admin</span>
          <div className="navbar-avatar">A</div>
        </div>
      </div>

    </nav>
  );
}