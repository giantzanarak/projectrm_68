import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getFabricRoll,
  editFabricRoll,
  getFabricTypes,
  getColors,
  getCategories,
  getSuppliers,
  getFabricImageUrl,
  getNextRollCode,
  getSupplierFabrics,
  addFabricType,
  addCategory,
  addColor,
} from "../api/fetch_api_superadmin";
import Select from "../components/Select";
import FabricQuickCreateModal from "../components/FabricQuickCreateModal";
import { MASTER } from "../utils/fabricSpec";
import ImageLightbox from "../components/ImageLightbox";
import { MeasureInput, UnitToggle } from "../components/MeasureUnit";
import { FABRIC_UNITS, widthExample, cmToUnit, formatLength, metersToCm, unitLabelOf, useFabricUnit } from "../utils/measureUnit";
import '../styles/EditFabric.css';
import {
  FiSave,
  FiInfo,
  FiBarChart2,
  FiImage,
  FiX,
  FiPlusCircle,
} from 'react-icons/fi';

const formatDateForInput = (value) => {
  if (!value) return "";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "";

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseOptionalId = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

const EditFabric = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [types, setTypes] = useState([]);
  const [colors, setColors] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [roll, setRoll] = useState(null);
  const [fabricName, setFabricName] = useState("");
  const [type, setType] = useState("");
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [codePreview, setCodePreview] = useState(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [unit, setUnit] = useFabricUnit();
  const unitLabel = unitLabelOf(unit);

  const [supplierFabrics, setSupplierFabrics] = useState([]);
  const [extraIds, setExtraIds] = useState({ type: [], pattern: [], color: [] });
  const [quickCreateTarget, setQuickCreateTarget] = useState(null);
  const [quickCreateValue, setQuickCreateValue] = useState("");
  const [isQuickCreating, setIsQuickCreating] = useState(false);
  const [quickCreateImageFile, setQuickCreateImageFile] = useState(null);
  const [quickCreateImagePreview, setQuickCreateImagePreview] = useState("");

  const loadMasters = async () => {
    const [t, col, cat, s] = await Promise.all([
      getFabricTypes(),
      getColors(),
      getCategories(),
      getSuppliers(),
    ]);
    setTypes(t);
    setColors(col);
    setPatterns(cat);
    setSuppliers(s);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rollData] = await Promise.all([getFabricRoll(id), loadMasters()]);

        setRoll(rollData);
        setFabricName(rollData.fabric_name || "");
        setType(String(rollData.type_id || ""));
        setColor(String(rollData.color_id || ""));
        setPattern(String(rollData.category_id || ""));
        setSupplierId(String(rollData.supplier_id || ""));
        setLotNumber(rollData.lot_number || "");
        setStorageLocation(rollData.storage_location || "");
        setWidthCm(rollData.width_cm != null ? String(Number(rollData.width_cm)) : "");
        setPurchaseDate(formatDateForInput(rollData.purchase_date));
        setImagePreview(getFabricImageUrl(rollData.image_path));

        const newSupplierId = location.state?.newSupplierId;
        if (newSupplierId && Number(rollData.is_used) !== 1 && !rollData.po_item_id) {
          setSupplierId(String(newSupplierId));
          setType("");
          setPattern("");
          setColor("");
        }
        if (location.state) navigate(location.pathname, { replace: true, state: null });

      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", err);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    setSupplierFabrics([]);
    if (!supplierId) return;
    let cancelled = false;
    getSupplierFabrics(supplierId)
      .then((rows) => { if (!cancelled) setSupplierFabrics(rows); })
      .catch((err) => console.error("โหลดผ้าของผู้จัดจำหน่ายไม่สำเร็จ:", err));
    return () => { cancelled = true; };
  }, [supplierId]);

  useEffect(() => {
    return () => {
      if (quickCreateImagePreview) URL.revokeObjectURL(quickCreateImagePreview);
    };
  }, [quickCreateImagePreview]);

  const specLockReason = !roll
    ? null
    : Number(roll.is_used) === 1
      ? "ม้วนนี้เริ่มใช้งานแล้ว (มีการตัด/เบิก หรือใบสั่งตัดเลือกม้วนนี้) จึงเปลี่ยนผู้จัดจำหน่าย ประเภทผ้า ลวดลาย และสีไม่ได้ ถ้าเลือกผิดให้ลบม้วนนี้แล้วเพิ่มใหม่"
      : roll.po_item_id
        ? "ม้วนนี้รับเข้าจากใบสั่งซื้อ ข้อมูลผู้จัดจำหน่าย ประเภทผ้า ลวดลาย และสีต้องตรงกับใบสั่งซื้อ จึงเปลี่ยนไม่ได้"
        : null;
  const canEditSpec = !!roll && !specLockReason;
  const specChanged =
    !!roll &&
    (supplierId !== String(roll.supplier_id || "") ||
      type !== String(roll.type_id || "") ||
      pattern !== String(roll.category_id || "") ||
      color !== String(roll.color_id || ""));

  useEffect(() => {
    if (!specChanged || !supplierId || !type || !pattern || !color) {
      setCodePreview(null);
      return;
    }
    let cancelled = false;
    getNextRollCode({ supplier_id: supplierId, type_id: type, category_id: pattern, color_id: color })
      .then((data) => !cancelled && setCodePreview(data))
      .catch((err) => {
        console.error("ดูรหัสม้วนใหม่ไม่สำเร็จ:", err);
        if (!cancelled) setCodePreview(null);
      });
    return () => { cancelled = true; };
  }, [specChanged, supplierId, type, pattern, color]);

  const resetSpec = () => {
    setSupplierId(String(roll.supplier_id || ""));
    setType(String(roll.type_id || ""));
    setPattern(String(roll.category_id || ""));
    setColor(String(roll.color_id || ""));
    setExtraIds({ type: [], pattern: [], color: [] });
  };

  const changeSupplier = (value) => {
    if (value === String(roll.supplier_id || "")) {
      resetSpec();
      return;
    }
    setSupplierId(value);
    setType("");
    setPattern("");
    setColor("");
    setExtraIds({ type: [], pattern: [], color: [] });
  };

  const masterList = { type: types, pattern: patterns, color: colors };
  const specValue = { type, pattern, color };
  const specSetter = { type: setType, pattern: setPattern, color: setColor };
  const rollSpecId = roll
    ? { type: roll.type_id, pattern: roll.category_id, color: roll.color_id }
    : {};

  const optionsFor = (target) => {
    const { idKey } = MASTER[target];
    const ids = new Set([
      ...supplierFabrics.map((f) => String(f[idKey])),
      ...extraIds[target],
      specValue[target],
    ]);
    if (roll && supplierId === String(roll.supplier_id || "")) ids.add(String(rollSpecId[target] ?? ""));
    return masterList[target].filter((item) => ids.has(String(item[idKey])));
  };

  const selectFor = (target, itemId) => {
    const value = String(itemId);
    setExtraIds((prev) => ({
      ...prev,
      [target]: prev[target].includes(value) ? prev[target] : [...prev[target], value],
    }));
    specSetter[target](value);
  };

  const clearQuickCreateImage = () => {
    setQuickCreateImageFile(null);
    setQuickCreateImagePreview("");
  };

  const openQuickCreate = (target) => {
    setQuickCreateTarget(target);
    setQuickCreateValue("");
    clearQuickCreateImage();
  };

  const closeQuickCreate = () => {
    setQuickCreateTarget(null);
    setQuickCreateValue("");
    setIsQuickCreating(false);
    clearQuickCreateImage();
  };

  const quickCreateSuggestions = useMemo(() => {
    if (!quickCreateTarget) return [];
    const { idKey, nameKey } = MASTER[quickCreateTarget];
    const used = new Set(optionsFor(quickCreateTarget).map((item) => String(item[idKey])));
    return masterList[quickCreateTarget]
      .filter((item) => !used.has(String(item[idKey])))
      .map((item) => ({ id: item[idKey], name: item[nameKey] }));
  }, [quickCreateTarget, types, patterns, colors, supplierFabrics, extraIds, supplierId, type, pattern, color]);

  const handleQuickCreate = async () => {
    const trimmedValue = quickCreateValue.trim();
    if (!trimmedValue) {
      await Swal.fire({ icon: "warning", title: "กรุณากรอกข้อมูลก่อนบันทึก", confirmButtonText: "ปิด" });
      return;
    }

    const target = quickCreateTarget;
    const { idKey, nameKey, label } = MASTER[target];

    const existing = masterList[target].find(
      (item) => item[nameKey]?.trim().toLowerCase() === trimmedValue.toLowerCase()
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

      await loadMasters();
      selectFor(target, created[idKey]);
      closeQuickCreate();
      await Swal.fire({
        icon: "success",
        title: "บันทึกข้อมูลสำเร็จ",
        text: `เพิ่ม${label} ${trimmedValue} เรียบร้อยแล้ว`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error("สร้างข้อมูลใหม่ไม่สำเร็จ:", err);
      setIsQuickCreating(false);
      await Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: err?.response?.data?.message || err?.message || "บันทึกข้อมูลไม่สำเร็จ",
        confirmButtonText: "ปิด",
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setRemoveExistingImage(false);
    setImagePreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setRemoveExistingImage(true);
    setImagePreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return "";
    });
  };

  const handleSave = async () => {
    const trimmedFabricName = fabricName.trim();
    const normalizedLotNumber = lotNumber.trim();
    const normalizedStorageLocation = storageLocation.trim();

    const payload = {
      fabric_name: trimmedFabricName,
      type_id: parseOptionalId(type),
      color_id: parseOptionalId(color),
      category_id: parseOptionalId(pattern),
      supplier_id: parseOptionalId(supplierId),
      lot_number: normalizedLotNumber || null,
      purchase_date: purchaseDate || null,
      storage_location: normalizedStorageLocation || null,
      width_cm: widthCm.trim(),
    };

    if (!(Number(widthCm) > 0)) {
      await Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกหน้ากว้างของผ้า",
        confirmButtonText: "ปิด",
      });
      return;
    }

    if (!trimmedFabricName || !payload.type_id || !payload.color_id || !payload.category_id) {
      await Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกชื่อผ้า ประเภทผ้า สี และลวดลายให้ครบก่อนบันทึก",
        confirmButtonText: "ปิด",
      });
      return;
    }

    if (specChanged) {
      const nameOf = (list, idKey, nameKey, value) =>
        list.find((x) => String(x[idKey]) === value)?.[nameKey] || "-";
      const { isConfirmed } = await Swal.fire({
        icon: "question",
        title: "ย้ายม้วนไปผ้าแบบใหม่?",
        html: `
          <div style="text-align:left;line-height:1.8">
            <div>ผู้จัดจำหน่าย: <b>${nameOf(suppliers, "supplier_id", "supplier_name", supplierId)}</b></div>
            <div>ประเภท / ลวดลาย / สี: <b>${nameOf(types, "type_id", "type_name", type)}
              · ${nameOf(patterns, "category_id", "category_name", pattern)}
              · ${nameOf(colors, "color_id", "color_name", color)}</b></div>
            <div style="margin-top:8px">รหัสม้วน: <s>${roll.roll_code}</s> → <b>${codePreview?.roll_code || "ออกรหัสใหม่ตอนบันทึก"}</b></div>
          </div>`,
        showCancelButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
      });
      if (!isConfirmed) return;
    }

    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value === null ? "" : value);
      });
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (removeExistingImage) {
        formData.append("removeImage", "true");
      }

      const result = await editFabricRoll(id, formData);
      const newCode = result?.roll_code || roll.roll_code;

      await Swal.fire({
        position: "center",
        icon: "success",
        title: "บันทึกข้อมูลสำเร็จ",
        text: newCode !== roll.roll_code
          ? `ย้ายม้วนผ้าเรียบร้อย รหัสใหม่คือ ${newCode}`
          : `อัปเดตข้อมูลม้วนผ้า ${roll.roll_code} เรียบร้อยแล้ว`,
        showConfirmButton: false,
        timer: 1500,
      });
      navigate(`/Fabric/detail/${id}`);

    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "ไม่สามารถอัปเดตข้อมูลม้วนผ้าได้";

      await Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: message,
        confirmButtonText: "ปิด",
      });
    }
  };

  if (!roll) return <div>Loading...</div>;

  return (
    <div className="edit-fabric-container">

      <div className="edit-header">
        <div className="header-left">
          <h2 className="edit-title">แก้ไขข้อมูลม้วนผ้า</h2>
          <p className="edit-subtitle">อัปเดตข้อมูลรายละเอียดผ้าในสต็อก</p>
        </div>
      </div>

      <div className="edit-content-grid">

        <div className="form-card main-info">
          <div className="measure-titlebar">
            <h3 className="section-title">ข้อมูลม้วนผ้า {roll.roll_code}</h3>
            <UnitToggle unit={unit} onChange={setUnit} units={FABRIC_UNITS} />
          </div>

          <div className="form-grid">

            <div className="input-group">
              <label>รหัสม้วน</label>
              <input
                type="text"
                value={roll.roll_code}
                readOnly
                className="input-disabled"
              />
            </div>

            <div className="input-group">
              <label>ชื่อผ้า</label>
              <input
                type="text"
                value={specChanged ? (codePreview?.fabric_name || "") : fabricName}
                onChange={(e) => setFabricName(e.target.value)}
                placeholder={specChanged ? "ตั้งชื่ออัตโนมัติจากประเภท ลวดลาย และสี" : "ระบุชื่อผ้า"}
                readOnly={specChanged}
                className={specChanged ? "input-disabled" : undefined}
              />
            </div>

            <div className="input-group">
              <label>หน้ากว้าง ({unitLabel}) *</label>
              <MeasureInput
                cm={widthCm}
                unit={unit}
                onChange={(v) => setWidthCm(v)}
                placeholder={widthExample(unit)}
              />
            </div>

            <div className="input-group full-width">
              <label>รูปภาพผ้า</label>
              <div className="fabric-image-upload">
                {imagePreview ? (
                  <div className="fabric-image-preview">
                    <button type="button" className="zoomable-img" title="คลิกเพื่อดูรูปขยาย" onClick={() => setZoomOpen(true)}>
                      <img src={imagePreview} alt="รูปผ้า" />
                    </button>
                    <button
                      type="button"
                      className="fabric-image-remove"
                      onClick={handleRemoveImage}
                    >
                      <FiX size={14} /> ลบรูป
                    </button>
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

            {canEditSpec ? (
              <>
                <div className="input-group">
                  <div className="label-with-action">
                    <label>ผู้จัดจำหน่าย</label>
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={() => navigate("/Supplier/add", { state: { returnTo: `/Fabric/edit/${id}` } })}
                    >
                      <FiPlusCircle /> เพิ่มใหม่
                    </button>
                  </div>
                  <Select value={supplierId} onChange={(e) => changeSupplier(e.target.value)}>
                    <option value="">เลือกผู้จัดจำหน่าย</option>
                    {suppliers.map((s) => (
                      <option key={s.supplier_id} value={String(s.supplier_id)}>{s.supplier_name}</option>
                    ))}
                  </Select>
                </div>

                {["type", "pattern", "color"].map((target) => {
                  const { idKey, nameKey, label } = MASTER[target];
                  const options = optionsFor(target);
                  return (
                    <div className="input-group" key={target}>
                      <div className="label-with-action">
                        <label>{label}</label>
                        <button
                          type="button"
                          className="btn-text-action"
                          onClick={() => openQuickCreate(target)}
                          disabled={!supplierId}
                        >
                          <FiPlusCircle /> เพิ่มใหม่
                        </button>
                      </div>
                      <Select
                        value={specValue[target]}
                        onChange={(e) => specSetter[target](e.target.value)}
                        disabled={!supplierId}
                      >
                        <option value="">
                          {!supplierId
                            ? "เลือกผู้จัดจำหน่ายก่อน"
                            : options.length
                              ? `เลือก${label}`
                              : `ร้านนี้ยังไม่มี${label}`}
                        </option>
                        {options.map((item) => (
                          <option key={item[idKey]} value={String(item[idKey])}>{item[nameKey]}</option>
                        ))}
                      </Select>
                    </div>
                  );
                })}
              </>
            ) : (
              [
                ["ผู้จัดจำหน่าย", supplierId, suppliers, "supplier_id", "supplier_name"],
                ["ประเภทผ้า", type, types, "type_id", "type_name"],
                ["ลวดลาย", pattern, patterns, "category_id", "category_name"],
                ["สี", color, colors, "color_id", "color_name"],
              ].map(([label, value, list, idKey, nameKey]) => (
                <div className="input-group" key={label}>
                  <label>{label}</label>
                  <input
                    type="text"
                    value={list.find((x) => String(x[idKey]) === value)?.[nameKey] || "-"}
                    readOnly
                    className="input-disabled"
                  />
                </div>
              ))
            )}
            {specLockReason ? (
              <p className="locked-spec-hint full-width">{specLockReason}</p>
            ) : specChanged ? (
              <div className="spec-change-preview full-width">
                <div>
                  รหัสม้วนจะเปลี่ยนจาก <s>{roll.roll_code}</s> เป็น{" "}
                  <b>{codePreview?.roll_code || "…"}</b>
                </div>
                <div className="spec-change-sub">
                  {codePreview
                    ? codePreview.is_new_fabric
                      ? "ยังไม่มีผ้าแบบนี้ของร้านนี้ ระบบจะสร้างผ้าใหม่ให้ (ใช้รูปและหน้ากว้างเดิม)"
                      : `ย้ายไปรวมกับผ้าที่มีอยู่แล้ว: ${codePreview.fabric_name}`
                    : "เลือกให้ครบทั้ง 4 ช่อง"}
                </div>
                <button type="button" className="spec-change-reset" onClick={resetSpec}>
                  คืนค่าเดิม
                </button>
              </div>
            ) : (
              <p className="locked-spec-hint full-width">
                ม้วนนี้ยังไม่เริ่มใช้งาน เปลี่ยนผู้จัดจำหน่าย ประเภทผ้า ลวดลาย และสีได้ ระบบจะออกรหัสม้วนใหม่ให้
              </p>
            )}

            <div className="input-group">
              <label>รหัสล็อต</label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="เช่น LOT-20260321-001"
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

            <div className="input-group full-width">
              <label>คลังที่จัดเก็บ</label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="ระบุสถานที่จัดเก็บ"
              />
            </div>

          </div>
        </div>

        <div className="side-column">

          <div className="form-card">
            <div className="measure-titlebar">
              <h3 className="section-title">ข้อมูลต้นทุน</h3>
              <UnitToggle unit={unit} onChange={setUnit} units={FABRIC_UNITS} />
            </div>

            <div className="info-banner">
              <FiInfo className="info-icon" />
              <p>ไม่สามารถแก้ไขข้อมูลต้นทุนหลังมีการใช้งานแล้ว เพื่อรักษาความถูกต้องของข้อมูลบัญชี</p>
            </div>

            <div className="form-grid">
              <div className="input-group">
                <label>ความยาวเริ่มต้น ({unitLabel})</label>
                <div className="unit-input">
                  <input
                    type="text"
                    value={cmToUnit(metersToCm(roll.initial_length), unit)}
                    readOnly
                  />
                  <span className="unit-label">{unitLabel}</span>
                </div>
              </div>
              <div className="input-group">
                <label>ราคาซื้อต่อเมตร</label>
                <div className="unit-input">
                  <input
                    type="text"
                    value={Number(roll.cost_per_meter).toFixed(2)}
                    readOnly
                  />
                  <span className="unit-label">฿</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-card">
            <h3 className="section-title status-blue">
              <FiBarChart2 /> สรุปสถานะสต็อกในปัจจุบัน
            </h3>

            <div className="status-stats">
              <div className="stat-item">
                <span className="stat-label">ใช้ไปแล้ว</span>
                <span className="stat-value">
                  {formatLength(metersToCm(roll.initial_length - roll.remaining_length), unit)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">คงเหลือ</span>
                <span className="stat-value text-green">
                  {formatLength(metersToCm(roll.remaining_length), unit)}
                </span>
              </div>
            </div>

            <div className="value-highlight">
              <span className="value-label">มูลค่าคงเหลือ</span>
              <div className="value-amount">
                ฿ {(roll.remaining_length * roll.cost_per_meter).toLocaleString()}
              </div>
            </div>

            <p className="status-footer">
              <FiInfo /> หากต้องการปรับจำนวนผ้า กรุณาใช้เมนู บันทึกการใช้ผ้า
            </p>
          </div>

        </div>
      </div>

      <ImageLightbox
        src={zoomOpen ? imagePreview : null}
        alt={fabricName || "ผ้า"}
        caption={[roll.roll_code, fabricName].filter(Boolean).join(" · ")}
        onClose={() => setZoomOpen(false)}
      />

      {quickCreateTarget && (
        <FabricQuickCreateModal
          title={`เพิ่ม${MASTER[quickCreateTarget].label}`}
          label={MASTER[quickCreateTarget].label}
          suggestions={quickCreateSuggestions}
          onPick={(pickedId) => { selectFor(quickCreateTarget, pickedId); closeQuickCreate(); }}
          value={quickCreateValue}
          onChange={setQuickCreateValue}
          onClose={closeQuickCreate}
          onSave={handleQuickCreate}
          saving={isQuickCreating}
          showImage={quickCreateTarget === "type"}
          imagePreview={quickCreateImagePreview}
          onImageChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setQuickCreateImageFile(file);
            setQuickCreateImagePreview(URL.createObjectURL(file));
          }}
          onImageRemove={clearQuickCreateImage}
        />
      )}

      <div className="edit-actions">
        <button className="btn-edit-cancel" onClick={() => navigate(-1)}>
          ยกเลิก
        </button>
        <button className="btn-save" onClick={handleSave}>
          <FiSave /> บันทึกการแก้ไข
        </button>
      </div>

    </div>
  );
};

export default EditFabric;
