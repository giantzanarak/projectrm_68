import { FiImage, FiX } from "react-icons/fi";
import "../styles/AddFabric.css";

// โมดัล "เพิ่มใหม่" ของ ประเภทผ้า / ลวดลาย / สี — ใช้ในหน้าเพิ่มม้วนผ้าและแก้ไขม้วนผ้า
// suggestions = ค่าที่มีในระบบแล้วแต่ร้านนี้ยังไม่เคยมี (กดเลือกได้เลย)
export default function FabricQuickCreateModal({
  title,
  label,
  suggestions,
  onPick,
  value,
  onChange,
  onClose,
  onSave,
  saving,
  showImage,
  imagePreview,
  onImageChange,
  onImageRemove,
}) {
  return (
    <div className="quick-create-overlay" onClick={onClose}>
      <div className="quick-create-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quick-create-header">
          <h3>{title}</h3>
          <button type="button" className="quick-create-close" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <div className="quick-create-body">
          {suggestions.length > 0 && (
            <>
              <label>เลือกจาก{label}ที่มีในระบบ</label>
              <div className="quick-pick-list">
                {suggestions.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    className="quick-pick-chip"
                    onClick={() => onPick(s.id)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </>
          )}

          <label>{suggestions.length > 0 ? `หรือพิมพ์${label}ใหม่` : label}</label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`ระบุ${label}`}
            onKeyDown={(e) => { if (e.key === "Enter") onSave(); }}
            autoFocus
          />

          {showImage && (
            <>
              <label>รูปภาพ{label} (ไม่บังคับ)</label>
              <div className="fabric-image-upload">
                {imagePreview ? (
                  <div className="fabric-image-preview">
                    <img src={imagePreview} alt={label} />
                    <button type="button" className="fabric-image-remove" onClick={onImageRemove}>
                      <FiX size={14} /> ลบรูป
                    </button>
                  </div>
                ) : (
                  <label className="fabric-image-dropzone">
                    <FiImage size={22} />
                    <span>คลิกเพื่ออัปโหลดรูปภาพ</span>
                    <input type="file" accept="image/*" onChange={onImageChange} hidden />
                  </label>
                )}
              </div>
            </>
          )}
        </div>

        <div className="quick-create-actions">
          <button type="button" className="btn-cancel-main" onClick={onClose}>
            ยกเลิก
          </button>
          <button type="button" className="btn-submit-main quick-create-submit" onClick={onSave} disabled={saving}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
