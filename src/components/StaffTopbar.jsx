import "../css/StaffTopbar.css";

export default function Topbar() {
  return (

      <header className="topbar">
        <div className="left-side">
          <img src="/pics/logo.png" className="system-logo" />
          <div className="system-text-box">
            <span className="system-title">ระบบจัดการร้านผ้าทอพื้นเมือง</span>
          </div>
        </div>



        <div className="staff-profile">
          <img src="/pics/user-1.png" className="profile-img" />
          <span className="profile-name">พนักงานขาย</span>
        </div>
      </header> 

  );
}

