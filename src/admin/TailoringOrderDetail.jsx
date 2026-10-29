import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiPlus, FiTrash2, FiImage, FiPrinter, FiCalendar, FiUpload, FiRefreshCw, FiUser } from "react-icons/fi";
import { useDialog } from "../context/DialogContext";
import {
  getTailoringOrderByCode, updateTailoringOrder,
  addTailoringPhotos, replaceTailoringPhoto, deleteTailoringPhoto,
} from "../api/fetch_api_admin";
import {
  GARMENT_TYPES,
  MEASUREMENT_FIELDS,
  SEAM_ALLOWANCE_ROWS,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  garmentLabel,
  formatDateInput,
} from "./AddTailoringOrders";
import { transformDbOrder, dueLabel, formatDateTH, photoUrl } from "../utils/tailoringOrder";
import { logAction } from "../api/activityLog";
import { MeasureInput, UnitToggle } from "../components/MeasureUnit";
import { useMeasureUnit, unitLabelOf, formatLength } from "../utils/measureUnit";
import "../css/TailoringOrderDetail.css";
import Select from "../components/Select";

const APPOINTMENT_PURPOSES = ["ลองชุด", "วัดตัวเพิ่ม", "แก้ไขงาน", "รับชุด", "อื่น ๆ"];

const baht = (n) => `฿${(Number(n) || 0).toLocaleString("th-TH")}`;

const ImageThumb = ({ src, alt }) => {
  const [broken, setBroken] = useState(false);
  if (broken || !src) {
    return (
      <div className="tod-thumb tod-thumb-broken">
        <FiImage size={18} />
        <span>ไม่พบรูปภาพ</span>
      </div>
    );
  }
  return (
    <div className="tod-thumb">
      <img src={src} alt={alt} onError={() => setBroken(true)} />
    </div>
  );
};

const EditableThumb = ({ src, alt, disabled, onReplace, onDelete }) => (
  <div className="tod-thumb-editable">
    <ImageThumb src={src} alt={alt} />
    <div className="tod-thumb-actions">
      <label className={`tod-thumb-action ${disabled ? "is-disabled" : ""}`} title="เปลี่ยนรูปนี้">
        <FiRefreshCw size={13} />
        <input
          type="file"
          accept="image/*"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onReplace(file);
          }}
        />
      </label>
      <button
        type="button"
        className="tod-thumb-action"
        title="ลบรูปนี้"
        disabled={disabled}
        onClick={onDelete}
      >
        <FiTrash2 size={13} />
      </button>
    </div>
  </div>
);

export default function TailoringOrderDetail() {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useDialog();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const rowIdRef = useRef(1);
  const nextRowId = (prefix) => `${prefix}-${Date.now()}-${++rowIdRef.current}`;

  const [record, setRecord] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [items, setItems] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [measureUnit, setMeasureUnit] = useMeasureUnit();
  const unitLabel = unitLabelOf(measureUnit);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [finalPaymentMethod, setFinalPaymentMethod] = useState(PAYMENT_METHODS[0]);

  const load = useCallback(async () => {
    try {
      const dbOrder = await getTailoringOrderByCode(id);
      const found = transformDbOrder(dbOrder);
      found.bill_no = dbOrder.bill_no || null;

      setRecord(found);
      setItems(
        (found.detail?.items || []).map((it) => ({
          ...it,
          status: it.status || ORDER_STATUSES[0],
          postCut: it.postCut || { fabricIssuedMeters: "", fabricUsedMeters: "" },
          alterationRows: it.alterationRows || [],
        }))
      );
      setAppointments(
        (dbOrder.appointments || []).map((a) => ({
          id: `appt-${a.appointment_id}`,
          date: a.appointment_date || "",
          time: a.appointment_time || "",
          purpose: a.purpose || "",
          note: a.note || "",
          done: !!a.done,
        }))
      );
      setCustomerName(found.detail?.header?.customerName || "");
      setCustomerPhone(found.detail?.header?.customerPhone || "");
      setFinalPaymentMethod(found.detail?.header?.finalPaymentMethod || PAYMENT_METHODS[0]);
    } catch {
      setNotFound(true);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (record && searchParams.get("print") === "1") {
      const t = setTimeout(() => {
        logAction("print", "sales", `พิมพ์ออเดอร์ตัดชุด #${id}`);
        window.print();
      }, 400);
      return () => clearTimeout(t);
    }
  }, [record, searchParams, id]);

  const header = record?.detail?.header || {};

  const deadlineInfo = useMemo(() => dueLabel(header.deadline), [header.deadline]);

  const nextAppointment = useMemo(() => {
    const today = formatDateInput();
    return [...appointments]
      .filter((a) => !a.done && a.date && a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
  }, [appointments]);

  const nextApptInfo = useMemo(() => dueLabel(nextAppointment?.date), [nextAppointment]);

  const totalPrice = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.price) || 0), 0),
    [items]
  );
  const alterationFeeOf = (it) =>
    (it.alterationRows || []).reduce((s, r) => s + (Number(r.feeAmount) || 0), 0);
  const totalAlterationFees = useMemo(
    () => items.reduce((sum, it) => sum + alterationFeeOf(it), 0),
    [items]
  );
  const alterationCount = useMemo(
    () => items.reduce((sum, it) => sum + (it.alterationRows || []).length, 0),
    [items]
  );
  const deposit = Number(header.deposit) || 0;
  const remainingBalance = totalPrice + totalAlterationFees - deposit;

  const updateItem = (itemId, patch) =>
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, ...(typeof patch === "function" ? patch(it) : patch) } : it))
    );

  const updatePostCut = (itemId, field, value) =>
    updateItem(itemId, (it) => ({ postCut: { ...it.postCut, [field]: value } }));

  const updateMeasurement = (itemId, fieldKey, sub, value) =>
    updateItem(itemId, (it) => ({
      measurements: {
        ...it.measurements,
        [fieldKey]: { ...(it.measurements?.[fieldKey] || {}), [sub]: value },
      },
    }));

  const updateExtraMeasurement = (itemId, rowId, field, value) =>
    updateItem(itemId, (it) => ({
      extraMeasurements: (it.extraMeasurements || []).map((r) =>
        r.id === rowId ? { ...r, [field]: value } : r
      ),
    }));
  const addExtraMeasurement = (itemId) =>
    updateItem(itemId, (it) => ({
      extraMeasurements: [
        ...(it.extraMeasurements || []),
        { id: nextRowId("m"), label: "", current: "", min: "", max: "" },
      ],
    }));
  const removeExtraMeasurement = (itemId, rowId) =>
    updateItem(itemId, (it) => ({
      extraMeasurements: (it.extraMeasurements || []).filter((r) => r.id !== rowId),
    }));

  const addAlterationRow = (itemId) =>
    updateItem(itemId, (it) => ({
      alterationRows: [
        ...it.alterationRows,
        { id: nextRowId("alt"), date: formatDateInput(), point: "", adjustCm: "", remainingAllowance: "", feeAmount: "" },
      ],
    }));
  const updateAlterationRow = (itemId, rowId, field, value) =>
    updateItem(itemId, (it) => ({
      alterationRows: it.alterationRows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)),
    }));
  const removeAlterationRow = (itemId, rowId) =>
    updateItem(itemId, (it) => ({
      alterationRows: it.alterationRows.filter((r) => r.id !== rowId),
    }));

  const addAppointment = () =>
    setAppointments((prev) => [
      ...prev,
      { id: nextRowId("appt"), date: "", time: "", purpose: APPOINTMENT_PURPOSES[0], note: "", done: false },
    ]);
  const updateAppointment = (rowId, field, value) =>
    setAppointments((prev) => prev.map((a) => (a.id === rowId ? { ...a, [field]: value } : a)));
  const removeAppointment = (rowId) =>
    setAppointments((prev) => prev.filter((a) => a.id !== rowId));

  const photoIdOf = (id) => Number(String(id).replace("p-", ""));
  const dbItemIdOf = (id) => Number(String(id).replace("item-", ""));

  const setDesignImages = (itemId, updater) =>
    updateItem(itemId, (it) => ({ designImages: updater(it.designImages || []) }));

  const handleAddPhotos = async (itemId, fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    try {
      setPhotoBusy(true);
      const result = await addTailoringPhotos(record.db_order_id, dbItemIdOf(itemId), files);
      const added = (result.photos || []).map((p) => ({
        id: `p-${p.photo_id}`,
        preview: photoUrl(p.file_path),
      }));
      setDesignImages(itemId, (prev) => [...prev, ...added]);
    } catch (err) {
      await showAlert(err?.response?.data?.message || "เพิ่มรูปไม่สำเร็จ");
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleReplacePhoto = async (itemId, imageId, file) => {
    try {
      setPhotoBusy(true);
      const result = await replaceTailoringPhoto(record.db_order_id, photoIdOf(imageId), file);
      const preview = photoUrl(result.photo?.file_path);
      setDesignImages(itemId, (prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, preview } : img))
      );
    } catch (err) {
      await showAlert(err?.response?.data?.message || "เปลี่ยนรูปไม่สำเร็จ");
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleDeletePhoto = async (itemId, imageId) => {
    const confirmed = await showConfirm("ต้องการลบรูปนี้ใช่หรือไม่? ลบแล้วกู้คืนไม่ได้", {
      title: "ยืนยันการลบรูป",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
    });
    if (!confirmed) return;

    try {
      setPhotoBusy(true);
      await deleteTailoringPhoto(record.db_order_id, photoIdOf(imageId));
      setDesignImages(itemId, (prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      await showAlert(err?.response?.data?.message || "ลบรูปไม่สำเร็จ");
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleSave = async () => {
    if (!customerName.trim()) {
      await showAlert("กรุณากรอกชื่อ-นามสกุลลูกค้า");
      return;
    }

    const phoneDigits = customerPhone.replace(/\D/g, "");
    if (phoneDigits && phoneDigits.length !== 10) {
      await showAlert(`เบอร์โทรลูกค้าต้องเป็นตัวเลข 10 หลัก (กรอกมา ${phoneDigits.length} หลัก)`);
      return;
    }

    const badAppt = appointments.find((a) => (a.date && !a.purpose) || (!a.date && a.purpose));
    if (badAppt) {
      await showAlert("วันนัดต้องกรอกทั้งวันที่และสิ่งที่นัด");
      return;
    }

    const confirmed = await showConfirm("ต้องการบันทึกการอัปเดตใบสั่งตัดนี้ใช่หรือไม่?", {
      title: "ยืนยันการบันทึก",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });
    if (!confirmed) return;

    const measurementsPayload = (it) => {
      const fields = MEASUREMENT_FIELDS[it.garmentType] || [];
      const standard = fields
        .map(([fKey, fLabel]) => {
          const m = it.measurements?.[fKey];
          if (!m || (!m.current && !m.min && !m.max)) return null;
          return {
            field_key: fKey, field_label: fLabel,
            current_cm: m.current, min_cm: m.min, max_cm: m.max,
            is_custom: false,
          };
        })
        .filter(Boolean);
      const extra = (it.extraMeasurements || [])
        .filter((r) => String(r.label || "").trim())
        .map((r) => ({
          field_key: null, field_label: r.label,
          current_cm: r.current, min_cm: r.min, max_cm: r.max,
          is_custom: true,
        }));
      return [...standard, ...extra];
    };

    setSaving(true);
    try {
      await updateTailoringOrder(record.db_order_id, {
        customer_name: customerName.trim(),
        customer_phone: phoneDigits,
        items: items.map((it) => ({
          item_id: dbItemIdOf(it.id),
          status: it.status,
          fabric_issued_meters: it.postCut.fabricIssuedMeters,
          fabric_used_meters: it.postCut.fabricUsedMeters,
          measurements: measurementsPayload(it),
          alterations: (it.alterationRows || []).map((r) => ({
            alteration_date: r.date || null,
            point: r.point,
            adjust_cm: r.adjustCm,
            remaining_allowance: r.remainingAllowance,
            fee_amount: r.feeAmount,
          })),
        })),
        appointments: appointments
          .filter((a) => a.date && a.purpose)
          .map((a) => ({
            appointment_date: a.date,
            appointment_time: a.time || null,
            purpose: a.purpose,
            note: a.note,
            done: a.done,
          })),
      });

      await showAlert("บันทึกการอัปเดตเรียบร้อยแล้ว");
      await load();
    } catch (err) {
      await showAlert(err?.response?.data?.message || "บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  if (notFound) {
    return (
      <div className="tod-page">
        <div className="tod-empty">
          <h2>ไม่พบใบสั่งตัดนี้</h2>
          <p>รายการที่คุณเปิดอาจถูกลบไปแล้ว หรือยังไม่มีข้อมูลในระบบ</p>
          <button className="tod-btn-back" onClick={() => navigate("/staff/tailoringorders")}>
            <FiArrowLeft size={14} /> กลับไปคิวตัดชุด
          </button>
        </div>
      </div>
    );
  }

  if (!record) return <div className="tod-page"><p className="tod-hint">กำลังโหลด...</p></div>;

  return (
    <div className="tod-page">
      <div className="tod-header">
        <button className="tod-btn-back" onClick={() => navigate("/staff/tailoringorders")}>
          <FiArrowLeft size={14} /> กลับ
        </button>
        <div className="tod-header-main">
          <h1>ใบสั่งตัด {header.orderCode}</h1>
          <p>
            {customerName || "-"}
            {customerPhone && ` · ${customerPhone}`}
            {record.bill_no && ` · บิล ${record.bill_no}`}
          </p>
        </div>
        <button
          className="tod-btn-print"
          onClick={() => {
            logAction("print", "sales", `พิมพ์ออเดอร์ตัดชุด #${id}`);
            window.print();
          }}
        >
          <FiPrinter size={15} /> พิมพ์
        </button>
      </div>

      <div className="tod-card">
        <div className="tod-card-head">
          <h3><FiUser size={16} /> ข้อมูลลูกค้า</h3>
          <span className="tod-hint-inline">แก้ชื่อหรือเบอร์โทรได้ แล้วกดบันทึกด้านล่าง</span>
        </div>
        <div className="tod-grid two">
          <div className="tod-field">
            <label>ชื่อ-นามสกุลลูกค้า</label>
            <input
              value={customerName}
              placeholder="เช่น สมหญิง ใจดี"
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="tod-field">
            <label>เบอร์โทร (10 หลัก)</label>
            <input
              inputMode="numeric"
              maxLength={10}
              value={customerPhone}
              placeholder="0812345678"
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            />
          </div>
        </div>
      </div>

      <div className="tod-appt-bar">
        <div className={`tod-appt-card tone-${nextApptInfo.tone}`}>
          <span className="tod-appt-label">วันนัดถัดไป</span>
          <strong className="tod-appt-date">
            {nextAppointment
              ? `${formatDateTH(nextAppointment.date)}${nextAppointment.time ? ` ${nextAppointment.time} น.` : ""}`
              : "ยังไม่มีนัด"}
          </strong>
          <span className="tod-appt-tag">
            {nextAppointment ? `${nextAppointment.purpose} · ${nextApptInfo.text}` : "กำหนดวันนัดได้ด้านล่าง"}
          </span>
        </div>
        <div className={`tod-appt-card tone-${deadlineInfo.tone}`}>
          <span className="tod-appt-label">กำหนดส่งงาน</span>
          <strong className="tod-appt-date">{formatDateTH(header.deadline)}</strong>
          <span className="tod-appt-tag">{deadlineInfo.text}</span>
        </div>
      </div>

      <div className="tod-payment-card">
        <div className="tod-payment-rows">
          <div className="tod-payment-row">
            <span>ค่าตัดรวมทุกชิ้น ({items.length} ชิ้น)</span>
            <strong>{baht(totalPrice)}</strong>
          </div>
          <div className="tod-payment-row">
            <span>ค่าแก้ไขรวมทุกรอบ ({alterationCount} รอบ)</span>
            <strong>{alterationCount > 0 ? baht(totalAlterationFees) : "—"}</strong>
          </div>
          <div className="tod-payment-row">
            <span>มัดจำที่รับแล้ว{header.depositPaymentMethod && ` (${header.depositPaymentMethod})`}</span>
            <strong>−{baht(deposit)}</strong>
          </div>
        </div>
        <div className="tod-payment-total">
          <span>ยอดที่ต้องเก็บตอนรับชุด</span>
          <strong>{baht(remainingBalance)}</strong>
          <Select
            className="tod-payment-method-select"
            value={finalPaymentMethod}
            onChange={(e) => setFinalPaymentMethod(e.target.value)}
          >
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </div>
      </div>

      <div className="tod-card">
        <div className="tod-card-head">
          <h3><FiCalendar size={16} /> วันนัดหมาย</h3>
          <span className="tod-hint-inline">กำหนดได้ว่านัดวันไหน และนัดมาทำอะไร</span>
        </div>

        {appointments.length === 0 && (
          <p className="tod-hint">ยังไม่มีการนัดหมาย — กดปุ่มด้านล่างเพื่อเพิ่มวันนัดถัดไป</p>
        )}

        {appointments.map((a) => (
          <div key={a.id} className={`tod-appt-row ${a.done ? "is-done" : ""}`}>
            <div className="tod-field">
              <label>วันที่นัด</label>
              <input
                type="date"
                value={a.date}
                onChange={(e) => updateAppointment(a.id, "date", e.target.value)}
              />
            </div>
            <div className="tod-field tod-field-time">
              <label>เวลานัด</label>
              <input
                type="time"
                value={a.time}
                onChange={(e) => updateAppointment(a.id, "time", e.target.value)}
              />
            </div>
            <div className="tod-field">
              <label>นัดมาทำอะไร</label>
              <input
                list="tod-appt-purposes"
                value={a.purpose}
                placeholder="เช่น ลองชุด"
                onChange={(e) => updateAppointment(a.id, "purpose", e.target.value)}
              />
            </div>
            <div className="tod-field">
              <label>หมายเหตุ</label>
              <input
                value={a.note}
                placeholder="เช่น ลองครั้งที่ 2"
                onChange={(e) => updateAppointment(a.id, "note", e.target.value)}
              />
            </div>
            <label className="tod-appt-done">
              <input
                type="checkbox"
                checked={a.done}
                onChange={(e) => updateAppointment(a.id, "done", e.target.checked)}
              />
              นัดนี้ผ่านแล้ว
            </label>
            <button
              type="button"
              className="tod-icon-btn"
              onClick={() => removeAppointment(a.id)}
              aria-label="ลบวันนัดนี้"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}

        <datalist id="tod-appt-purposes">
          {APPOINTMENT_PURPOSES.map((p) => <option key={p} value={p} />)}
        </datalist>

        <button type="button" className="tod-btn-add" onClick={addAppointment}>
          <FiPlus size={14} /> เพิ่มวันนัด
        </button>
      </div>

      <div className="tod-items">
        {items.map((it, idx) => {
          const activeGarment = GARMENT_TYPES.find((g) => g.key === it.garmentType);
          const garmentTypeFields = MEASUREMENT_FIELDS[it.garmentType] || [];
          const variance =
            (Number(it.postCut.fabricIssuedMeters) || 0) - (Number(it.postCut.fabricUsedMeters) || 0);
          const seamRows = SEAM_ALLOWANCE_ROWS.filter((row) => it.seamAllowance?.[row.key]);
          const itemAlterationFee = alterationFeeOf(it);

          return (
            <div key={it.id} className="tod-card">
              <div className="tod-card-head">
                <h3>
                  ชิ้นที่ {idx + 1}: {garmentLabel(it.garmentType) || "ยังไม่เลือกประเภท"}
                  {it.subtype && ` (${it.subtype})`}
                </h3>
                <Select
                  className="tod-status-select"
                  value={it.status}
                  onChange={(e) => updateItem(it.id, { status: e.target.value })}
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>

              {garmentTypeFields.length > 0 && (
                <div className="tod-section">
                  <div className="measure-titlebar">
                    <h4>ขนาดตัว{activeGarment ? ` (${activeGarment.label})` : ""}</h4>
                    <UnitToggle unit={measureUnit} onChange={setMeasureUnit} />
                  </div>
                  <p className="tod-hint">
                    แก้ไขได้ทุกช่อง — "ปัจจุบัน" คือขนาดจริงตอนนี้ ส่วนเล็กสุด/ใหญ่สุดคือช่วงที่เผื่อไว้แก้ได้
                    {measureUnit === "in" && " (ระบบบันทึกเป็นซม. ให้อัตโนมัติ: 1 นิ้ว = 2.54 ซม.)"}
                  </p>
                  <div className="tod-measure-table tod-measure-edit">
                    <div className="tod-measure-row tod-measure-head">
                      <span>จุดวัด</span>
                      <span>ปัจจุบัน ({unitLabel})</span>
                      <span>เล็กสุด ({unitLabel})</span>
                      <span>ใหญ่สุด ({unitLabel})</span>
                      <span />
                    </div>

                    {garmentTypeFields.map(([fKey, fLabel]) => {
                      const m = it.measurements?.[fKey] || {};
                      return (
                        <div key={fKey} className="tod-measure-row">
                          <span className="tod-measure-label">{fLabel}</span>
                          {["current", "min", "max"].map((sub) => (
                            <MeasureInput
                              key={sub}
                              placeholder="-"
                              cm={m[sub]}
                              unit={measureUnit}
                              onChange={(v) => updateMeasurement(it.id, fKey, sub, v)}
                            />
                          ))}
                          <span />
                        </div>
                      );
                    })}

                    {(it.extraMeasurements || []).map((m) => (
                      <div key={m.id} className="tod-measure-row">
                        <input
                          className="tod-measure-label-input"
                          placeholder="ชื่อจุดวัด"
                          value={m.label}
                          onChange={(e) => updateExtraMeasurement(it.id, m.id, "label", e.target.value)}
                        />
                        {["current", "min", "max"].map((sub) => (
                          <MeasureInput
                            key={sub}
                            placeholder="-"
                            cm={m[sub]}
                            unit={measureUnit}
                            onChange={(v) => updateExtraMeasurement(it.id, m.id, sub, v)}
                          />
                        ))}
                        <button
                          type="button"
                          className="tod-icon-btn"
                          onClick={() => removeExtraMeasurement(it.id, m.id)}
                          aria-label="ลบจุดวัดนี้"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="tod-btn-add" onClick={() => addExtraMeasurement(it.id)}>
                    <FiPlus size={14} /> เพิ่มจุดวัดเฉพาะ
                  </button>
                </div>
              )}

              <div className="tod-section">
                <h4>ข้อมูลผ้า</h4>
                <div className="tod-info-grid">
                  <div className="tod-info-row"><span>แหล่งที่มา</span><strong>{it.fabricSource === "customer" ? "ลูกค้านำมาเอง" : "ผ้าของร้าน"}</strong></div>
                  <div className="tod-info-row"><span>ชื่อผ้า</span><strong>{it.fabric?.fabricName || "-"}</strong></div>
                  <div className="tod-info-row"><span>ประเภท</span><strong>{it.fabric?.fabricType || "-"}</strong></div>
                  <div className="tod-info-row"><span>สี</span><strong>{it.fabric?.colorName || "-"}</strong></div>
                  <div className="tod-info-row"><span>ลวดลาย</span><strong>{it.fabric?.patternName || "-"}</strong></div>
                  {it.fabricSource === "shop" && (
                    <div className="tod-info-row"><span>ราคาต่อเมตร</span><strong>{baht(it.shopFabric?.pricePerMeter)}</strong></div>
                  )}
                </div>
                {it.fabricSource === "customer" && it.customerFabricPhotos?.length > 0 && (
                  <div className="tod-thumb-grid">
                    {it.customerFabricPhotos.map((img) => (
                      <ImageThumb key={img.id} src={img.preview} alt="สภาพผ้าตอนรับ" />
                    ))}
                  </div>
                )}
              </div>

              <div className="tod-section">
                <h4>ภาพร่าง / แบบแนบ</h4>
                {(it.designImages || []).length === 0 && (
                  <p className="tod-hint">ยังไม่มีรูปแนบ — กดปุ่มด้านล่างเพื่อเพิ่มรูป</p>
                )}
                <div className="tod-thumb-grid">
                  {(it.designImages || []).map((img) => (
                    <EditableThumb
                      key={img.id}
                      src={img.preview}
                      alt="แบบตัด"
                      disabled={photoBusy}
                      onReplace={(file) => handleReplacePhoto(it.id, img.id, file)}
                      onDelete={() => handleDeletePhoto(it.id, img.id)}
                    />
                  ))}
                </div>
                <label className={`tod-btn-add tod-btn-upload ${photoBusy ? "is-disabled" : ""}`}>
                  <FiUpload size={14} /> {photoBusy ? "กำลังอัปโหลด..." : "เพิ่มรูปภาพร่าง / แบบแนบ"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={photoBusy}
                    onChange={(e) => {
                      const files = e.target.files;
                      e.target.value = "";
                      handleAddPhotos(it.id, files);
                    }}
                  />
                </label>
              </div>

              {seamRows.length > 0 && (
                <div className="tod-section">
                  <div className="measure-titlebar">
                    <h4>ส่วนเผื่อไซซ์</h4>
                    <UnitToggle unit={measureUnit} onChange={setMeasureUnit} />
                  </div>
                  <div className="tod-info-grid">
                    {seamRows.map((row) => (
                      <div key={row.key} className="tod-info-row">
                        <span>{row.label}</span>
                        <strong className={Number(it.seamAllowance[row.key]) ? "" : "is-zero"}>
                          {formatLength(it.seamAllowance[row.key], measureUnit)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="tod-section">
                <h4>ราคาและผ้าที่ใช้จริง</h4>
                <div className="tod-grid three">
                  <div className="tod-field">
                    <label>ค่าตัดชิ้นนี้</label>
                    <input value={baht(it.price)} readOnly disabled />
                  </div>
                  <div className="tod-field">
                    <label>ผ้าเบิกจริง (เมตร)</label>
                    <input
                      type="number" min="0" step="0.1"
                      value={it.postCut.fabricIssuedMeters}
                      onChange={(e) => updatePostCut(it.id, "fabricIssuedMeters", e.target.value)}
                    />
                  </div>
                  <div className="tod-field">
                    <label>ผ้าที่ใช้จริง (เมตร)</label>
                    <input
                      type="number" min="0" step="0.1"
                      value={it.postCut.fabricUsedMeters}
                      onChange={(e) => updatePostCut(it.id, "fabricUsedMeters", e.target.value)}
                    />
                  </div>
                </div>
                {(it.postCut.fabricIssuedMeters || it.postCut.fabricUsedMeters) && (
                  <p className="tod-hint">เหลือ/ต่างจากที่เบิก {variance.toFixed(2)} เมตร</p>
                )}
              </div>

              <div className="tod-section">
                <div className="tod-section-head">
                  <h4>ประวัติการแก้ไข</h4>
                  {itemAlterationFee > 0 && (
                    <span className="tod-fee-sum">
                      ค่าแก้ไขชิ้นนี้รวม <b>{baht(itemAlterationFee)}</b>
                    </span>
                  )}
                </div>

                {it.alterationRows.length === 0 && (
                  <p className="tod-hint">ยังไม่มีการแก้ไข</p>
                )}

                {it.alterationRows.map((row, rIdx) => (
                  <div key={row.id} className="tod-alt-row">
                    <div className="tod-alt-row-head">
                      <span>รอบที่ {rIdx + 1}</span>
                      <span className="tod-alt-fee">
                        {Number(row.feeAmount) > 0 ? baht(row.feeAmount) : "ไม่คิดเงิน"}
                      </span>
                      <button
                        type="button"
                        className="tod-icon-btn"
                        onClick={() => removeAlterationRow(it.id, row.id)}
                        aria-label="ลบ"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <div className="tod-grid three">
                      <div className="tod-field">
                        <label>วันที่แก้</label>
                        <input
                          type="date" value={row.date}
                          onChange={(e) => updateAlterationRow(it.id, row.id, "date", e.target.value)}
                        />
                      </div>
                      <div className="tod-field">
                        <label>ปล่อย/เก็บกี่ ซม.</label>
                        <input
                          value={row.adjustCm} placeholder="เช่น ปล่อย 2 ซม."
                          onChange={(e) => updateAlterationRow(it.id, row.id, "adjustCm", e.target.value)}
                        />
                      </div>
                      <div className="tod-field">
                        <label>ค่าแก้ไขรอบนี้ (บาท)</label>
                        <input
                          type="number" min="0" value={row.feeAmount} placeholder="0"
                          onChange={(e) => updateAlterationRow(it.id, row.id, "feeAmount", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="tod-field full">
                      <label>แก้จุดไหน</label>
                      <textarea
                        rows={2} value={row.point}
                        onChange={(e) => updateAlterationRow(it.id, row.id, "point", e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <button type="button" className="tod-btn-add" onClick={() => addAlterationRow(it.id)}>
                  <FiPlus size={14} /> เพิ่มรอบการแก้ไข
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="tod-save-bar">
        <button className="tod-btn-save" onClick={handleSave} disabled={saving}>
          <FiCheck size={16} /> {saving ? "กำลังบันทึก..." : "บันทึกการอัปเดต"}
        </button>
      </div>
    </div>
  );
}
