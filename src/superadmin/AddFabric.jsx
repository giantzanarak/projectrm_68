import { useState, useEffect, useMemo } from 'react';
import Swal from "sweetalert2";
import {
  receiveFabricRoll,
  getSupplierFabrics,
  getNextRollCode,
  getFabricRolls,
  getFabricImageUrl,
  addFabricType,
  addCategory,
  addColor,
  getSuppliers,
  getFabricTypes,
  getCategories,
  getColors
} from "../api/fetch_api_superadmin";
import { useDialog } from "../context/DialogContext";

import { useLocation, useNavigate } from "react-router-dom";
import '../styles/AddFabric.css';
import {
  FiSave,
  FiPlusCircle,
  FiImage,
  FiX
} from 'react-icons/fi';
import Select from "../components/Select";
import FabricQuickCreateModal from "../components/FabricQuickCreateModal";
import { MASTER } from "../utils/fabricSpec";
import ImageLightbox from "../components/ImageLightbox";
import { MeasureInput, UnitToggle } from "../components/MeasureUnit";
import {
  FABRIC_UNITS, widthExample, unitNameOf, cmToMeters, cmToUnit, metersToCm, unitLabelOf, useFabricUnit,
} from "../utils/measureUnit";

// ช่องตัวเลขแบบพิมพ์เอง: รับแค่ตัวเลขกับจุดทศนิยม 1 จุด ทศนิยมไม่เกิน 2 หลัก
const toDecimalInput = (raw) => {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
};

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const AddFabric = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert, showConfirm } = useDialog();

  // ข้อมูลหลักทั้งระบบ
  const [types, setTypes] = useState([]);
  const [colors, setColors] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [storageOptions, setStorageOptions] = useState([]);

  // ผ้าที่ผู้จัดจำหน่ายที่เลือกเคยมี + ค่าที่เพิ่งกด "เพิ่มใหม่" ให้ร้านนี้
  const [supplierFabrics, setSupplierFabrics] = useState([]);
  const [extraIds, setExtraIds] = useState({ type: [], pattern: [], color: [] });

  // กลับมาจากหน้าเพิ่มผู้จัดจำหน่าย → เลือกร้านที่เพิ่งเพิ่มให้เลย
  const [supplierId, setSupplierId] = useState(
    location.state?.newSupplierId ? String(location.state.newSupplierId) : ""
  );
  const [type, setType] = useState("");
  const [pattern, setPattern] = useState("");
  const [color, setColor] = useState("");
  const [nextCode, setNextCode] = useState(null);

  const [initialLength, setInitialLength] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(todayStr);
  const [widthCm, setWidthCm] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  // หน้ากว้างเก็บเป็นซม. ความยาวม้วนเก็บเป็นเมตร → แสดง/กรอกตามหน่วยที่เลือก
  const [unit, setUnit] = useFabricUnit();
  const unitLabel = unitLabelOf(unit);

  const [quickCreateTarget, setQuickCreateTarget] = useState(null);
  const [quickCreateValue, setQuickCreateValue] = useState("");
  const [isQuickCreating, setIsQuickCreating] = useState(false);
  const [quickCreateImageFile, setQuickCreateImageFile] = useState(null);
  const [quickCreateImagePreview, setQuickCreateImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      if (quickCreateImagePreview) URL.revokeObjectURL(quickCreateImagePreview);
    };
  }, [quickCreateImagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
  };

  const handleQuickCreateImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQuickCreateImageFile(file);
    setQuickCreateImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleQuickCreateImageRemove = () => {
    setQuickCreateImageFile(null);
    setQuickCreateImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
  };

  const loadData = async () => {
    try {
      const [t, c, col, s] = await Promise.all([
        getFabricTypes(),
        getCategories(),
        getColors(),
        getSuppliers(),
      ]);

      setTypes(t);
      setPatterns(c);
      setColors(col);
      setSuppliers(s);
    } catch (err) {
      console.error("โหลด dropdown ไม่สำเร็จ:", err);
    }
  };

  useEffect(() => {
    loadData();
    // คลังที่เคยใช้ — ให้เลือกได้โดยไม่ต้องพิมพ์
    getFabricRolls()
      .then((rolls) => {
        const locations = rolls.map((r) => r.storage_location?.trim()).filter(Boolean);
        setStorageOptions([...new Set(locations)]);
      })
      .catch(() => {});
  }, []);

  // เปลี่ยนผู้จัดจำหน่าย → ล้างค่าที่เลือก แล้วโหลดผ้าที่ร้านนี้เคยมี
  useEffect(() => {
    setType("");
    setPattern("");
    setColor("");
    setExtraIds({ type: [], pattern: [], color: [] });
    setSupplierFabrics([]);
    if (!supplierId) return;

    let cancelled = false;
    getSupplierFabrics(supplierId)
      .then((rows) => { if (!cancelled) setSupplierFabrics(rows); })
      .catch((err) => console.error("โหลดผ้าของผู้จัดจำหน่ายไม่สำเร็จ:", err));
    return () => { cancelled = true; };
  }, [supplierId]);

  // ครบ 4 ช่อง → ถามรหัสถัดไปจาก server (ผ้าเดิมของร้าน = ล็อตถัดไป)
  useEffect(() => {
    setNextCode(null);
    if (!supplierId || !type || !pattern || !color) return;

    let cancelled = false;
    getNextRollCode({ supplier_id: supplierId, type_id: type, category_id: pattern, color_id: color })
      .then((data) => { if (!cancelled) setNextCode(data); })
      .catch((err) => console.error("ดึงรหัสถัดไปไม่สำเร็จ:", err));
    return () => { cancelled = true; };
  }, [supplierId, type, pattern, color]);

  const masterList = { type: types, pattern: patterns, color: colors };

  // ตัวเลือกของแต่ละช่อง = ค่าที่ร้านนี้เคยมี + ค่าที่เพิ่งเพิ่มให้ร้านนี้
  const optionsFor = (target) => {
    const { idKey } = MASTER[target];
    const ids = new Set([
      ...supplierFabrics.map((f) => String(f[idKey])),
      ...extraIds[target],
    ]);
    return masterList[target].filter((item) => ids.has(String(item[idKey])));
  };

  const typeOptions = optionsFor("type");
  const patternOptions = optionsFor("pattern");
  const colorOptions = optionsFor("color");

  const nameOf = (target, id) => {
    const { idKey, nameKey } = MASTER[target];
    return masterList[target].find((item) => String(item[idKey]) === String(id))?.[nameKey] || "";
  };

  // ชื่อผ้า: ผ้าเดิมของร้านใช้ชื่อเดิม / ผ้าใหม่ = ประเภทผ้า + ลวดลาย + สี
  const autoFabricName = useMemo(() => {
    if (nextCode?.fabric_name) return nextCode.fabric_name;
    return [nameOf("type", type), nameOf("pattern", pattern), nameOf("color", color)]
      .filter(Boolean)
      .join("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextCode, type, pattern, color, types, patterns, colors]);

  // ผ้าเดิมที่มีหน้ากว้างอยู่แล้ว → แสดงค่าเดิม ไม่ต้องกรอกซ้ำ (แก้ได้ที่หน้าแก้ไขม้วนผ้า)
  const savedWidth = nextCode?.width_cm;
  const widthLocked = savedWidth != null;

  const existingImageUrl = nextCode?.image_path ? getFabricImageUrl(nextCode.image_path) : "";
  const shownImage = imagePreview || existingImageUrl;

  const length       = Number(initialLength || 0);
  const totalPrice   = Number(purchasePrice || 0);
  const costPerMeter = length > 0 ? (totalPrice / length) : 0;

  const handleSave = async () => {
    if (!supplierId || !type || !pattern || !color) {
      await showAlert("กรุณาเลือก ผู้จัดจำหน่าย ประเภทผ้า ลวดลาย และสี ให้ครบ");
      return;
    }
    // หน้ากว้างใช้คำนวณว่าผ้าพอตัดชุดไหม → ต้องมีเสมอ (ผ้าเดิมที่มีแล้วใช้ค่าเดิม)
    if (!widthLocked && !(Number(widthCm) > 0)) {
      await showAlert("กรุณากรอกหน้ากว้างของผ้า");
      return;
    }
    if (!(length > 0) || purchasePrice === "") {
      await showAlert("กรุณากรอกความยาวและราคาซื้อของม้วนผ้า");
      return;
    }

    const confirmed = await showConfirm("ต้องการบันทึกม้วนผ้านี้ใช่หรือไม่?", {
      title: "ยืนยันการบันทึก",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });

    if (!confirmed) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("supplier_id", Number(supplierId));
      formData.append("type_id", Number(type));
      formData.append("category_id", Number(pattern));
      formData.append("color_id", Number(color));
      formData.append("fabric_name", autoFabricName);
      if (!widthLocked) formData.append("width_cm", widthCm);
      formData.append("initial_length", length);
      formData.append("purchase_total_price", totalPrice);
      formData.append("purchase_date", purchaseDate);
      formData.append("storage_location", storageLocation.trim());
      if (imageFile) formData.append("image", imageFile);

      const result = await receiveFabricRoll(formData);

      await showAlert(`เพิ่มม้วนผ้าสำเร็จ\nรหัสม้วน ${result.roll_code}`);
      navigate("/Fabric");

    } catch (err) {
      console.error(err);
      await showAlert(err?.response?.data?.message || "เกิดข้อผิดพลาด");
      setSaving(false);
    }
  };

  const openQuickCreate = (target) => {
    setQuickCreateTarget(target);
    setQuickCreateValue("");
    handleQuickCreateImageRemove();
  };

  const closeQuickCreate = () => {
    setQuickCreateTarget(null);
    setQuickCreateValue("");
    setIsQuickCreating(false);
    handleQuickCreateImageRemove();
  };

  const selectFor = (target, id) => {
    const value = String(id);
    setExtraIds((prev) => ({
      ...prev,
      [target]: prev[target].includes(value) ? prev[target] : [...prev[target], value],
    }));
    if (target === "type") setType(value);
    if (target === "pattern") setPattern(value);
    if (target === "color") setColor(value);
  };

  // ค่าในระบบที่ร้านนี้ยังไม่เคยมี — กดเลือกได้เลยไม่ต้องพิมพ์
  const quickCreateSuggestions = useMemo(() => {
    if (!quickCreateTarget) return [];
    const { idKey, nameKey } = MASTER[quickCreateTarget];
    const used = new Set(optionsFor(quickCreateTarget).map((item) => String(item[idKey])));
    return masterList[quickCreateTarget]
      .filter((item) => !used.has(String(item[idKey])))
      .map((item) => ({ id: item[idKey], name: item[nameKey] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickCreateTarget, types, patterns, colors, supplierFabrics, extraIds]);

  const handleQuickPick = (id) => {
    selectFor(quickCreateTarget, id);
    closeQuickCreate();
  };

  const handleQuickCreate = async () => {
    const trimmedValue = quickCreateValue.trim();

    if (!trimmedValue) {
      await showAlert("กรุณากรอกข้อมูลก่อนบันทึก");
      return;
    }

    const target = quickCreateTarget;
    const { idKey, nameKey, label } = MASTER[target];

    // มีชื่อนี้ในระบบแล้ว → เลือกค่าเดิม ไม่สร้างซ้ำ
    const normalizedValue = trimmedValue.toLowerCase();
    const existing = masterList[target].find(
      (item) => item[nameKey]?.trim().toLowerCase() === normalizedValue
    );
    if (existing) {
      selectFor(target, existing[idKey]);
      closeQuickCreate();
      return;
    }

    try {
      setIsQuickCreating(true);

      let created;
      if (target === "type") {
        const typeFormData = new FormData();
        typeFormData.append("type_name", trimmedValue);
        if (quickCreateImageFile) typeFormData.append("image", quickCreateImageFile);
        created = await addFabricType(typeFormData);
      }
      if (target === "color") created = await addColor({ color_name: trimmedValue });
      if (target === "pattern") created = await addCategory({ category_name: trimmedValue });

      await loadData();
      selectFor(target, created[idKey]);

      closeQuickCreate();
      await Swal.fire({
        position: "center",
        icon: "success",
        title: "บันทึกข้อมูลสำเร็จ",
        text: `เพิ่ม${label} ${trimmedValue} เรียบร้อยแล้ว`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.error("สร้างข้อมูลใหม่ไม่สำเร็จ:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "บันทึกข้อมูลไม่สำเร็จ";
      await showAlert(message);
      setIsQuickCreating(false);
    }
  };

  const renderMasterSelect = (target, value, options, disabled) => {
    const { idKey, nameKey, label } = MASTER[target];
    const setter = { type: setType, pattern: setPattern, color: setColor }[target];

    return (
      <div className="input-group">
        <div className="label-with-action">
          <label>{label} <span className="required-mark">*</span></label>
          <button
            type="button"
            className="btn-text-action"
            onClick={() => openQuickCreate(target)}
            disabled={disabled}
          >
            <FiPlusCircle /> เพิ่มใหม่
          </button>
        </div>
        <Select value={value} onChange={(e) => setter(e.target.value)} disabled={disabled}>
          <option value="">
            {disabled
              ? "เลือกผู้จัดจำหน่ายก่อน"
              : options.length
                ? `เลือก${label}`
                : `ร้านนี้ยังไม่มี${label} — กด "เพิ่มใหม่"`}
          </option>
          {options.map((item) => (
            <option key={item[idKey]} value={item[idKey]}>
              {item[nameKey]}
            </option>
          ))}
        </Select>
      </div>
    );
  };

  const specComplete = supplierId && type && pattern && color;

  return (
    <div className="add-fabric-page">

      <div className="add-fabric-header">
        <h1>เพิ่มม้วนผ้า</h1>
        <p>บันทึกการรับม้วนผ้าเข้าคลังใหม่เพื่อการติดตามสต็อกที่แม่นยำ</p>
      </div>

      <div className="add-fabric-content">

        <div className="form-main-column">

          <div className="form-section-card">

            <h3 className="section-title">ข้อมูลผ้า</h3>

            <div className="form-grid">

              <div className="input-group full-width">
                <div className="label-with-action">
                  <label>ผู้จัดจำหน่าย <span className="required-mark">*</span></label>
                  <button
                    type="button"
                    className="btn-text-action"
                    onClick={() => navigate("/Supplier/add", { state: { returnTo: "/Fabric/add" } })}
                  >
                    <FiPlusCircle /> เพิ่มใหม่
                  </button>
                </div>

                <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  <option value="">เลือกผู้จัดจำหน่าย</option>
                  {suppliers.map((s) => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                      {s.supplier_name}
                    </option>
                  ))}
                </Select>
              </div>

              {renderMasterSelect("type", type, typeOptions, !supplierId)}
              {renderMasterSelect("pattern", pattern, patternOptions, !supplierId)}
              {renderMasterSelect("color", color, colorOptions, !supplierId)}

              <div className="input-group">
                <label>ชื่อผ้า</label>
                <input
                  type="text"
                  className="input-readonly"
                  value={autoFabricName}
                  placeholder="เลือกข้อมูลผ้าให้ครบ"
                  readOnly
                />
                {specComplete && nextCode && !nextCode.is_new_fabric && (
                  <small className="field-hint">
                    {`ร้านนี้เคยมีผ้านี้แล้ว — จะเป็นล็อตที่ ${nextCode.lot_no}`}
                  </small>
                )}
              </div>

              <div className="input-group full-width">
                <label>รูปภาพผ้า (ไม่บังคับ)</label>
                <div className="fabric-image-upload">
                  {shownImage ? (
                    <div className="fabric-image-preview">
                      <button type="button" className="zoomable-img" title="คลิกเพื่อดูรูปขยาย" onClick={() => setZoomOpen(true)}>
                        <img src={shownImage} alt="ตัวอย่างผ้า" />
                      </button>
                      {imagePreview ? (
                        <button
                          type="button"
                          className="fabric-image-remove"
                          onClick={handleRemoveImage}
                        >
                          <FiX size={14} /> ลบรูป
                        </button>
                      ) : (
                        <label className="fabric-image-remove">
                          <FiImage size={14} /> เปลี่ยนรูป
                          <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                        </label>
                      )}
                    </div>
                  ) : (
                    <label className="fabric-image-dropzone">
                      <FiImage size={22} />
                      <span>คลิกเพื่ออัปโหลดรูปภาพผ้า</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                      />
                    </label>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="form-section-card">

            <div className="measure-titlebar">
              <h3 className="section-title">ข้อมูลล็อตและต้นทุน</h3>
              <UnitToggle unit={unit} onChange={setUnit} units={FABRIC_UNITS} />
            </div>

            <div className="form-grid">

              <div className="input-group">
                <label>รหัสล็อต</label>
                <input
                  type="text"
                  className="input-readonly"
                  value={nextCode?.lot_number || ""}
                  placeholder="เลือกข้อมูลผ้าให้ครบ"
                  readOnly
                />
              </div>

              <div className="input-group">
                <label>รหัสม้วน</label>
                <input
                  type="text"
                  className="input-readonly"
                  value={nextCode?.roll_code || ""}
                  placeholder="เลือกข้อมูลผ้าให้ครบ"
                  readOnly
                />
              </div>

              <div className="input-group">
                <label>หน้ากว้าง ({unitLabel}) <span className="required-mark">*</span></label>
                {widthLocked ? (
                  <input type="text" className="input-readonly" value={cmToUnit(savedWidth, unit)} readOnly />
                ) : (
                  <MeasureInput
                    cm={widthCm}
                    unit={unit}
                    onChange={(v) => setWidthCm(v)}
                    placeholder={widthExample(unit)}
                  />
                )}
              </div>

              <div className="input-group">
                <label>ความยาวเริ่มต้น ({unitLabel}) <span className="required-mark">*</span></label>
                <MeasureInput
                  cm={metersToCm(initialLength)}
                  unit={unit}
                  onChange={(v) => setInitialLength(cmToMeters(v))}
                  placeholder="ระบุความยาว"
                />
              </div>

              <div className="input-group">
                <label>ราคาซื้อรวมทั้งม้วน (บาท) <span className="required-mark">*</span></label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(toDecimalInput(e.target.value))}
                  placeholder="ระบุราคาซื้อทั้งม้วน"
                />
              </div>

              <div className="input-group">
                <label>วันที่ซื้อ</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>คลังที่จัดเก็บ</label>
                <input
                  type="text"
                  list="storage-location-options"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  placeholder="เลือกหรือระบุสถานที่จัดเก็บ"
                />
                <datalist id="storage-location-options">
                  {storageOptions.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>

            </div>
          </div>

        </div>

        <div className="form-side-column">

          <div className="summary-sticky-card">

            <h3 className="section-title">สรุปข้อมูลล็อต</h3>

            <div className="summary-row">
              <span>รหัสผ้า</span>
              <span className="font-bold">{nextCode?.fabric_code || "-"}</span>
            </div>

            <div className="summary-row">
              <span>ความยาวรวม</span>
              <span className="font-bold">
                {cmToUnit(metersToCm(length), unit)} <small>{unitNameOf(unit)}</small>
              </span>
            </div>

            <div className="summary-row">
              <span>ราคาต่อเมตร (คำนวณ)</span>
              <span className="font-bold">
                {costPerMeter.toFixed(2)} <small>บาท/เมตร</small>
              </span>
            </div>

            <div className="total-value-box">
              <span className="total-label">ราคาซื้อรวมทั้งม้วน</span>
              <div className="total-amount">
                 {totalPrice.toLocaleString()}
              </div>
              <span className="total-subtext">ระบุจากข้อมูลต้นทุนรวม</span>
            </div>

            <div className="side-actions">

              <button className="btn-submit-main" onClick={handleSave} disabled={saving}>
                <FiSave /> {saving ? "กำลังบันทึก..." : "บันทึกม้วนผ้า"}
              </button>

              <button className="btn-cancel-main" onClick={() => navigate(-1)}>
                ยกเลิก
              </button>

            </div>

          </div>

        </div>

      </div>

      <ImageLightbox
        src={zoomOpen ? shownImage : null}
        alt={autoFabricName || "ผ้า"}
        caption={[nextCode?.roll_code, autoFabricName].filter(Boolean).join(" · ")}
        onClose={() => setZoomOpen(false)}
      />

      {quickCreateTarget && (
        <FabricQuickCreateModal
          title={`เพิ่ม${MASTER[quickCreateTarget].label}`}
          label={MASTER[quickCreateTarget].label}
          suggestions={quickCreateSuggestions}
          onPick={handleQuickPick}
          value={quickCreateValue}
          onChange={setQuickCreateValue}
          onClose={closeQuickCreate}
          onSave={handleQuickCreate}
          saving={isQuickCreating}
          showImage={quickCreateTarget === "type"}
          imagePreview={quickCreateImagePreview}
          onImageChange={handleQuickCreateImageChange}
          onImageRemove={handleQuickCreateImageRemove}
        />
      )}
    </div>
  );
};

export default AddFabric;
