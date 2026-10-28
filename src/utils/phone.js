/* ═══════════════════════════════════════════════════════════
   เบอร์โทร — หน้าจอแสดง 0XX-XXX-XXXX แต่ฐานข้อมูลเก็บตัวเลขล้วน 10 หลัก
   (คอลัมน์ customer_phone เป็น varchar(10) — ส่งขีดไปจะบันทึกไม่ผ่าน)
═══════════════════════════════════════════════════════════ */
export const PHONE_LENGTH = 10;

export const onlyDigits = (value, max = PHONE_LENGTH) =>
  String(value ?? "").replace(/\D/g, "").slice(0, max);

/* ตัวเลขล้วนไม่เกิน 10 หลัก — ใช้ตอนส่งเข้า backend */
export const phoneDigits = (v) => onlyDigits(v);

export const isValidPhone = (value) =>
  new RegExp(`^\\d{${PHONE_LENGTH}}$`).test(String(value ?? ""));

export const isValidOptionalPhone = (value) =>
  !String(value ?? "").trim() || isValidPhone(value);

export const PHONE_HINT = "เบอร์โทรต้องเป็นตัวเลข 10 หลัก";

/* จัดรูปเบอร์เป็น 0XX-XXX-XXXX ให้อัตโนมัติขณะพิมพ์ */
export function formatPhone(v) {
  const d = phoneDigits(v);
  if (d.length > 6) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return d;
}
