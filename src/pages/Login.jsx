import { useState } from "react";
import "../css/Login.css";

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  return (
    <div className="login-page">

      <div className="login-card">

        {/* LOGO */}
        <div className="login-logo-box">
          <img src="/pics/logo2.png" className="login-logo" />
        </div>

        <h2 className="login-title">ระบบจัดการร้านผ้าทอพื้นเมือง</h2>
        <p className="login-sub">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>

        {/* FORM */}
        <div className="form-group">
          <label>ชื่อผู้ใช้</label>
          <input
            type="text"
            placeholder="กรอกชื่อผู้ใช้"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>รหัสผ่าน</label>
          <div className="password-wrapper">
            <input
              type={showPass ? "text" : "password"}
              placeholder="กรอกรหัสผ่าน"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <img
              src="/pics/eye.png"
              className="icon-eye"
              onClick={() => setShowPass(!showPass)}
            />
          </div>
        </div>

        <div className="remember-row">
          <input type="checkbox" />
          <span>จดจำการเข้าสู่ระบบ</span>
        </div>

        <button className="login-btn">เข้าสู่ระบบ</button>

      </div>
    </div>
  );
}
