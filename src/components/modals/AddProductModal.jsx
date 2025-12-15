// src/components/modals/AddProductModal.jsx
import { useState } from "react";

export default function AddProductModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    type: "",
    pattern: "",
    width: "",
    stock: "",
    price: "",
    location: "",
    status: "เพียงพอ",
    image: "/pics/default.jpg",
  });

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="modal-backdrop">   {/* ← แก้ตรงนี้ */}

      <div className="modal-box">

        <h2>เพิ่มผลิตภัณฑ์</h2>

        <div className="modal-body">
          {Object.keys(form).map((key) =>
            key !== "status" && key !== "image" ? (
              <input
                key={key}
                name={key}
                placeholder={key}
                value={form[key]}
                onChange={handle}
              />
            ) : null
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>ยกเลิก</button>
          <button className="save-btn" onClick={() => onSave(form)}>บันทึก</button>
        </div>

      </div>
    </div>
  );
}