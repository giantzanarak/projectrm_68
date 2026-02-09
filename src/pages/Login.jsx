// src/pages/Login.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

const API = "http://localhost:3010";

const mapRole = (raw) => {
  const r = String(raw || "").trim().toLowerCase();
  if (r === "admin") return "superadmin"; // ✅ admin = superadmin
  return r; // staff
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");

    if (!email || !password) {
      setErr("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API}/users/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const user = res.data;
      const role = mapRole(user?.role);

      localStorage.setItem("user", JSON.stringify({ ...user, role }));
      localStorage.setItem("role", role);

      // ✅ เด้งตาม role
      if (role === "superadmin") {
        navigate("/products", { replace: true }); // หน้าแรก superadmin
      } else if (role === "staff") {
        navigate("/staff/neworder", { replace: true }); // หน้าแรก staff
      } else {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      setErr(
        error?.response?.data?.message ||
          "เข้าสู่ระบบไม่สำเร็จ (ตรวจสอบอีเมล/รหัสผ่าน)"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decor auth-decor--right" />
      <div className="auth-decor auth-decor--top" />

      <div className="auth-shell">
        <div className="auth-brand">
          <div className="brand-logo"><span>POS</span></div>
          <div className="brand-text">
            <div className="brand-title">Fabric Store</div>
          </div>
        </div>

        <div className="auth-card">
          <h1 className="auth-title">Login</h1>
          <div className="auth-divider" />
          <p className="auth-subtitle">ยินดีต้อนรับเข้าสู่ระบบ</p>

          <form className="auth-form" onSubmit={handleLogin}>
            <label className="auth-label">
              Email
              <input
                className="auth-input"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="auth-label">
              Password
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {err && <div className="auth-error">{err}</div>}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "ยืนยัน"}
            </button>

            

            <div className="auth-hint">
              <span>ยังไม่มีบัญชี</span>
              <Link className="auth-link" to="/register">
                สร้างบัญชี
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}