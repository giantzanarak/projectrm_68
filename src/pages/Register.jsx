import { useState } from "react";
import { onlyDigits, isValidPhone, PHONE_HINT } from "../utils/phone";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";
import Select from "../components/Select";

import { API_BASE as API } from "../api/http";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
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

    if (!isValidPhone(phone)) {
      setErr(PHONE_HINT);
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
          <div className="silk-login-card silk-register-card">
            <div className="silk-card-header">
              <p className="silk-card-caption">REGISTER</p>
              <h2 className="silk-card-title">สร้างบัญชีผู้ใช้งาน</h2>
              <p className="silk-card-desc">
                กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสมัครสมาชิกเข้าสู่ระบบ
              </p>
            </div>

            <form className="silk-login-form" onSubmit={handleRegister}>
              <div className="silk-register-grid">
                <div className="silk-form-group silk-span-2">
                  <label className="silk-form-label">ชื่อ-นามสกุล</label>
                  <input
                    className="silk-form-input"
                    type="text"
                    placeholder="เช่น นางสาว..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

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
                  <label className="silk-form-label">โทรศัพท์</label>
                  <input
                    className="silk-form-input"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="0812345678"
                    value={phone}
                    onChange={(e) => setPhone(onlyDigits(e.target.value))}
                  />
                </div>

                <div className="silk-form-group silk-span-2">
                  <label className="silk-form-label">รหัสผ่าน</label>
                  <input
                    className="silk-form-input"
                    type="password"
                    placeholder="อย่างน้อย 4 ตัวอักษร"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="silk-form-group silk-span-2">
                  <label className="silk-form-label">ที่อยู่</label>
                  <textarea
                    className="silk-form-input silk-form-textarea"
                    placeholder="กรอกที่อยู่"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="silk-form-group silk-span-2">
                  <label className="silk-form-label">สิทธิ์การใช้งาน</label>
                  <Select
                    className="silk-form-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="staff">พนักงาน (staff)</option>
                    <option value="admin">ผู้ดูแลระบบ (admin)</option>
                  </Select>
                </div>
              </div>

              {err && <div className="silk-form-error">{err}</div>}

              <button
                className="silk-login-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
              </button>

              <div className="silk-login-footer">
                <span>มีบัญชีอยู่แล้ว?</span>
                <Link className="silk-login-link" to="/login">
                  เข้าสู่ระบบ
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}