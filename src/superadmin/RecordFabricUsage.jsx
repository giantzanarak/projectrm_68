import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { addFabricUsage, getFabricRoll } from "../api/fetch_api_superadmin";
import '../styles/RecordFabricUsage.css';
import {
  FiCalendar,
  FiSave,
} from 'react-icons/fi';

const RecordFabricUsage = () => {

  const navigate  = useNavigate();
  const { id }    = useParams();

  const [roll, setRoll]           = useState(null);
  const [usedLength, setUsedLength] = useState("");
  const [note, setNote]           = useState("");

  useEffect(() => {
    loadRoll();
  }, [id]);

  const loadRoll = async () => {
    try {
      const data = await getFabricRoll(id);
      console.log("roll data:", data);
      setRoll(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      await addFabricUsage({
        roll_id:     roll.roll_id,
        used_length: Number(usedLength),
        note:        note,
      });
      await Swal.fire({
        position: "center",
        icon: "success",
        title: "บันทึกข้อมูลสำเร็จ",
        text: `บันทึกการใช้ผ้า ${Number(usedLength || 0).toFixed(2)} เมตร เรียบร้อยแล้ว`,
        showConfirmButton: false,
        timer: 1500,
      });
      navigate(`/Fabric/detail/${roll.roll_id}`);
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกการใช้ผ้าได้",
        confirmButtonText: "ปิด",
      });
    }
  };

  if (!roll) return <div>Loading...</div>;

  const used       = Number(usedLength) || 0;
  const remainAfter = (Number(roll.remaining_length) - used).toFixed(2);
  const deductedValue = (used * Number(roll.cost_per_meter)).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
  });
  const progressPercent = roll.initial_length > 0
    ? Math.round((roll.remaining_length / roll.initial_length) * 100)
    : 0;

  return (
    <div className="usage-page-container">

      <div className="usage-header">
        <div className="header-info">
          <div>
            <h1>บันทึกการใช้ผ้า</h1>
            <p>จัดการตัดแบ่งและการใช้งานม้วนผ้าในระบบ</p>
          </div>
        </div>
      </div>

      <div className="usage-content-wrapper">

        <div className="fabric-preview-card">
          <div className="roll-badge">{roll.roll_code}</div>

          <div className="preview-image-container">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3050/3050215.png"
              alt="Fabric Icon"
              className="sand-clock-img"
            />
          </div>

          <div className="preview-details">
            <h2>{roll.fabric_name || "-"}</h2>
            <p className="color-text">สี: {roll.color_name || "-"}</p>

            <div className="preview-stats">
              <div className="stat-row">
                <span>ประเภทผ้า</span>
                <span>{roll.type_name || "-"}</span>
              </div>
              <div className="stat-row">
                <span>ลวดลาย</span>
                <span>{roll.category_name || "-"}</span>
              </div>
              <div className="stat-row">
                <span>ความยาวปัจจุบัน</span>
                <span className="text-blue font-bold">
                  {Number(roll.remaining_length).toFixed(2)} เมตร
                </span>
              </div>
              <div className="stat-row">
                <span>ราคาต่อเมตร</span>
                <span>{Number(roll.cost_per_meter).toFixed(2)} บาท/เมตร</span>
              </div>
              <div className="stat-row">
                <span>ล็อตผลิต</span>
                <span>{roll.lot_number || "-"}</span>
              </div>
            </div>

            <div className="usage-progress-container">
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="progress-label">
                คงเหลือ {progressPercent}% จากม้วนเต็ม
              </div>
            </div>
          </div>
        </div>

        <div className="usage-form-card">
          <h3 className="section-title">ระบุปริมาณผ้าที่ใช้</h3>

          <div className="form-grid">

            <div className="input-group">
              <label>ใช้ไป (เมตร) <span className="text-red">*</span></label>
              <div className="unit-input-wrapper">
                <input
                  type="number"
                  min="0"
                  max={roll.remaining_length}
                  value={usedLength}
                  onChange={(e) => setUsedLength(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <p className="helper-text">
                ห้ามกรอกเกิน {Number(roll.remaining_length).toFixed(2)} เมตร
              </p>
            </div>

            <div className="input-group">
              <label>วันที่ใช้งาน <span className="text-red">*</span></label>
              <div className="date-input-wrapper">
                <input
                  type="text"
                  value={new Date().toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  readOnly
                />
                <FiCalendar className="calendar-icon" />
              </div>
            </div>

            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
              <label>หมายเหตุ</label>
              <textarea
                placeholder="เช่น ใช้ผลิตชุดไทยทรง A ไซส์ M, ตัดชุด..."
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

          </div>

          <div className="calc-summary-box">
            <div className="calc-item">
              <span className="calc-label">ใช้ไป</span>
              <span className="calc-value text-red">
                {used.toFixed(2)} <small>เมตร</small>
              </span>
            </div>
            <div className="calc-divider" />
            <div className="calc-item">
              <span className="calc-label">คงเหลือหลังบันทึก</span>
              <span className="calc-value text-blue">
                {remainAfter} <small>เมตร</small>
              </span>
            </div>
            <div className="calc-divider" />
            <div className="calc-item">
              <span className="calc-label">มูลค่าที่หัก</span>
              <span className="calc-value">
                {deductedValue} <small>บาท</small>
              </span>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-cancel" onClick={() => navigate(-1)}>
              ยกเลิก
            </button>
            <button className="btn-submit-usage" onClick={handleSave}>
              <FiSave /> บันทึกการใช้ผ้า
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RecordFabricUsage;
