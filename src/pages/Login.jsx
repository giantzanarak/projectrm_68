import { useState } from "react";
import "./Login.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      {/* CARD */}
      <div className="login-card">

        {/* LOGO */}
        <div className="logo-box">
          <img src="/pics/fabric-icon.png" alt="logo" className="logo-img" />
        </div>

        {/* TITLE */}
        <h2 className="title">ระบบจัดการร้านผ้าทอพื้นเมือง</h2>

        {/* FORM */}
        <div className="form">

          {/* USERNAME */}
          <label>ชื่อผู้ใช้ / Username</label>
          <input
            type="text"
            placeholder="กรอกชื่อผู้ใช้"
            className="input"
          />

          {/* PASSWORD */}
          <label>รหัสผ่าน / Password</label>
          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="กรอกรหัสผ่าน"
              className="input"
            />

            {/* ICON */}
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                // EYE CLOSED
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-6.94"></path>
                  <path d="M1 1l22 22"></path>
                </svg>
              ) : (
                // EYE OPEN
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </span>
          </div>

          {/* REMEMBER */}
          <div className="remember-row">
            <input type="checkbox" />
            <span>จดจำการเข้าสู่ระบบ</span>
          </div>

          {/* BUTTON */}
          <button className="login-btn">เข้าสู่ระบบ / Sign In</button>
        </div>

        {/* DEMO */}
        <div className="demo-block">
          <p className="demo-title">🔑 ทดสอบระบบ / Demo Credentials:</p>

          <div className="demo-row">
            <div className="demo admin">👑 Admin<br />admin/admin</div>
            <div className="demo staff">👩‍💼 Staff<br />staff/staff</div>
          </div>
        </div>

      </div>
    </div>
  );
}
