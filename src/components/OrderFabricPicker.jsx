import { useState } from "react";
import { FiPlusCircle, FiX } from "react-icons/fi";
import { addCategory, addColor, addFabricType } from "../api/fetch_api_superadmin";
import { useDialog } from "../context/DialogContext";
import "../styles/quickCreate.css";
import Select from "./Select";

const FIELDS = [
  { key: "type", idKey: "type_id", nameKey: "type_name", label: "ประเภทผ้า" },
  { key: "pattern", idKey: "category_id", nameKey: "category_name", label: "ลวดลาย" },
  { key: "color", idKey: "color_id", nameKey: "color_name", label: "สี" },
];

const NEW_OPTION = "__new";
const SPEC_OPTION = "__spec";

const sameSpec = (fabric, spec) =>
  String(fabric.type_id) === String(spec.type_id) &&
  String(fabric.category_id) === String(spec.category_id) &&
  String(fabric.color_id) === String(spec.color_id);

function NewFabricModal({ masters, onReloadMasters, onClose, onConfirm }) {
  const { showAlert } = useDialog();
  const [picked, setPicked] = useState({ type: "", pattern: "", color: "" });
  const [typed, setTyped] = useState({ type: "", pattern: "", color: "" });
  const [widthCm, setWidthCm] = useState("");
  const [saving, setSaving] = useState(false);

  const nameOf = (field) => {
    if (picked[field.key] === NEW_OPTION) return typed[field.key].trim();
    const item = masters[field.key].find(
      (m) => String(m[field.idKey]) === String(picked[field.key])
    );
    return item?.[field.nameKey] || "";
  };

  const previewName = FIELDS.map(nameOf).join("");

  const resolveId = async (field) => {
    if (picked[field.key] !== NEW_OPTION) return Number(picked[field.key]);

    const text = typed[field.key].trim();
    const existing = masters[field.key].find(
      (m) => m[field.nameKey]?.trim().toLowerCase() === text.toLowerCase()
    );
    if (existing) return Number(existing[field.idKey]);

    if (field.key === "type") {
      const formData = new FormData();
      formData.append("type_name", text);
      return Number((await addFabricType(formData)).type_id);
    }
    if (field.key === "pattern") return Number((await addCategory({ category_name: text })).category_id);
    return Number((await addColor({ color_name: text })).color_id);
  };

  const handleConfirm = async () => {
    const missing = FIELDS.find((field) => !nameOf(field));
    if (missing) {
      await showAlert(`กรุณาเลือก${missing.label}`);
      return;
    }
    if (!(Number(widthCm) > 0)) {
      await showAlert("กรุณากรอกหน้ากว้างของผ้า");
      return;
    }

    try {
      setSaving(true);
      const [typeId, categoryId, colorId] = [
        await resolveId(FIELDS[0]),
        await resolveId(FIELDS[1]),
        await resolveId(FIELDS[2]),
      ];
      if (FIELDS.some((field) => picked[field.key] === NEW_OPTION)) await onReloadMasters();

      onConfirm({
        type_id: typeId,
        category_id: categoryId,
        color_id: colorId,
        name: previewName,
        width_cm: Number(widthCm),
      });
    } catch (err) {
      console.error("เพิ่มผ้าที่สั่งซื้อไม่สำเร็จ:", err);
      await showAlert(err?.response?.data?.message || "บันทึกข้อมูลไม่สำเร็จ");
      setSaving(false);
    }
  };

  return (
    <div className="quick-create-overlay" onClick={onClose}>
      <div className="quick-create-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quick-create-header">
          <h3>เพิ่มผ้าที่สั่งซื้อ</h3>
          <button type="button" className="quick-create-close" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <div className="quick-create-body">
          {FIELDS.map((field) => (
            <div key={field.key} className="order-fabric-field">
              <label>{field.label}</label>
              <Select
                value={picked[field.key]}
                onChange={(e) => setPicked((prev) => ({ ...prev, [field.key]: e.target.value }))}
              >
                <option value="">เลือก{field.label}</option>
                {masters[field.key].map((m) => (
                  <option key={m[field.idKey]} value={m[field.idKey]}>
                    {m[field.nameKey]}
                  </option>
                ))}
                <option value={NEW_OPTION}>+ พิมพ์{field.label}ใหม่</option>
              </Select>
              {picked[field.key] === NEW_OPTION && (
                <input
                  type="text"
                  value={typed[field.key]}
                  onChange={(e) => setTyped((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={`ระบุ${field.label}`}
                  autoFocus
                />
              )}
            </div>
          ))}

          <div className="order-fabric-field">
            <label>หน้ากว้าง (ซม.) *</label>
            <input
              type="text"
              inputMode="decimal"
              value={widthCm}
              onChange={(e) => setWidthCm(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="เช่น 110"
            />
          </div>

          <div className="order-fabric-preview">
            <span>ชื่อผ้า</span>
            <strong>{previewName || "-"}</strong>
          </div>
        </div>

        <div className="quick-create-actions">
          <button type="button" className="btn-cancel-main" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            type="button"
            className="btn-submit-main quick-create-submit"
            onClick={handleConfirm}
            disabled={saving}
          >
            {saving ? "กำลังบันทึก..." : "ตกลง"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderFabricPicker({
  value,
  onChange,
  supplierFabrics,
  masters,
  onReloadMasters,
  disabled,
  locked,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const selectValue = value.fabricId ? String(value.fabricId) : value.spec ? SPEC_OPTION : "";
  const knownFabric = supplierFabrics.some((f) => String(f.fabric_id) === String(value.fabricId));

  const handleSelect = (e) => {
    const next = e.target.value;
    if (next === SPEC_OPTION) return;
    const fabric = supplierFabrics.find((f) => String(f.fabric_id) === next);
    onChange({ fabricId: next, fabricName: fabric?.fabric_name || "", spec: null });
  };

  const handleNewFabric = (spec) => {
    setModalOpen(false);
    const existing = supplierFabrics.find((f) => sameSpec(f, spec));
    if (existing) {
      onChange({ fabricId: String(existing.fabric_id), fabricName: existing.fabric_name, spec: null });
    } else {
      onChange({ fabricId: "", fabricName: spec.name, spec });
    }
  };

  return (
    <div className="order-fabric-picker">
      <Select value={selectValue} onChange={handleSelect} disabled={disabled || locked}>
        <option value="">{disabled ? "เลือกผู้จัดจำหน่ายก่อน" : "เลือกผ้า"}</option>
        {supplierFabrics.map((fabric) => (
          <option key={fabric.fabric_id} value={fabric.fabric_id}>
            {fabric.fabric_name}
          </option>
        ))}
        {value.fabricId && !knownFabric && (
          <option value={value.fabricId}>{value.fabricName || "ผ้าเดิม"}</option>
        )}
        {value.spec && <option value={SPEC_OPTION}>{value.spec.name} (ผ้าใหม่)</option>}
      </Select>
      {!locked && (
        <button
          type="button"
          className="add-orders-text-action"
          onClick={() => setModalOpen(true)}
          disabled={disabled}
        >
          <FiPlusCircle /> เพิ่มใหม่
        </button>
      )}

      {modalOpen && (
        <NewFabricModal
          masters={masters}
          onReloadMasters={onReloadMasters}
          onClose={() => setModalOpen(false)}
          onConfirm={handleNewFabric}
        />
      )}
    </div>
  );
}
