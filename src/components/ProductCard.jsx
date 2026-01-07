// src/components/ProductCard.jsx
import { FiTrash2, FiEdit2, FiEye } from "react-icons/fi";
import "../styles/products.css";

export default function ProductCard({ product, onDetail, onEdit, onDelete }) {
  if (!product) return null;

  const {
    id,
    name,
    pattern,
    width,
    length_m,
    price,
    stock,
    image,
  } = product;

  // ---------- คำนวน badge สต็อกตามเกณฑ์ ----------
  const qty = Number(stock ?? 0);

  let stockLabel = "";
  let stockClass = "";

  if (typeof stock !== "undefined") {
    if (qty <= 0) {
      stockLabel = "หมด";
      stockClass = "danger";
    } else if (qty <= 10) {
      stockLabel = `ใกล้หมด ${qty} ชิ้น`;
      stockClass = "warning";
    } else {
      stockLabel = `คงเหลือ ${qty} ชิ้น`;
      stockClass = "ok";
    }
  }

  return (
    <div className="prod-card-admin">
      {/* รูปสินค้า */}
      <div className="prod-card-img-wrap">
        <img
          src={
            image ||
            "https://images.pexels.com/photos/3738087/pexels-photo-3738087.jpeg"
          }
          alt={name}
          className="prod-card-img"
        />

        <span className="prod-chip-id">{id}</span>

        {typeof stock !== "undefined" && (
          <span className={`prod-chip-stock ${stockClass}`}>
            {stockLabel}
          </span>
        )}
      </div>

      {/* เนื้อหา */}
      <div className="prod-card-body">
        <h3 className="prod-card-name">{name || "ไม่ระบุชื่อสินค้า"}</h3>

        {pattern && <p className="prod-card-desc">{pattern}</p>}

        <div className="prod-meta-grid">
          {width && (
            <p>
              <span className="meta-label">ความกว้าง</span>
              <span className="meta-value">{width} นิ้ว</span>
            </p>
          )}

          {length_m && (
            <p>
              <span className="meta-label">ความยาวต่อชุด</span>
              <span className="meta-value">{length_m} เมตร</span>
            </p>
          )}

          {typeof stock !== "undefined" && (
            <p>
              <span className="meta-label">สต็อก</span>
              <span className="meta-value">
                {Number.isNaN(qty) ? 0 : qty} ชิ้น
              </span>
            </p>
          )}

          {price && (
            <p>
              <span className="meta-label">ราคาขาย</span>
              <span className="meta-value price">
                ฿{Number(price).toLocaleString()}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* ปุ่มด้านล่าง */}
      <div className="prod-card-footer">
        <button className="btn-outline-gray" onClick={onDetail}>
          <FiEye /> ดูรายละเอียด
        </button>

        <div className="prod-footer-right">
          <button className="icon-btn" onClick={onEdit}>
            <FiEdit2 />
          </button>
          <button className="icon-btn danger" onClick={onDelete}>
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
}