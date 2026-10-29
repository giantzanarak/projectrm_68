import { useEffect, useRef, useState } from "react";
import { onlyDigits, isValidOptionalPhone, PHONE_HINT } from "../utils/phone";
import { useLocation, useNavigate } from "react-router-dom";
import { FiCheck, FiFileText, FiImage, FiPlus, FiX } from "react-icons/fi";
import { useDialog } from "../context/DialogContext";
import { useAuth } from "../context/AuthContext";
import {
  getFabricRolls, getFabricTypes, getColors, getCategories,
  addFabricType, addColor, addCategory,
} from "../api/fetch_api_superadmin";
import { createTailoringOrder } from "../api/fetch_api_admin";
import QuickCreateModal from "../components/QuickCreateModal";
import { MeasureInput, UnitToggle } from "../components/MeasureUnit";
import { useMeasureUnit, unitLabelOf, seamHint } from "../utils/measureUnit";
import "../css/AddTailoringOrders.css";
import Select from "../components/Select";

export const GARMENT_TYPES = [
  { key: "shirt", label: "เสื้อ", subtypes: ["เชิ้ต", "เสื้อคอกลม", "เสื้อผ้าไทย"] },
  { key: "pants", label: "กางเกง", subtypes: ["ขายาว", "ขาสั้น", "ขากระบอก"] },
  { key: "skirt", label: "กระโปรง", subtypes: [] },
  { key: "suit", label: "สูท", subtypes: [] },
  { key: "sinskirt", label: "ซิ่น", subtypes: ["ซิ่นสำเร็จ", "ซิ่นป้าย", "ต่อหัวซิ่น–ตีนซิ่น"] },
  { key: "traditional", label: "ชุดผ้าพื้นเมือง (เสื้อ+ซิ่น+สไบ)", subtypes: [] },
];
export const garmentLabel = (key) => GARMENT_TYPES.find((g) => g.key === key)?.label || "";

const SHIRT_FIELDS = [
  ["chest", "รอบอก"],
  ["waist", "รอบเอว"],
  ["hip", "รอบสะโพก"],
  ["shoulder", "ไหล่"],
  ["shirtLength", "ความยาวเสื้อ"],
  ["sleeveLength", "ความยาวแขน"],
  ["armCircum", "รอบแขน"],
  ["armholeCircum", "รอบวงแขน"],
  ["neckCircum", "รอบคอ"],
];
const PANTS_FIELDS = [
  ["waist", "เอว"],
  ["hip", "สะโพก"],
  ["thigh", "ต้นขา"],
  ["legOpening", "ปลายขา"],
  ["inseam", "ความยาวขาใน"],
  ["outseam", "ความยาวขานอก"],
  ["crotch", "เป้า"],
];
const SKIRT_FIELDS = [
  ["waist", "เอว"],
  ["hip", "สะโพก"],
  ["length", "ความยาว"],
  ["hemCircum", "รอบชายกระโปรง"],
];
const SUIT_EXTRA_FIELDS = [
  ["backLength", "ความยาวหลัง"],
  ["backShoulder", "ระยะไหล่หลัง"],
  ["bustUnderArm", "รอบอกใต้รักแร้"],
];

export const MEASUREMENT_FIELDS = {
  shirt: SHIRT_FIELDS,
  pants: PANTS_FIELDS,
  skirt: SKIRT_FIELDS,
  sinskirt: SKIRT_FIELDS,
  suit: [...SHIRT_FIELDS, ...SUIT_EXTRA_FIELDS],
  traditional: [...SHIRT_FIELDS, ...SKIRT_FIELDS],
};

export const SEAM_ALLOWANCE_ROWS = [
  { key: "sideSeamShirt", label: "ตะเข็บข้างเสื้อ", recommendCm: [2.5, 3], perSide: true },
  { key: "centerBackSeam", label: "ตะเข็บกลางหลัง", recommendCm: [3, 4] },
  { key: "sideSeamPantsSkirt", label: "ตะเข็บข้างกางเกง/กระโปรง", recommendCm: [2.5, 3], perSide: true },
  { key: "crotchSeam", label: "ตะเข็บเป้ากางเกง", recommendCm: [4, 5] },
  { key: "waistband", label: "ขอบเอว", recommendCm: [3, 5] },
  { key: "shirtHem", label: "ชายเสื้อ", recommendCm: [3, 4] },
  { key: "pantsSkirtHem", label: "ชายกางเกง/กระโปรง", recommendCm: [4, 5] },
  { key: "sleeveHem", label: "ชายแขน", recommendCm: [3, 4] },
];

export const ORDER_STATUSES = ["วัดตัว", "กำลังตัด", "รอลองชุด", "รอแก้ไข", "เสร็จแล้ว"];

export const PAYMENT_METHODS = ["ชำระด้วยเงินสด", "โอนเงินผ่านธนาคาร"];

const DRAFT_KEY = "tailoringOrderDraft:v1";

const stripPhotos = (items) =>
  items.map((it) => ({ ...it, designImages: [], customerFabricPhotos: [] }));

const countPhotos = (items) =>
  items.reduce((n, it) => n + it.designImages.length + it.customerFabricPhotos.length, 0);

const draftFingerprint = (header, items) =>
  JSON.stringify({
    header: { ...header, orderCode: null, orderDate: null },
    items: stripPhotos(items).map((it) => ({ ...it, id: null })),
  });

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft?.header || !Array.isArray(draft.items) || draft.items.length === 0) return null;
    return draft;
  } catch {
    return null;
  }
}

function writeDraft(draft) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch {  }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {  }
}

const maxIdNumber = (ids, pattern) =>
  ids.reduce((max, id) => {
    const m = String(id).match(pattern);
    return m ? Math.max(max, Number(m[1])) : max;
  }, 1);

const thaiDate = (key) => {
  const [y, m, d] = String(key).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return key;
  return new Date(y, m - 1, d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
};

export const formatDateInput = (date = new Date()) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const emptySeamAllowance = () =>
  SEAM_ALLOWANCE_ROWS.reduce((acc, row) => ({ ...acc, [row.key]: "" }), {});

const createEmptyItem = (id) => ({
  id,
  garmentType: "",
  subtype: "",
  suitMode: "ชุดเดียว",
  suitBottom: "กางเกง",
  measurements: {},
  extraMeasurements: [],
  status: ORDER_STATUSES[0],
  fabricSource: "shop",
  fabric: {
    fabricName: "",
    fabricType: "",
    colorName: "",
    patternName: "",
    prewashed: "ยัง",
  },
  customerFabric: {
    receivedDate: "",
    rollCount: "",
    measuredLength: "",
    measuredWidth: "",
    condition: "",
    washed: "ไม่ทราบ",
    acknowledged: false,
    enough: "พอ",
    adjustmentNote: "",
    returnScraps: "คืนลูกค้า",
  },
  customerFabricPhotos: [],
  shopFabric: {
    rollId: "",
    pricePerMeter: "",
    metersIssued: "",
  },
  designImages: [],
  seamAllowance: emptySeamAllowance(),
  allowancePlan: {
    type: "ปกติ",
    specialNote: "",
    cannotAllow: false,
    cannotAllowNote: "",
  },
  price: "",
});

const Field = ({ label, required, hint, full, children }) => (
  <div className={`ato-field${full ? " full-width" : ""}`}>
    <label>
      {label} {required && <span className="ato-required">*</span>}
    </label>
    {children}
    {hint && <span className="ato-hint">{hint}</span>}
  </div>
);

const MultiImageUpload = ({ images, onAdd, onRemove, label }) => (
  <div className="ato-upload-grid">
    {images.map((img) => (
      <div key={img.id} className="ato-upload-thumb">
        <img src={img.preview} alt="" />
        <button type="button" className="ato-upload-thumb-remove" onClick={() => onRemove(img.id)}>
          <FiX size={12} />
        </button>
      </div>
    ))}
    <label className="ato-upload-thumb-add">
      <FiImage size={20} />
      <span>{label}</span>
      <input
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          Array.from(e.target.files || []).forEach(onAdd);
          e.target.value = "";
        }}
      />
    </label>
  </div>
);

const RadioOption = ({ name, checked, onChange, children }) => (
  <label className="ato-radio-item">
    <input type="radio" name={name} checked={checked} onChange={onChange} />
    <span className="ato-radio-dot" />
    <span className="ato-radio-text">{children}</span>
  </label>
);

export default function AddTailoringOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showAlert, showConfirm } = useDialog();
  const returnTo = location.state?.returnTo || null;
  const prefill = location.state?.prefill || null;
  const itemIdRef = useRef(1);
  const rowIdRef = useRef(1);
  const nextItemId = () => `item${++itemIdRef.current}`;
  const nextRowId = (itemId) => `${itemId}-r${++rowIdRef.current}`;

  const [saving, setSaving] = useState(false);
  const [measureUnit, setMeasureUnit] = useMeasureUnit();
  const unitLabel = unitLabelOf(measureUnit);

  const [fabricRolls, setFabricRolls] = useState([]);
  useEffect(() => {
    getFabricRolls()
      .then(setFabricRolls)
      .catch((err) => console.error("โหลดม้วนผ้าไม่สำเร็จ:", err));
  }, []);

  const [fabricTypes, setFabricTypes] = useState([]);
  const [colors, setColors] = useState([]);
  const [patterns, setPatterns] = useState([]);

  const loadFabricOptions = () => {
    getFabricTypes().then(setFabricTypes).catch(() => setFabricTypes([]));
    getColors().then(setColors).catch(() => setColors([]));
    getCategories().then(setPatterns).catch(() => setPatterns([]));
  };
  useEffect(() => { loadFabricOptions(); }, []);

  const [quickTarget, setQuickTarget] = useState(null);
  const [quickValue, setQuickValue] = useState("");
  const [quickSaving, setQuickSaving] = useState(false);

  const quickLabel = { type: "ประเภทผ้า", color: "สี", pattern: "ลวดลาย" }[quickTarget] || "";

  const closeQuickCreate = () => {
    setQuickTarget(null);
    setQuickValue("");
    setQuickSaving(false);
  };

  const handleQuickCreate = async () => {
    const name = quickValue.trim();
    if (!name) {
      await showAlert("กรุณากรอกข้อมูลก่อนบันทึก");
      return;
    }

    try {
      setQuickSaving(true);
      if (quickTarget === "type") {
        const exists = fabricTypes.find((t) => t.type_name?.trim() === name);
        if (!exists) await addFabricType({ type_name: name });
        updateFabric("fabricType", name);
      } else if (quickTarget === "color") {
        const exists = colors.find((c) => c.color_name?.trim() === name);
        if (!exists) await addColor({ color_name: name });
        updateFabric("colorName", name);
      } else {
        const exists = patterns.find((p) => p.category_name?.trim() === name);
        if (!exists) await addCategory({ category_name: name });
        updateFabric("patternName", name);
      }
      loadFabricOptions();
      closeQuickCreate();
    } catch (err) {
      await showAlert(err?.response?.data?.message || `เพิ่ม${quickLabel}ไม่สำเร็จ`);
      setQuickSaving(false);
    }
  };

  const [header, setHeader] = useState({
    orderCode: `ORD${Date.now().toString().slice(-6)}`,
    orderDate: formatDateInput(),
    deadline: "",
    customerName: prefill?.customerName || "",
    customerPhone: prefill?.customerPhone || "",
    fittingDate: "",
    fittingTime: "",
    deposit: "",
    depositPaymentMethod: PAYMENT_METHODS[0],
  });
  const updateHeader = (field, value) => setHeader((prev) => ({ ...prev, [field]: value }));

  const [items, setItems] = useState(() => [createEmptyItem("item1")]);
  const [activeItemId, setActiveItemId] = useState("item1");
  const activeItem = items.find((it) => it.id === activeItemId) || items[0];

  const [draftOffer, setDraftOffer] = useState(() => readDraft());
  const initialFingerprint = useRef(null);
  if (initialFingerprint.current === null) {
    initialFingerprint.current = draftFingerprint(header, items);
  }

  useEffect(() => {
    if (draftOffer) return;
    const timer = setTimeout(() => {
      if (draftFingerprint(header, items) === initialFingerprint.current) return;
      writeDraft({
        savedAt: new Date().toISOString(),
        header,
        items: stripPhotos(items),
        activeItemId,
        photoCount: countPhotos(items),
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [header, items, activeItemId, draftOffer]);

  const restoreDraft = () => {
    const draft = draftOffer;
    if (!draft) return;
    const restoredItems = draft.items.map((it) => ({
      ...createEmptyItem(it.id),
      ...it,
      designImages: [],
      customerFabricPhotos: [],
    }));
    itemIdRef.current = maxIdNumber(restoredItems.map((it) => it.id), /^item(\d+)$/);
    rowIdRef.current = maxIdNumber(
      restoredItems.flatMap((it) => [
        ...(it.extraMeasurements || []).map((m) => m.id),
        ...(it.alterationRows || []).map((r) => r.id),
      ]),
      /-r(\d+)$/
    );
    setHeader((prev) => ({ ...prev, ...draft.header }));
    setItems(restoredItems);
    setActiveItemId(
      restoredItems.some((it) => it.id === draft.activeItemId) ? draft.activeItemId : restoredItems[0].id
    );
    setDraftOffer(null);
  };

  const discardDraft = () => {
    clearDraft();
    setDraftOffer(null);
  };

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => {
        it.designImages.forEach((img) => URL.revokeObjectURL(img.preview));
        it.customerFabricPhotos.forEach((img) => URL.revokeObjectURL(img.preview));
      });
    };
  }, []);

  const patchItem = (id, patch) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...(typeof patch === "function" ? patch(it) : patch) } : it))
    );
  const patchItemNested = (id, key, field, value) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [key]: { ...it[key], [field]: value } } : it)));

  const addItem = () => {
    const id = nextItemId();
    setItems((prev) => [...prev, createEmptyItem(id)]);
    setActiveItemId(id);
  };

  const removeItem = async (id) => {
    if (items.length <= 1) {
      await showAlert("ต้องมีอย่างน้อย 1 ชิ้นในใบสั่งตัด");
      return;
    }
    const confirmed = await showConfirm("ต้องการลบชิ้นงานนี้ออกจากใบสั่งตัดใช่หรือไม่?", {
      title: "ยืนยันการลบ",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
    });
    if (!confirmed) return;

    const target = items.find((it) => it.id === id);
    target?.designImages.forEach((img) => URL.revokeObjectURL(img.preview));
    target?.customerFabricPhotos.forEach((img) => URL.revokeObjectURL(img.preview));

    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      if (activeItemId === id) setActiveItemId(next[0].id);
      return next;
    });
  };

  const setGarmentType = (key) => patchItem(activeItem.id, { garmentType: key, subtype: "", measurements: {} });
  const updateSubtype = (value) => patchItem(activeItem.id, { subtype: value });
  const setSuitMode = (value) => patchItem(activeItem.id, { suitMode: value });
  const setSuitBottom = (value) => patchItem(activeItem.id, { suitBottom: value });
  const updateMeasurement = (fieldKey, subField, value) =>
    patchItem(activeItem.id, (it) => ({
      measurements: {
        ...it.measurements,
        [fieldKey]: { ...it.measurements[fieldKey], [subField]: value },
      },
    }));

  const updateItemField = (field, value) => patchItem(activeItem.id, { [field]: value });
  const setFabricSource = (value) => patchItem(activeItem.id, { fabricSource: value });
  const updateFabric = (field, value) => patchItemNested(activeItem.id, "fabric", field, value);
  const updateCustomerFabric = (field, value) => patchItemNested(activeItem.id, "customerFabric", field, value);
  const updateShopFabric = (field, value) => patchItemNested(activeItem.id, "shopFabric", field, value);
  const selectFabricRoll = (rollId) => {
    const roll = fabricRolls.find((r) => String(r.roll_id) === String(rollId));
    patchItem(activeItem.id, (it) => ({
      shopFabric: {
        ...it.shopFabric,
        rollId,
        pricePerMeter: roll ? String(roll.cost_per_meter ?? "") : it.shopFabric.pricePerMeter,
      },
      fabric: roll
        ? {
            ...it.fabric,
            fabricName: roll.fabric_name || "",
            fabricType: roll.type_name || "",
            colorName: roll.color_name || "",
            patternName: roll.category_name || "",
          }
        : it.fabric,
    }));
  };
  const updateSeamAllowance = (key, value) => patchItemNested(activeItem.id, "seamAllowance", key, value);
  const updateAllowancePlan = (field, value) => patchItemNested(activeItem.id, "allowancePlan", field, value);

  const addDesignImage = (file) => {
    const url = URL.createObjectURL(file);
    patchItem(activeItem.id, (it) => ({
      designImages: [...it.designImages, { id: nextRowId(it.id), file, preview: url }],
    }));
  };
  const removeDesignImage = (imgId) =>
    patchItem(activeItem.id, (it) => {
      const target = it.designImages.find((img) => img.id === imgId);
      if (target) URL.revokeObjectURL(target.preview);
      return { designImages: it.designImages.filter((img) => img.id !== imgId) };
    });

  const addCustomerFabricPhoto = (file) => {
    const url = URL.createObjectURL(file);
    patchItem(activeItem.id, (it) => ({
      customerFabricPhotos: [...it.customerFabricPhotos, { id: nextRowId(it.id), file, preview: url }],
    }));
  };
  const removeCustomerFabricPhoto = (imgId) =>
    patchItem(activeItem.id, (it) => {
      const target = it.customerFabricPhotos.find((img) => img.id === imgId);
      if (target) URL.revokeObjectURL(target.preview);
      return { customerFabricPhotos: it.customerFabricPhotos.filter((img) => img.id !== imgId) };
    });

  const totalPrice = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const remainingBalance = totalPrice - (Number(header.deposit) || 0);

  const handleSave = async () => {
    if (items.some((it) => !it.garmentType)) {
      await showAlert("กรุณาเลือกประเภทงานตัดให้ครบทุกชิ้น");
      return;
    }
    if (!isValidOptionalPhone(header.customerPhone)) {
      await showAlert(PHONE_HINT);
      return;
    }
    if (!header.customerName.trim() || !header.deadline) {
      await showAlert("กรุณากรอกชื่อลูกค้าและวันที่ต้องส่งงานให้ครบก่อนบันทึก");
      return;
    }

    const confirmed = await showConfirm(`ต้องการบันทึกใบสั่งตัดนี้ทั้งหมด ${items.length} ชิ้นใช่หรือไม่?`, {
      title: "ยืนยันการบันทึก",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });
    if (!confirmed) return;

    const measurementsOf = (it) => {
      const fields = MEASUREMENT_FIELDS[it.garmentType] || [];
      const standard = fields
        .map(([fKey, fLabel]) => {
          const m = it.measurements[fKey];
          if (!m || (!m.current && !m.min && !m.max)) return null;
          return {
            field_key: fKey, field_label: fLabel,
            current_cm: m.current || null, min_cm: m.min || null, max_cm: m.max || null,
            is_custom: false,
          };
        })
        .filter(Boolean);
      const extra = it.extraMeasurements
        .filter((r) => r.label.trim())
        .map((r) => ({
          field_key: null, field_label: r.label,
          current_cm: r.current || null, min_cm: r.min || null, max_cm: r.max || null,
          is_custom: true,
        }));
      return [...standard, ...extra];
    };

    const formData = new FormData();
    const photos = [];
    items.forEach((it) => {
      it.designImages.forEach((img) => {
        if (!img.file) return;
        photos.push({ clientId: img.id, itemClientId: it.id, type: "design" });
        formData.append(`file_${img.id}`, img.file);
      });
      it.customerFabricPhotos.forEach((img) => {
        if (!img.file) return;
        photos.push({ clientId: img.id, itemClientId: it.id, type: "customer_fabric" });
        formData.append(`file_${img.id}`, img.file);
      });
    });

    const payload = {
      header: {
        orderCode: header.orderCode,
        customerName: header.customerName,
        customerPhone: header.customerPhone,
        orderDate: header.orderDate,
        deadline: header.deadline,
        fittingDate: header.fittingDate || null,
        fittingTime: header.fittingTime || null,
        deposit: header.deposit || 0,
        createdBy: user?.id || null,
        billId: null,
      },
      items: items.map((it) => ({
        clientId: it.id,
        garmentType: it.garmentType,
        subtype: it.subtype,
        suitMode: it.garmentType === "suit" ? it.suitMode : null,
        suitBottom: it.garmentType === "suit" ? it.suitBottom : null,
        status: it.status,
        fabricSource: it.fabricSource,
        fabric: it.fabric,
        customerFabric: it.fabricSource === "customer" ? it.customerFabric : null,
        shopFabric: it.fabricSource === "shop" ? it.shopFabric : null,
        measurements: measurementsOf(it),
        seamAllowance: it.seamAllowance,
        allowancePlan: it.allowancePlan,
        price: it.price || 0,
      })),
      photos,
    };
    formData.append("payload", JSON.stringify(payload));

    setSaving(true);
    try {
      const result = await createTailoringOrder(formData);
      clearDraft();
      await showAlert("บันทึกใบสั่งตัดชุดเรียบร้อยแล้ว");

      if (returnTo) {
        navigate(returnTo, {
          state: {
            attachedTailoringOrder: {
              order_id: result.order_id,
              order_code: result.order_code || header.orderCode,
              customer_name: header.customerName,
              customer_phone: header.customerPhone,
              deadline: header.deadline,
              piece_count: items.length,
              total_price: Number(header.deposit) || 0,
              deposit: Number(header.deposit) || 0,
              tailoring_total: totalPrice,
              remaining: remainingBalance,
            },
          },
        });
      } else {
        navigate("/staff/tailoringorders");
      }
    } catch (err) {
      await showAlert(err?.response?.data?.message || "บันทึกใบสั่งตัดไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  const garmentTypeFields = MEASUREMENT_FIELDS[activeItem.garmentType] || [];
  const activeGarment = GARMENT_TYPES.find((g) => g.key === activeItem.garmentType);
  const selectedRoll = fabricRolls.find((r) => String(r.roll_id) === String(activeItem.shopFabric.rollId));

  return (
    <div
      className="ato-page"
      onWheelCapture={(e) => {
        if (e.target.type === "number" && document.activeElement === e.target) e.target.blur();
      }}
    >
      <div className="ato-header">
        <h1>สร้างใบสั่งตัด</h1>
        {returnTo && (
          <p className="ato-header-note">
            บันทึกเสร็จแล้วจะพากลับไปที่บิลขาย และเชื่อมใบสั่งตัดนี้เข้ากับบิลเดียวกันให้อัตโนมัติ
          </p>
        )}
      </div>

      {draftOffer && (
        <div className="ato-draft">
          <span className="ato-draft-icon"><FiFileText size={18} /></span>
          <div className="ato-draft-text">
            <strong>มีใบสั่งตัดที่กรอกค้างไว้</strong>
            <span>
              {draftOffer.header.customerName || "ยังไม่ได้กรอกชื่อลูกค้า"}
              {` · ${draftOffer.items.length} ชิ้น`}
              {draftOffer.savedAt && ` · แก้ไขล่าสุด ${new Date(draftOffer.savedAt).toLocaleString("th-TH", {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
              })} น.`}
            </span>
            {draftOffer.photoCount > 0 && (
              <small>รูปภาพที่แนบไว้ {draftOffer.photoCount} รูปไม่ได้ถูกเก็บในแบบร่าง ต้องแนบใหม่</small>
            )}
          </div>
          <div className="ato-draft-actions">
            <button type="button" className="ato-draft-discard" onClick={discardDraft}>เริ่มใหม่</button>
            <button type="button" className="ato-draft-restore" onClick={restoreDraft}>กรอกต่อ</button>
          </div>
        </div>
      )}

      <div className="ato-content">
        <div className="ato-main">

          <div className="ato-card">
            <h3 className="ato-card-title">ข้อมูลอ้างอิง</h3>
            <div className="ato-grid three">
              <Field label="เลขที่ใบสั่งตัด">
                <input value={header.orderCode} onChange={(e) => updateHeader("orderCode", e.target.value)} />
              </Field>
              <Field label="วันที่สั่ง">
                <input type="date" min={formatDateInput()} value={header.orderDate} onChange={(e) => updateHeader("orderDate", e.target.value)} />
              </Field>
              <Field label="วันที่ต้องส่งงาน" required>
                <input type="date" min={formatDateInput()} value={header.deadline} onChange={(e) => updateHeader("deadline", e.target.value)} />
              </Field>
              <Field label="ชื่อลูกค้า" required>
                <input value={header.customerName} onChange={(e) => updateHeader("customerName", e.target.value)} placeholder="ชื่อ-นามสกุลลูกค้า" />
              </Field>
              <Field label="เบอร์โทร" hint={PHONE_HINT}>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={header.customerPhone}
                  onChange={(e) => updateHeader("customerPhone", onlyDigits(e.target.value))}
                  placeholder="0812345678"
                />
              </Field>
            </div>
          </div>

          <div className="ato-card">
            <h3 className="ato-card-title">ชิ้นงานในออเดอร์นี้ ({items.length} ชิ้น)</h3>
            <div className="ato-chip-grid">
              {items.map((it, idx) => (
                <label key={it.id} className={`ato-chip ${activeItemId === it.id ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="activeItem"
                    checked={activeItemId === it.id}
                    onChange={() => setActiveItemId(it.id)}
                  />
                  ชิ้นที่ {idx + 1}{it.garmentType ? `: ${garmentLabel(it.garmentType)}` : " (ยังไม่เลือกประเภท)"}
                  {items.length > 1 && (
                    <FiX
                      size={14}
                      style={{ marginLeft: 6, cursor: "pointer" }}
                      onClick={(e) => {
                        e.preventDefault();
                        removeItem(it.id);
                      }}
                    />
                  )}
                </label>
              ))}
              <button type="button" className="ato-btn-add-row" onClick={addItem}>
                <FiPlus size={14} /> เพิ่มชิ้นงาน
              </button>
            </div>

            <div className="ato-subsection">
              <h4>ประเภทงานตัด (ชิ้นที่ {items.findIndex((it) => it.id === activeItem.id) + 1})</h4>
              <div className="ato-chip-grid">
                {GARMENT_TYPES.map((g) => (
                  <label key={g.key} className={`ato-chip ${activeItem.garmentType === g.key ? "active" : ""}`}>
                    <input
                      type="radio"
                      name={`garmentType-${activeItem.id}`}
                      checked={activeItem.garmentType === g.key}
                      onChange={() => setGarmentType(g.key)}
                    />
                    {g.label}
                  </label>
                ))}
              </div>

              {activeGarment && activeGarment.subtypes.length > 0 && (
                <div className="ato-subtype-row">
                  <span className="ato-subtype-label">ชนิดของ{activeGarment.label}:</span>
                  <div className="ato-radio-row">
                    {activeGarment.subtypes.map((s) => (
                      <RadioOption
                        key={s}
                        name={`subtype-${activeItem.id}`}
                        checked={activeItem.subtype === s}
                        onChange={() => updateSubtype(s)}
                      >
                        {s}
                      </RadioOption>
                    ))}
                  </div>
                </div>
              )}

              {activeItem.garmentType === "suit" && (
                <div className="ato-subtype-row">
                  <span className="ato-subtype-label">สูท:</span>
                  <div className="ato-radio-row">
                    {["ชุดเดียว", "แยกชิ้น"].map((s) => (
                      <RadioOption key={s} name={`suitMode-${activeItem.id}`} checked={activeItem.suitMode === s} onChange={() => setSuitMode(s)}>
                        ตัดเป็น{s}
                      </RadioOption>
                    ))}
                    {["กางเกง", "กระโปรง"].map((s) => (
                      <RadioOption key={s} name={`suitBottom-${activeItem.id}`} checked={activeItem.suitBottom === s} onChange={() => setSuitBottom(s)}>
                        คู่กับ{s}
                      </RadioOption>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {activeItem.garmentType && (
              <div className="ato-subsection">
                <div className="measure-titlebar">
                  <h4>ขนาดตัว ({activeGarment?.label})</h4>
                  <UnitToggle unit={measureUnit} onChange={setMeasureUnit} />
                </div>
                <p className="ato-card-desc">
                  แต่ละชุดเผื่อ/ขยายได้ไม่เท่ากัน
                </p>
                <div className="ato-measure-table">
                  <div className="ato-measure-row ato-measure-head">
                    <span>จุดวัด</span>
                    <span>ปัจจุบัน ({unitLabel})</span>
                    <span>เล็กสุดที่เอาเข้าได้ ({unitLabel})</span>
                    <span>ใหญ่สุดที่ขยายได้ ({unitLabel})</span>
                  </div>
                  {garmentTypeFields.map(([fKey, fLabel]) => (
                    <div key={fKey} className="ato-measure-row">
                      <span>{fLabel}</span>
                      {["current", "min", "max"].map((sub) => (
                        <MeasureInput
                          key={sub}
                          cm={activeItem.measurements[fKey]?.[sub]}
                          unit={measureUnit}
                          onChange={(v) => updateMeasurement(fKey, sub, v)}
                        />
                      ))}
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

          <div className="ato-card">
            <h3 className="ato-card-title">แหล่งที่มาของผ้า</h3>
            <div className="ato-radio-row" style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              <RadioOption name={`fabricSource-${activeItem.id}`} checked={activeItem.fabricSource === "customer"} onChange={() => setFabricSource("customer")}>
                ลูกค้านำผ้ามาเอง
              </RadioOption>
              <RadioOption name={`fabricSource-${activeItem.id}`} checked={activeItem.fabricSource === "shop"} onChange={() => setFabricSource("shop")}>
                ผ้าของร้าน
              </RadioOption>
            </div>
          </div>

          <div className="ato-card">
            <h3 className="ato-card-title">ข้อมูลผ้า</h3>
            <p className="ato-card-desc">
              {activeItem.fabricSource === "customer"
                ? "อธิบายลักษณะผ้าที่ลูกค้านำมาให้"
                : "เลือกม้วนผ้าจากสต็อกก่อน ระบบจะเติมชื่อผ้า ประเภท สี และลวดลายให้อัตโนมัติ (แก้ไขได้ถ้าไม่ตรง)"}
            </p>

            {activeItem.fabricSource === "shop" && (
              <div className="ato-roll-pick">
                <div className="ato-grid">
                  <Field label="เลือกม้วนผ้าจากสต็อก" full hint="เลือกม้วนผ้าที่จะเบิกใช้ — ข้อมูลผ้าด้านล่างจะดึงมาจากคลังอัตโนมัติ">
                    <Select value={activeItem.shopFabric.rollId} onChange={(e) => selectFabricRoll(e.target.value)}>
                      <option value="">เลือกม้วนผ้า</option>
                      {fabricRolls.map((r) => (
                        <option key={r.roll_id} value={r.roll_id}>
                          {r.roll_code} — {r.fabric_name} (เหลือ {Number(r.remaining_length || 0).toFixed(1)} ม.)
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                {selectedRoll && (
                  <div className="ato-grid three">
                    <Field label="รหัสม้วน">
                      <input value={selectedRoll.roll_code || "-"} readOnly disabled />
                    </Field>
                    <Field label="Lot">
                      <input value={selectedRoll.lot_number || "-"} readOnly disabled />
                    </Field>
                    <Field label="คงเหลือในสต็อก">
                      <input value={`${Number(selectedRoll.remaining_length || 0).toFixed(1)} ม.`} readOnly disabled />
                    </Field>
                  </div>
                )}
              </div>
            )}

            <div className="ato-grid">
              <Field label="ชื่อผ้า">
                <input value={activeItem.fabric.fabricName} onChange={(e) => updateFabric("fabricName", e.target.value)} placeholder="เช่น ผ้าฝ้ายทอมือ เชียงใหม่" />
              </Field>
              <div className="ato-field">
                <div className="ato-label-with-action">
                  <label>ประเภท</label>
                  <button type="button" className="ato-btn-inline-add" onClick={() => setQuickTarget("type")}>
                    <FiPlus size={13} /> เพิ่มใหม่
                  </button>
                </div>
                <Select
                  value={activeItem.fabric.fabricType}
                  onChange={(e) => updateFabric("fabricType", e.target.value)}
                >
                  <option value="">เลือกประเภทผ้า</option>
                  {fabricTypes.map((t) => (
                    <option key={t.type_id} value={t.type_name}>{t.type_name}</option>
                  ))}
                  {activeItem.fabric.fabricType &&
                    !fabricTypes.some((t) => t.type_name === activeItem.fabric.fabricType) && (
                      <option value={activeItem.fabric.fabricType}>{activeItem.fabric.fabricType}</option>
                    )}
                </Select>
              </div>

              <div className="ato-field">
                <div className="ato-label-with-action">
                  <label>สี</label>
                  <button type="button" className="ato-btn-inline-add" onClick={() => setQuickTarget("color")}>
                    <FiPlus size={13} /> เพิ่มใหม่
                  </button>
                </div>
                <Select
                  value={activeItem.fabric.colorName}
                  onChange={(e) => updateFabric("colorName", e.target.value)}
                >
                  <option value="">เลือกสี</option>
                  {colors.map((c) => (
                    <option key={c.color_id} value={c.color_name}>{c.color_name}</option>
                  ))}
                  {activeItem.fabric.colorName &&
                    !colors.some((c) => c.color_name === activeItem.fabric.colorName) && (
                      <option value={activeItem.fabric.colorName}>{activeItem.fabric.colorName}</option>
                    )}
                </Select>
              </div>

              <div className="ato-field">
                <div className="ato-label-with-action">
                  <label>ลวดลาย</label>
                  <button type="button" className="ato-btn-inline-add" onClick={() => setQuickTarget("pattern")}>
                    <FiPlus size={13} /> เพิ่มใหม่
                  </button>
                </div>
                <Select
                  value={activeItem.fabric.patternName}
                  onChange={(e) => updateFabric("patternName", e.target.value)}
                >
                  <option value="">เลือกลวดลาย</option>
                  {patterns.map((p) => (
                    <option key={p.category_id} value={p.category_name}>{p.category_name}</option>
                  ))}
                  {activeItem.fabric.patternName &&
                    !patterns.some((p) => p.category_name === activeItem.fabric.patternName) && (
                      <option value={activeItem.fabric.patternName}>{activeItem.fabric.patternName}</option>
                    )}
                </Select>
              </div>
              <Field label="ซัก">
                <Select value={activeItem.fabric.prewashed} onChange={(e) => updateFabric("prewashed", e.target.value)}>
                  <option value="ยัง">ยังไม่ได้ซัก</option>
                  <option value="ซักแล้ว">ซักมาแล้ว</option>
                  <option value="ไม่ทราบ">ไม่ทราบ</option>
                </Select>
              </Field>
            </div>

            {activeItem.fabricSource === "customer" ? (
              <div className="ato-subsection">
                <h4>ผ้าของลูกค้า</h4>
                <div className="ato-grid">
                  <Field label="วันที่รับผ้า">
                    <input type="date" value={activeItem.customerFabric.receivedDate} onChange={(e) => updateCustomerFabric("receivedDate", e.target.value)} />
                  </Field>
                  <Field label="จำนวนผืน">
                    <input type="number" inputMode="decimal" min="0" value={activeItem.customerFabric.rollCount} onChange={(e) => updateCustomerFabric("rollCount", e.target.value)} />
                  </Field>
                  <Field label="ความยาวที่วัดจริงต่อหน้าลูกค้า (เมตร)">
                    <input type="number" inputMode="decimal" min="0" value={activeItem.customerFabric.measuredLength} onChange={(e) => updateCustomerFabric("measuredLength", e.target.value)} />
                  </Field>
                  <Field label="หน้าผ้าที่วัดจริงต่อหน้าลูกค้า (ซม.)">
                    <input type="number" inputMode="decimal" min="0" value={activeItem.customerFabric.measuredWidth} onChange={(e) => updateCustomerFabric("measuredWidth", e.target.value)} />
                  </Field>
                  <Field label="สภาพผ้าตอนรับ" full hint="เช่น มีตำหนิ รอยด่าง รอยพับตรงไหน">
                    <textarea value={activeItem.customerFabric.condition} onChange={(e) => updateCustomerFabric("condition", e.target.value)} />
                  </Field>
                  <Field label="รูปสภาพผ้าตอนรับ" full hint="อัปโหลดได้หลายรูป">
                    <MultiImageUpload
                      images={activeItem.customerFabricPhotos}
                      onAdd={addCustomerFabricPhoto}
                      onRemove={removeCustomerFabricPhoto}
                      label="เพิ่มรูป"
                    />
                  </Field>
                  <Field label="ผ้าซักมาแล้วหรือยัง">
                    <Select value={activeItem.customerFabric.washed} onChange={(e) => updateCustomerFabric("washed", e.target.value)}>
                      <option value="ซักแล้ว">ซักแล้ว</option>
                      <option value="ยัง">ยัง</option>
                      <option value="ไม่ทราบ">ไม่ทราบ</option>
                    </Select>
                  </Field>
                  <Field label="ผ้าพอหรือไม่พอสำหรับแบบที่ต้องการ">
                    <Select value={activeItem.customerFabric.enough} onChange={(e) => updateCustomerFabric("enough", e.target.value)}>
                      <option value="พอ">พอ</option>
                      <option value="ไม่พอ">ไม่พอ</option>
                    </Select>
                  </Field>
                  {activeItem.customerFabric.enough === "ไม่พอ" && (
                    <Field label="วิธีปรับแบบ" full hint="เช่น ต่อตะเข็บเพิ่ม สลับผ้าที่ปกกับสาบ">
                      <input value={activeItem.customerFabric.adjustmentNote} onChange={(e) => updateCustomerFabric("adjustmentNote", e.target.value)} />
                    </Field>
                  )}
                  <Field label="เศษผ้าคืนลูกค้าหรือไม่">
                    <Select value={activeItem.customerFabric.returnScraps} onChange={(e) => updateCustomerFabric("returnScraps", e.target.value)}>
                      <option value="คืนลูกค้า">คืนลูกค้า</option>
                      <option value="ไม่คืน">ไม่คืน</option>
                    </Select>
                  </Field>
                </div>

                <div className="ato-notice-box">
                  ผ้ามีจำกัด ตัดแล้วตัดใหม่ไม่ได้ ถ้าผ้าไม่พอตามแบบที่ต้องการ ทางร้านจะแจ้งก่อนลงมือ
                </div>
                <label className="ato-checkbox-item">
                  <input
                    type="checkbox"
                    checked={activeItem.customerFabric.acknowledged}
                    onChange={(e) => updateCustomerFabric("acknowledged", e.target.checked)}
                  />
                  ลูกค้ารับทราบเงื่อนไขข้างต้นแล้ว
                </label>
              </div>
            ) : (
              <div className="ato-subsection">
                <h4>ผ้าของร้าน</h4>
                <div className="ato-grid">
                  <Field label="ราคาต่อเมตร (บาท)" hint={selectedRoll ? "ดึงจากคลังอัตโนมัติ แก้ไขได้ถ้าราคาตกลงต่างจากนี้" : undefined}>
                    <input type="number" inputMode="decimal" min="0" value={activeItem.shopFabric.pricePerMeter} onChange={(e) => updateShopFabric("pricePerMeter", e.target.value)} />
                  </Field>
                </div>

              </div>
            )}
          </div>

          <div className="ato-card">
            <h3 className="ato-card-title">รายละเอียดงานที่จะตัด</h3>
            <div className="ato-grid">
              <Field label="ภาพร่าง/แบบแนบ" full hint="อัปโหลดได้หลายรูป">
                <MultiImageUpload
                  images={activeItem.designImages}
                  onAdd={addDesignImage}
                  onRemove={removeDesignImage}
                  label="เพิ่มรูป"
                />
              </Field>
            </div>
          </div>

          <div className="ato-card">
            <div className="measure-titlebar">
              <h3 className="ato-card-title">ส่วนเผื่อไซซ์</h3>
              <UnitToggle unit={measureUnit} onChange={setMeasureUnit} />
            </div>

            <div className="ato-seam-table">
              <div className="ato-seam-row ato-seam-head">
                <span>จุด</span>
                <span>คำแนะนำ</span>
                <span>เผื่อจริง ({unitLabel})</span>
              </div>
              {SEAM_ALLOWANCE_ROWS.map((row) => (
                <div key={row.key} className="ato-seam-row">
                  <span>{row.label}</span>
                  <span className="ato-seam-hint">{seamHint(row, measureUnit)}</span>
                  <MeasureInput
                    cm={activeItem.seamAllowance[row.key]}
                    unit={measureUnit}
                    onChange={(v) => updateSeamAllowance(row.key, v)}
                  />
                </div>
              ))}
            </div>

            <div className="ato-subsection">
              <div className="ato-grid">
                <Field label="ลักษณะการเผื่อ">
                  <div className="ato-radio-row">
                    <RadioOption name={`allowanceType-${activeItem.id}`} checked={activeItem.allowancePlan.type === "ปกติ"} onChange={() => updateAllowancePlan("type", "ปกติ")}>
                      เผื่อปกติ
                    </RadioOption>
                    <RadioOption name={`allowanceType-${activeItem.id}`} checked={activeItem.allowancePlan.type === "พิเศษ"} onChange={() => updateAllowancePlan("type", "พิเศษ")}>
                      เผื่อพิเศษ
                    </RadioOption>
                  </div>
                </Field>
                {activeItem.allowancePlan.type === "พิเศษ" && (
                  <Field label="เหตุผลที่เผื่อพิเศษ" full hint="เช่น ลูกค้ากำลังลดน้ำหนัก คนท้อง เด็กโตเร็ว ชุดใส่งานแต่งอีกหลายเดือนข้างหน้า">
                    <input value={activeItem.allowancePlan.specialNote} onChange={(e) => updateAllowancePlan("specialNote", e.target.value)} />
                  </Field>
                )}
              </div>

              <label className="ato-checkbox-item">
                <input
                  type="checkbox"
                  checked={activeItem.allowancePlan.cannotAllow}
                  onChange={(e) => updateAllowancePlan("cannotAllow", e.target.checked)}
                />
                ไม่สามารถเผื่อได้ แจ้งลูกค้าแล้ว
              </label>
              {activeItem.allowancePlan.cannotAllow && (
                <Field label="จุดที่ห้ามเผื่อเด็ดขาด" hint="เช่น ผ้าลูกค้าไม่พอ หรือลายมัดหมี่ต่อลายไม่ได้ถ้าปล่อยตะเข็บ">
                  <input value={activeItem.allowancePlan.cannotAllowNote} onChange={(e) => updateAllowancePlan("cannotAllowNote", e.target.value)} />
                </Field>
              )}
            </div>
          </div>

          <div className="ato-card">
            <h3 className="ato-card-title">ราคา (ชิ้นนี้)</h3>
            <div className="ato-field-narrow">
              <Field label="ค่าตัดชิ้นนี้ (บาท)">
                <input type="number" inputMode="decimal" min="0" value={activeItem.price} onChange={(e) => updateItemField("price", e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="ato-card">
            <h3 className="ato-card-title">นัดหมายและการเงินรวมทั้งออเดอร์</h3>

            <div className="ato-subsection">
              <h4>นัดหมาย</h4>
              <div className="ato-grid">
                <Field label="วันนัดลองตัว" hint="สูทกับชุดพื้นเมืองควรลองอย่างน้อย 1 ครั้ง">
                  <input type="date" min={formatDateInput()} value={header.fittingDate} onChange={(e) => updateHeader("fittingDate", e.target.value)} />
                </Field>
                <Field label="เวลานัด" hint="ไม่ระบุก็ได้">
                  <input
                    type="time"
                    value={header.fittingTime}
                    disabled={!header.fittingDate}
                    onChange={(e) => updateHeader("fittingTime", e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div className="ato-subsection">
              <h4>การเงิน</h4>
              <div className="ato-grid three">
                <Field label="ค่าตัดรวมทุกชิ้น (บาท)" hint="รวมจากค่าตัดของแต่ละชิ้นด้านบนอัตโนมัติ">
                  <input value={`฿${totalPrice.toLocaleString()}`} readOnly disabled />
                </Field>
                <Field label="มัดจำ (บาท)" hint={totalPrice > 0 ? `ไม่เกินค่าตัดรวม ฿${totalPrice.toLocaleString()}` : undefined}>
                  <input
                    type="number" inputMode="decimal"
                    min="0"
                    max={totalPrice || undefined}
                    value={header.deposit}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        updateHeader("deposit", "");
                        return;
                      }
                      const clamped = Math.min(Math.max(Number(raw) || 0, 0), totalPrice);
                      updateHeader("deposit", String(clamped));
                    }}
                  />
                </Field>
                <Field label="ยอดคงเหลือ (บาท)">
                  <input value={`฿${remainingBalance.toLocaleString()}`} readOnly disabled />
                </Field>
                {Number(header.deposit) > 0 && (
                  <Field label="วิธีชำระมัดจำ">
                    <Select value={header.depositPaymentMethod} onChange={(e) => updateHeader("depositPaymentMethod", e.target.value)}>
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                  </Field>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="ato-side">
          <div className="ato-summary">
            <div className="ato-sum-head">
              <h3>สรุปใบสั่งตัด</h3>
              <span className="ato-sum-code">{header.orderCode || "-"}</span>
            </div>

            <dl className="ato-sum-info">
              <div>
                <dt>ลูกค้า</dt>
                <dd className={header.customerName ? "" : "empty"}>{header.customerName || "ยังไม่ได้กรอก"}</dd>
              </div>
              <div>
                <dt>กำหนดส่งงาน</dt>
                <dd className={header.deadline ? "" : "empty"}>
                  {header.deadline ? thaiDate(header.deadline) : "ยังไม่ได้เลือก"}
                </dd>
              </div>
              <div>
                <dt>วันนัดลองตัว</dt>
                <dd className={header.fittingDate ? "" : "empty"}>
                  {header.fittingDate ? thaiDate(header.fittingDate) : "ยังไม่ได้นัด"}
                  {header.fittingDate && header.fittingTime ? ` · ${header.fittingTime} น.` : ""}
                </dd>
              </div>
            </dl>

            <div className="ato-sum-section">
              <span className="ato-sum-label">ชิ้นงาน ({items.length} ชิ้น)</span>
              <ul className="ato-sum-pieces">
                {items.map((it, idx) => (
                  <li key={it.id}>
                    <span className="ato-sum-no">{idx + 1}</span>
                    <div>
                      <strong>{garmentLabel(it.garmentType) || "ยังไม่เลือกประเภท"}</strong>
                      <small>{it.fabricSource === "customer" ? "ผ้าลูกค้า" : "ผ้าของร้าน"}</small>
                    </div>
                    <b>฿{(Number(it.price) || 0).toLocaleString()}</b>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ato-sum-money">
              <div className="ato-sum-line">
                <span>ราคาทั้งหมด</span>
                <span>฿{totalPrice.toLocaleString()}</span>
              </div>
              <div className="ato-sum-line">
                <span>มัดจำ</span>
                <span>{Number(header.deposit) > 0 ? `− ฿${Number(header.deposit).toLocaleString()}` : "฿0"}</span>
              </div>
              <div className={`ato-sum-line total${remainingBalance > 0 ? "" : " zero"}`}>
                <span>ยอดค้างชำระ</span>
                <span>฿{remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="ato-actions">
              <button className="ato-btn-save" onClick={handleSave} disabled={saving}>
                <FiCheck size={16} /> {saving ? "กำลังบันทึก..." : "บันทึกใบสั่งตัด"}
              </button>
              <button className="ato-btn-cancel" onClick={() => navigate(-1)} disabled={saving}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>

      {quickTarget && (
        <QuickCreateModal
          title={`เพิ่ม${quickLabel}ใหม่`}
          label={quickLabel}
          value={quickValue}
          onChange={setQuickValue}
          onClose={closeQuickCreate}
          onSave={handleQuickCreate}
          saving={quickSaving}
        />
      )}
    </div>
  );
}
