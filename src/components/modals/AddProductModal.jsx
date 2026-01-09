// src/components/modals/AddProductModal.jsx
import React, { useState } from "react";
import "../../styles/modal.css";

export default function AddProductModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    type: "",
    pattern: "",
    price: "",
    stock: "",
    image: "",
  });

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!form.name) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
    };

    onSave(payload);   // Products.jsx จะไปเพิ่มเข้า state ให้
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">เพิ่มผลิตภัณฑ์</h2>
        <p className="modal-sub">
          กรอกข้อมูลผลิตภัณฑ์ใหม่เพื่อเพิ่มเข้าสู่ระบบ
        </p>

        <div className="modal-form">
          <div>
            <label>รหัสสินค้า</label>
            <input
              name="id"
              value={form.id}
              onChange={updateField}
              placeholder="เช่น P007"
            />
          </div>

          <div>
            <label>ชื่อสินค้า</label>
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="เช่น ชุดไทย..."
            />
          </div>

          <div>
            <label>ประเภท</label>
            <input
              name="type"
              value={form.type}
              onChange={updateField}
              placeholder="เช่น ชุดสำเร็จรูป / ผ้าพับเมตร"
            />
          </div>

          <div>
            <label>ลวดลาย</label>
            <input
              name="pattern"
              value={form.pattern}
              onChange={updateField}
              placeholder="เช่น มัดหมี่ / ลายดอก..."
            />
          </div>

          <div>
            <label>ราคาต่อชิ้น (บาท)</label>
            <input
              type="number"
              min="0"
              name="price"
              value={form.price}
              onChange={updateField}
            />
          </div>

          <div>
            <label>สต็อกคงเหลือ (ชิ้น)</label>
            <input
              type="number"
              min="0"
              name="stock"
              value={form.stock}
              onChange={updateField}
            />
          </div>

          <div>
            <label>ลิงก์รูปภาพ</label>
            <input
              name="image"
              value={form.image}
              onChange={updateField}
              placeholder="URL รูปสินค้า (ไม่บังคับ)"
            />
          </div>
        </div>

        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="btn-save" onClick={handleSave}>
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}