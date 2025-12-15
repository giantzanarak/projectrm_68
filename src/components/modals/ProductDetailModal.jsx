import { FiX } from "react-icons/fi";
import "./ProductDetailModal.css";

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="pd-modal-bg">
      <div className="pd-modal-box">

        {/* HEADER */}
        <div className="pd-modal-header">
          <h2>รายละเอียดสินค้า</h2>
          <button className="pd-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* IMAGE */}
        <div className="pd-image-section">
          <img src={product.image} alt={product.name} />
        </div>

        {/* INFO */}
        <div className="pd-info">

          <div className="pd-row">
            <label>รหัสสินค้า</label>
            <p>{product.id}</p>
          </div>

          <div className="pd-row">
            <label>ชื่อสินค้า</label>
            <p>{product.name}</p>
          </div>

          <div className="pd-row">
            <label>ประเภท</label>
            <p>{product.type}</p>
          </div>

          <div className="pd-row">
            <label>ลวดลาย</label>
            <p>{product.pattern}</p>
          </div>

          <div className="pd-row">
            <label>ความกว้าง</label>
            <p>{product.width}</p>
          </div>

          <div className="pd-row">
            <label>คงเหลือ</label>
            <p>{product.stock} เมตร</p>
          </div>

          <div className="pd-row">
            <label>ราคาม้วน</label>
            <p>฿{product.price}</p>
          </div>

          <div className="pd-row">
            <label>คลัง</label>
            <p>{product.location}</p>
          </div>

          <div className="pd-row">
            <label>สถานะสต็อก</label>
            <p>{product.status}</p>
          </div>

        </div>

        {/* BUTTON */}
        <div className="pd-footer">
          <button className="pd-close-footer" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  );
}