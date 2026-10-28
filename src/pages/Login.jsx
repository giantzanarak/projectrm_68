import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

import { API_BASE as API } from "../api/http";

const mapRole = (raw) => {
  const r = String(raw || "").trim().toLowerCase();
  if (r === "admin") return "superadmin";
  return r;
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

      if (role === "superadmin") {
        navigate("/products", { replace: true });
      } else if (role === "staff") {
        navigate("/staff/neworder", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      setErr(
        error?.response?.data?.message ||
          "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลหรือรหัสผ่าน"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="silk-login-page">
      <div className="silk-login-overlay"></div>
      <div className="silk-login-pattern silk-login-pattern-top"></div>
      <div className="silk-login-pattern silk-login-pattern-bottom"></div>

      <div className="silk-login-container">
        <div className="silk-login-left">
          <div className="silk-left-image">
            <img src="/images/ผ้า4.jpg" alt="Fabric Store" />
            <div className="silk-left-overlay"></div>

            <div className="silk-left-content silk-left-content--top">
              <div className="silk-brand-badge">POS</div>
            </div>

            <div className="silk-left-content silk-left-content--bottom">
              <h1 className="silk-brand-title">Fabric Store Management</h1>
            </div>
          </div>
        </div>

        <div className="silk-login-right">
          <div className="silk-login-card">
            <div className="silk-card-header">
              <p className="silk-card-caption">ยินดีต้อนรับ</p>
              <h2 className="silk-card-title">เข้าสู่ระบบ</h2>
              <p className="silk-card-desc">
                กรุณากรอกข้อมูลบัญชีของคุณเพื่อเข้าสู่ระบบ
              </p>
            </div>

            <form className="silk-login-form" onSubmit={handleLogin}>
              <div className="silk-form-group">
                <label className="silk-form-label">อีเมล</label>
                <input
                  className="silk-form-input"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="silk-form-group">
                <label className="silk-form-label">รหัสผ่าน</label>
                <input
                  className="silk-form-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {err && <div className="silk-form-error">{err}</div>}

              <button
                className="silk-login-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>

              <div className="silk-login-footer">
                <span>ยังไม่มีบัญชีผู้ใช้งาน?</span>
                <Link className="silk-login-link" to="/register">
                  สมัครสมาชิก
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}