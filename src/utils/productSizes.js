/* ═══════════════════════════════════════════════════════════
   ช่วงขนาดของชุด (size_ranges จาก backend) — กรอกตอนกด "ตัดเสร็จ"
   1 แถว = 1 จุดวัด: ใส่ได้ตั้งแต่ min_cm ถึง max_cm (ซม.)
═══════════════════════════════════════════════════════════ */
import { measureField } from "./tailorCalc";

/* จุดวัดที่ใช้บอกไซส์ตั้งต้น — เหมือนกันทุกชุด เพิ่ม/ลบแถวเองได้ */
const DEFAULT_KEYS = ["chest", "waist", "hip"];

const n = (v) => Number(v).toLocaleString("th-TH", { maximumFractionDigits: 1 });

export const emptyRange = (key = "") => ({
  field_key: key,
  field_label: key ? measureField(key).label : "",
  min_cm: "",
  max_cm: "",
});

/* แถวตั้งต้นของฟอร์ม: ช่วงเดิมของสินค้า หรือ รอบอก/เอว/สะโพก */
export function startRanges(existing) {
  if (existing?.length) {
    return existing.map((r) => ({
      field_key: r.field_key || "",
      field_label: r.field_label,
      min_cm: r.min_cm ?? "",
      max_cm: r.max_cm ?? "",
    }));
  }
  return DEFAULT_KEYS.map(emptyRange);
}

/* "รอบอก 86–92 ซม." */
export const rangeText = (r) => `${r.field_label} ${n(r.min_cm)}–${n(r.max_cm)} ซม.`;

