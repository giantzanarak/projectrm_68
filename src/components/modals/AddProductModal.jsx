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

  const [imageError, setImageError] = useState(false);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'image') setImageError(false);
  };

  const handleSave = () => {
    if (!form.name) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }
    onSave({
      ...form,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
    });
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        
        {/* Header ส่วนบนให้เหมือนหน้าแก้ไข */}
        <div style={{ marginBottom: '32px' }}>
          <h2 className="modal-title">เพิ่มผลิตภัณฑ์</h2>
          <p className="modal-sub" style={{ marginTop: '8px', marginLight: 0 }}>
            กรอกข้อมูลผลิตภัณฑ์ใหม่เพื่อเพิ่มเข้าสู่ระบบ
          </p>
        </div>

        <div className="modal-form">
          {/* === ส่วนรูปภาพสินค้า (Preview ใหญ่) === */}
          <div>
            <label style={{ fontSize: '16px', marginBottom: '12px' }}>รูปภาพสินค้า</label>
            
            <div className="image-preview-area">
              {form.image && !imageError ? (
                <img 
                  src={form.image} 
                  alt="Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  onError={() => setImageError(true)}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>
                    {imageError ? "ไม่สามารถโหลดรูปภาพได้" : "ตัวอย่างรูปภาพจะปรากฏที่นี่"}
                  </span>
                </div>
              )}
            </div>

            <input
              name="image"
              value={form.image}
              onChange={updateField}
              placeholder="https://example.com/image.jpg"
              style={{ fontFamily: 'monospace' }}
            />
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
              วาง URL ของรูปภาพเพื่อให้แสดงผลในระบบ
            </p>
          </div>

          {/* ชื่อสินค้า */}
          <div>
            <label>ชื่อสินค้า</label>
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="ระบุชื่อสินค้า..."
              style={{ fontSize: '16px', fontWeight: '500' }}
            />
          </div>

          {/* แถวที่ 1: รหัสสินค้า และ ประเภท (2 คอลัมน์) */}
          <div className="modal-form two-col" style={{ gap: '20px 24px' }}>
            <div>
              <label>รหัสสินค้า</label>
              <input
                name="id"
                value={form.id}
                onChange={updateField}
                placeholder="เช่น P007"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label>ประเภท</label>
              <input
                name="type"
                value={form.type}
                onChange={updateField}
                placeholder="เช่น ชุดสำเร็จรูป"
              />
            </div>
          </div>

          {/* แถวที่ 2: ลวดลาย และ ราคา (2 คอลัมน์) */}
          <div className="modal-form two-col" style={{ gap: '20px 24px' }}>
            <div>
              <label>ลวดลาย</label>
              <input
                name="pattern"
                value={form.pattern}
                onChange={updateField}
                placeholder="เช่น ลายดอกรัก"
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
                style={{ fontWeight: '600', color: '#2563eb', fontSize: '16px' }}
              />
            </div>
          </div>

          {/* แถวที่ 3: สต็อก (ครึ่งแถว) */}
          <div className="modal-form two-col" style={{ gap: '20px 24px' }}>
            <div>
              <label>สต็อกคงเหลือ (ชิ้น)</label>
              <input
                type="number"
                min="0"
                name="stock"
                value={form.stock}
                onChange={updateField}
                style={{ fontWeight: '600', fontSize: '16px' }}
              />
            </div>
          </div>

        </div>

        {/* Footer Buttons */}
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