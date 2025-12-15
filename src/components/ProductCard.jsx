import { FiEye, FiTrash2, FiEdit2 } from "react-icons/fi";

export default function ProductCard({ product, onDetail, onEdit, onDelete }) {
  return (
    <div className="product-card">

      {/* IMAGE */}
      <div className="product-img-wrapper">
        <img src={product.image} alt={product.name} />

        {product.status && (
          <span className={`product-badge ${product.status}`}>
            {product.status}
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="product-content">
        <div className="product-id">{product.id}</div>

        <h3 className="product-name">{product.name}</h3>

        <div className="product-tags">
          <span>{product.type}</span>
          <span>{product.pattern}</span>
        </div>

        {/* INFO GRID */}
        <div className="product-info-grid">
          <div>
            <p className="info-label">ความกว้าง</p>
            <p>{product.width}</p>
          </div>
          <div>
            <p className="info-label">คงเหลือ</p>
            <p>{product.stock} เมตร</p>
          </div>
          <div>
            <p className="info-label">ราคาม้วน</p>
            <p>฿{product.price}</p>
          </div>
          <div>
            <p className="info-label">คลัง</p>
            <p>{product.location}</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="product-actions">
          <button className="view-btn" onClick={() => onDetail(product)}>
            <FiEye /> ดูรายละเอียด
          </button>

          <button className="edit-btn" onClick={() => onEdit(product)}>
            <FiEdit2 />
          </button>

          <button className="delete-btn" onClick={() => onDelete(product)}>
            <FiTrash2 />
          </button>
        </div>
      </div>

    </div>
  );
}