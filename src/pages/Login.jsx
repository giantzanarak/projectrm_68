// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const userTrim = username.trim();
    const passTrim = password.trim();

    // ==== account ทดสอบ ====
    // admin / admin  -> superadmin
    // staff / staff  -> staff
    let role = null;

    if (userTrim === "admin" && passTrim === "admin") {
      role = "superadmin";
    } else if (userTrim === "staff" && passTrim === "staff") {
      role = "staff";
    } else {
      alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    const user = { username: userTrim, role };

    // เก็บเข้า context + localStorage
    login(user);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", role);

    // ✅ redirect ทั้งคู่ให้ไปหน้า dashboard เดียวกันคือ "/"
    navigate("/", { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title-main">ระบบจัดการร้านผ้าทอพื้นเมือง</h1>
        <p className="login-sub-main">เข้าสู่ระบบเพื่อใช้งาน</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            ชื่อผู้ใช้
            <input
              type="text"
              className="login-input"
              placeholder="กรอกชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label className="login-label">
            รหัสผ่าน
            <input
              type="password"
              className="login-input"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="login-btn">
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="login-hint">
          ผู้ดูแลระบบ: <strong>admin / admin</strong>
          <br />
          พนักงาน: <strong>staff / staff</strong>
        </div>
      </div>
    </div>
  );
}