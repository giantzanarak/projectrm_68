// src/components/modals/ProductDetailModal.jsx
import React from "react";
import "../../styles/modal.css";

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="modal-bg" onClick={onClose}>
      <div
        className="modal-box detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="detail-layout">
          {/* รูปสินค้า */}
          <div className="detail-image-wrap">
            <img
              src={product.image}
              alt={product.name}
              className="detail-image"
            />
            <span className="detail-chip-id">{product.id}</span>
          </div>

          {/* ข้อมูลสินค้า */}
          <div className="detail-info">
            <h2 className="detail-title">{product.name}</h2>
            <p className="detail-sub">
              ดูรายละเอียดสินค้าและสต็อกเพื่อช่วยตัดสินใจจัดซื้อและขายหน้าร้าน
            </p>

            <div className="detail-grid">
              <div className="detail-field">
                <span className="detail-label">รหัสสินค้า</span>
                <span className="detail-value">{product.id}</span>
              </div>

              <div className="detail-field">
                <span className="detail-label">ประเภท</span>
                <span className="detail-value">{product.type}</span>
              </div>

              <div className="detail-field">
                <span className="detail-label">ลวดลาย</span>
                <span className="detail-value">{product.pattern}</span>
              </div>

              <div className="detail-field">
                <span className="detail-label">สต็อกคงเหลือ</span>
                <span className="detail-value">{product.stock} ชิ้น</span>
              </div>

              <div className="detail-field">
                <span className="detail-label">ราคาต่อชิ้น</span>
                <span className="detail-value price">
                  ฿{Number(product.price || 0).toLocaleString()}
                </span>
              </div>

              <div className="detail-field">
                <span className="detail-label">มูลค่าสต็อกโดยประมาณ</span>
                <span className="detail-value">
                  ฿{(Number(product.price || 0) * Number(product.stock || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="detail-note">
              สามารถแก้ไขข้อมูลสินค้าได้จากปุ่ม <strong>แก้ไข</strong> ในหน้าหลักของผลิตภัณฑ์
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}