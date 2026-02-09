import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

const API = "http://localhost:3010";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // ✅ role มีแค่ staff/admin
  const [role, setRole] = useState("staff");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr("");

    if (!name || !email || !password || !phone || !address || !role) {
      setErr("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (!["admin", "staff"].includes(role)) {
      setErr("Role ต้องเป็น admin หรือ staff เท่านั้น");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API}/users`,
        { name, email, password, phone, address, role },
        { headers: { "Content-Type": "application/json" } }
      );

      // หลังสมัครเสร็จ -> ไปหน้า Login
      navigate("/login", { replace: true });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "ลงทะเบียนไม่สำเร็จ (ตรวจสอบอีเมลซ้ำ/ข้อมูลไม่ครบ)";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative shapes */}
      <div className="auth-decor auth-decor--right" />
      <div className="auth-decor auth-decor--top" />

      <div className="auth-shell">
        <div className="auth-brand">
          <div className="brand-logo">
            <span>POS</span>
          </div>
          <div className="brand-text">
            <div className="brand-title">Fabric Store</div>
            
          </div>
        </div>

        <div className="auth-card auth-card--wide">
          <h1 className="auth-title">สร้างบัญชี</h1>
          <div className="auth-divider" />
          <p className="auth-subtitle">
            กรอกข้อมูลเพื่อสมัครสมาชิก 
          </p>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-grid">
              <label className="auth-label">
                ชื่อ-นามสกุล
                <input
                  className="auth-input"
                  type="text"
                  placeholder="เช่น นางสาว..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              

              <label className="auth-label">
                อีเมล
                <input
                  className="auth-input"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="auth-label">
                โทรศัพท์
                <input
                  className="auth-input"
                  type="text"
                  placeholder="0xx-xxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <label className="auth-label auth-span-2">
                รหัสผ่าน
                <input
                  className="auth-input"
                  type="password"
                  placeholder="อย่างน้อย 4 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <label className="auth-label auth-span-2">
                ที่อยู่
                <textarea
                  className="auth-input auth-textarea"
                  placeholder="กรอกที่อยู่"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </label>
            </div>

            <label className="auth-label">
                Role
                <select
                  className="auth-input auth-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="staff">พนักงาน (staff)</option>
                  <option value="admin">ผู้ดูแลระบบ (admin)</option>
                </select>
              </label>

            {err && <div className="auth-error">{err}</div>}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "สร้างบัญชี"}
            </button>

            <div className="auth-hint auth-hint--split">
              <span>Already have an account?</span>
              <Link className="auth-link" to="/login">
                เข้าสู่ระบบ
              </Link>
            </div>
          </form>
        </div>

       
      </div>
    </div>
  );
}