export const PHONE_LENGTH = 10;

export const onlyDigits = (value, max = PHONE_LENGTH) =>
  String(value ?? "").replace(/\D/g, "").slice(0, max);

export const phoneDigits = (v) => onlyDigits(v);

export const isValidPhone = (value) =>
  new RegExp(`^\\d{${PHONE_LENGTH}}$`).test(String(value ?? ""));

export const isValidOptionalPhone = (value) =>
  !String(value ?? "").trim() || isValidPhone(value);

export const PHONE_HINT = "เบอร์โทรต้องเป็นตัวเลข 10 หลัก";

export function formatPhone(v) {
  const d = phoneDigits(v);
  if (d.length > 6) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return d;
}
