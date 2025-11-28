// src/staff/StaffTopbar.jsx
import "./StaffTopbar.css";
import logo from "../assets/fabric-logo.png";

const profileImg =
  "https://cdn-icons-png.flaticon.com/512/9131/9131529.png";

export default function StaffTopbar() {
  return (
    <div className="topbar-wrapper">
      <div className="topbar">

        {/* LEFT */}
        <div className="topbar-left">
          <img src={logo} className="logo-img" />
          <div>
            <h2 className="logo-title">Thai Fabric Shop</h2>
            <p className="logo-sub">ร้านผ้าทอพื้นเมือง</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="topbar-right">
          <img src={profileImg} className="profile-img" />
          <div className="profile-info">
            <strong>Sales Staff</strong>
            <p>พนักงานขาย</p>
          </div>
        </div>

      </div>
    </div>
  );
}
