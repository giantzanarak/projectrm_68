import { useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE } from "../api/http";
import { startRanges } from "../utils/productSizes";
import SizeRangeEditor from "./SizeRangeEditor";
import "../styles/product.css";

const API = `${API_BASE}/api/products`;

export default function SizeRangeModal({ product, mode = "finish", onClose, onSaved }) {
  const [rows, setRows] = useState(() => startRanges(product.size_ranges));
  const [saving, setSaving] = useState(false);
  const finish = mode === "finish";

  const save = async () => {
    try {
      setSaving(true);
      const url = finish ? `${API}/${product.id}/finish-cutting` : `${API}/${product.id}/sizes`;
      await axios.put(url, { sizes: rows });
      onClose();
      await Swal.fire({
        icon: "success",
        title: finish ? "ตัดเสร็จ — พร้อมขายแล้ว" : "บันทึกขนาดชุดแล้ว",
        confirmButtonText: "ตกลง",
      });
      onSaved?.();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: error?.response?.data?.message || "เกิดข้อผิดพลาด",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="pp-backdrop pp-root" onClick={onClose}>
      <div className="pp-modal pp-size-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pp-modal-header">
          <div>
            <p className="pp-modal-eyebrow">
              {product.name}{product.lot_code ? ` · ล็อต ${product.lot_code}` : ""}
            </p>
            <h3 className="pp-modal-title">{finish ? "ตัดเสร็จแล้ว — ชุดนี้ขนาดเท่าไหร่" : "แก้ขนาดชุด"}</h3>
          </div>
          <button className="pp-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="pp-modal-body">
          <p className="pp-source-note">
            กรอกว่าชุดนี้ใส่ได้ตั้งแต่ขนาดเท่าไหร่ถึงเท่าไหร่ (ซม.)
            เวลาลูกค้าถามจะได้บอกได้ว่าควรใส่ตัวไหน
            {finish && ` · บันทึกแล้วสินค้า ${Number(product.stock_qty) || 1} ชิ้นจะพร้อมขาย`}
          </p>
          <SizeRangeEditor value={rows} onChange={setRows} />
        </div>

        <div className="pp-modal-footer">
          <button className="pp-btn-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="pp-btn-save" onClick={save} disabled={saving}>
            {saving ? "กำลังบันทึก..." : finish ? "บันทึก + พร้อมขาย" : "บันทึกขนาด"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
