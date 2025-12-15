// src/components/modals/EditProductModal.jsx
import { useState } from "react";

export default function EditProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product);

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="modal-backdrop">   {/* ← แก้ตรงนี้ */}

      <div className="modal-box">

        <h2>แก้ไขผลิตภัณฑ์</h2>

        <div className="modal-body">
          {Object.keys(product).map((key) =>
            key !== "status" && key !== "image" ? (
              <input
                key={key}
                name={key}
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