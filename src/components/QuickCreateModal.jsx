import { FiX } from "react-icons/fi";
import "../styles/quickCreate.css";

export default function QuickCreateModal({
  title,
  label,
  value,
  onChange,
  onClose,
  onSave,
  saving,
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
          <label>{label}</label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`ระบุ${label}`}
            onKeyDown={(e) => { if (e.key === "Enter") onSave(); }}
            autoFocus
          />
        </div>

        <div className="quick-create-actions">
          <button type="button" className="btn-cancel-main" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            type="button"
            className="btn-submit-main quick-create-submit"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
