// src/components/modals/EditProductModal.jsx
import React, { useState, useEffect } from "react";
import "../../styles/modal.css";

export default function EditProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    type: "",
    pattern: "",
    price: "",
    stock: "",
    image: "",
  });

  useEffect(() => {
    if (product) {
      setForm({
        id: product.id || "",
        name: product.name || "",
        type: product.type || "",
        pattern: product.pattern || "",
        price: product.price ?? "",
        stock: product.stock ?? "",
        image: product.image || "",
      });
    }
  }, [product]);

  if (!product) return null;

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

    onSave(payload);   // Products.jsx จะ map แทนที่ตัวเดิมให้
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">แก้ไขผลิตภัณฑ์</h2>
        <p className="modal-sub">ปรับข้อมูลสินค้าให้ถูกต้องและเป็นปัจจุบัน</p>

        <div className="modal-form">
          <div>
            <label>รหัสสินค้า</label>
            <input
              name="id"
              value={form.id}
              onChange={updateField}
              disabled   /* ไม่ให้เปลี่ยน id เพื่อให้ map ได้ตรง */
            />
          </div>

          <div>
            <label>ชื่อสินค้า</label>
            <input
              name="name"
              value={form.name}
              onChange={updateField}
            />
          </div>

          <div>
            <label>ประเภท</label>
            <input
              name="type"
              value={form.type}
              onChange={updateField}
            />
          </div>

          <div>
            <label>ลวดลาย</label>
            <input
              name="pattern"
              value={form.pattern}
              onChange={updateField}
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
            />
          </div>
        </div>

        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="btn-save" onClick={handleSave}>
            บันทึกการแก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}