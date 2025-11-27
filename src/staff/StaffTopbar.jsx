import "./StaffTopbar.css";

export default function StaffTopbar() {
  return (
    <div className="staff-topbar">

      {/* Left Logo */}
      <div className="topbar-left">
        <div className="topbar-logo-circle">
          <img src="/pics/fabric-icon.png" className="topbar-logo-img" />
        </div>

        <div className="topbar-text">
          <h2>Thai Fabric Shop</h2>
          <span>ร้านผ้าทอพื้นเมือง</span>
        </div>
      </div>

      {/* Right Staff Profile */}
      <div className="topbar-profile">
        <div className="profile-circle">
          <img src="/pics/user.png" />
        </div>

        <div className="profile-text">
          <strong>Sales Staff</strong>
          <span>พนักงานขาย</span>
        </div>
      </div>

    </div>
  );
}
