// src/components/modals/StockItemModal.jsx
import React, { useState, useEffect } from "react";
import "../../styles/modal.css";

const STATUS_OPTIONS = ["เพียงพอ", "ใกล้หมด", "หมด", "ต้องตรวจสอบ"];
const TYPE_OPTIONS = ["ผ้า (Fabric)", "บรรจุภัณฑ์", "อุปกรณ์หน้าร้าน", "อุปกรณ์แพ็กของ"];

export default function StockItemModal({ mode = "add", initial, onClose, onSave }) {
  // mode: "add" | "edit"

  const [form, setForm] = useState({
    id: "",
    name: "",
    type: "ผ้า (Fabric)",
    quantity: 0,
    location: "",
    status: "เพียงพอ",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        id: initial.id || "",
        name: initial.name || "",
        type: initial.type || "ผ้า (Fabric)",
        quantity: Number(initial.quantity || 0),
        location: initial.location || "",
        status: initial.status || "เพียงพอ",
      });
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = () => {
    if (!form.id || !form.name) {
      alert("กรุณากรอกรหัสสต็อกและชื่อรายการ");
      return;
    }
    onSave(form);
  };

  const title = mode === "edit" ? "แก้ไขรายการคลังสินค้า" : "เพิ่มรายการคลังสินค้า";
  const subtitle =
    mode === "edit"
      ? "ปรับข้อมูลรายการคลังสินค้าให้ถูกต้องและเป็นปัจจุบัน"
      : "บันทึกรายการใหม่ลงในคลังสินค้า เช่น ผ้า (Fabric), บรรจุภัณฑ์ หรืออุปกรณ์หน้าร้าน";

  return (
    <div className="modal-backdrop">
      <div className="modal-box stock-modal-box">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-subtitle">{subtitle}</p>

        <div className="modal-form">
          <div className="field">
            <label>รหัสสต็อก</label>
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="เช่น F005 หรือ S005 (ไม่ใช่จะสร้างให้ซ้ำในอนาคต)"
              disabled={mode === "edit"}
            />
          </div>

          <div className="field">
            <label>ชื่อรายการ</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="เช่น ผ้าไหมมัดหมี่ลายใหม่ / ถุงกระดาษลายร้าน"
            />
          </div>

          <div className="field">
            <label>ประเภท</label>
            <select name="type" value={form.type} onChange={handleChange}>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>จำนวนคงเหลือ</label>
            <input
              type="number"
              min="0"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>ตำแหน่งเก็บ</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="เช่น คลังผ้า - ชั้น F1 , คลังหลัก - ชั้น A1"
            />
          </div>

          <div className="field">
            <label>สถานะ</label>
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="save-btn" onClick={handleSubmit}>
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}