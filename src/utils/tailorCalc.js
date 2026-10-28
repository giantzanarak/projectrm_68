/* ═══════════════════════════════════════════════════════
   TAILOR CALC — ค่าวัดตัว + คิดราคาชุด
   ใช้ร่วมกันใน FabricCalculator, OutfitFormulas, OutfitEditor, SetPrice และใบสั่งตัด

   ร้านกรอกเองว่าใช้ผ้ากี่เมตร ระบบไม่คำนวณปริมาณผ้าจากค่าวัดแล้ว
   คิดแค่ราคา:  ค่าผ้า = เมตร × ราคาต่อเมตรของม้วน
   ไม่มีค่าแรง (ร้านจ่ายช่างเอง)
═══════════════════════════════════════════════════════ */

export const INCH_CM = 2.54;

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
export const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;
/* สายวัดละเอียดสุด ¼ นิ้ว */
export const roundQuarter = (n) => Math.round((Number(n) || 0) * 4) / 4;
export const cmToInch = (cm) => (cm === "" || cm == null ? "" : roundQuarter(Number(cm) / INCH_CM));
export const inchToCm = (inch) => (inch === "" || inch == null ? null : round2(Number(inch) * INCH_CM));

export const money = (n) =>
  `฿${round2(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ความยาวผ้าเป็นเมตร เช่น 2.50 ม. */
export const fmtMeter = (m) =>
  `${round2(m).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ม.`;

/* ── จุดวัดตัวที่รองรับ (หน่วยซม.) ── */
export const MEASURE_FIELDS = {
  /* ── รอบตัว ── */
  neck:        { label: "รอบคอ",       hint: "วัดรอบโคนคอ สอดนิ้วได้ 1 นิ้ว" },
  shoulder:    { label: "ไหล่",         hint: "จากปลายไหล่ซ้ายถึงขวา ผ่านหลัง" },
  chest:       { label: "รอบอก",        hint: "รอบส่วนที่กว้างที่สุด สายวัดขนานพื้น" },
  waist:       { label: "รอบเอว",       hint: "รอบส่วนที่คอดที่สุด" },
  hip:         { label: "รอบสะโพก",     hint: "รอบส่วนที่กว้างที่สุด" },
  armhole:     { label: "รอบวงแขน",     hint: "รอบวงแขนผ่านใต้รักแร้" },
  upperArm:    { label: "รอบต้นแขน",    hint: "รอบต้นแขนส่วนที่ใหญ่ที่สุด" },
  wrist:       { label: "รอบข้อมือ",    hint: "รอบข้อมือ เผื่อสวมมือผ่าน" },
  thigh:       { label: "รอบต้นขา",     hint: "รอบต้นขาส่วนที่ใหญ่ที่สุด" },
  legOpening:  { label: "ปลายขา",       hint: "รอบปลายขากางเกงที่ต้องการ" },

  /* ── ความยาว ── */
  frontLength: { label: "ความยาวหน้า",  hint: "จากบ่าลงมาถึงเอวด้านหน้า" },
  backLength:  { label: "ความยาวหลัง",  hint: "จากต้นคอลงมาถึงเอวด้านหลัง" },
  length:      { label: "ตัวยาว",       hint: "จากบ่าถึงชายเสื้อที่ต้องการ" },
  sleeve:      { label: "แขนยาว",       hint: "จากปลายไหล่ถึงปลายแขนที่ต้องการ" },
  skirtLength: { label: "ผ้าถุงยาว",     hint: "จากเอวถึงชายผ้าถุง/กระโปรง" },
  pantLength:  { label: "ขายาว",        hint: "จากเอวถึงปลายขา" },

  /* ── ชื่อเดิมของอีกเวอร์ชัน เก็บไว้กันข้อมูลเก่าพัง ── */
  bodyLen:     { label: "ตัวยาว",       hint: "จากบ่าถึงชายเสื้อ" },
  skirtLen:    { label: "ผ้าถุงยาว",     hint: "จากเอวถึงชายผ้าถุง" },
  pantLen:     { label: "ขายาว",        hint: "จากเอวถึงข้อเท้า" },
};

/* จุดวัดที่ให้เลือกในหน้าจัดการแบบชุด (ไม่รวมชื่อเดิม) */
export const MEASURE_KEYS = [
  "neck", "shoulder", "chest", "waist", "hip", "armhole", "upperArm", "wrist", "thigh", "legOpening",
  "frontLength", "backLength", "length", "sleeve", "skirtLength", "pantLength",
];

/* จุดวัดหลัก — ล็อกตายตัว ทุกแบบชุดวัดเหมือนกัน (หน้าคำนวณราคาชุดบังคับกรอก) */
export const CORE_MEASURE_KEYS = ["shoulder", "chest", "waist", "hip", "length", "sleeve"];

/* จุดวัดเสริม — เจ้าของร้านกดเพิ่มเองเมื่อชุดนั้นต้องใช้ */
export const EXTRA_MEASURE_KEYS = MEASURE_KEYS.filter((k) => !CORE_MEASURE_KEYS.includes(k));

/* กันหน้าพังทั้งหน้าเมื่อเจอจุดวัดที่โค้ดยังไม่รู้จัก */
export const measureField = (k) => MEASURE_FIELDS[k] || { label: String(k), hint: "" };

/* ค่าวัดตัวมาตรฐาน (ซม.) — ใช้เป็น placeholder อิงขนาดผู้หญิงไทยไซส์ M */
export const STD = {
  neck: 36, shoulder: 38, chest: 86, waist: 71, hip: 97,
  armhole: 41, upperArm: 28, wrist: 16.5, thigh: 56, legOpening: 41,
  frontLength: 41, backLength: 39.5, length: 61,
  sleeve: 56, skirtLength: 97, pantLength: 99,
  bodyLen: 61, skirtLen: 97, pantLen: 99,
};

/* ── แบบชุดมาตรฐาน (ใช้เมื่อโหลดจากฐานข้อมูลไม่ได้) — ชิ้นส่วนชุด ── */
export const OUTFITS = {
  "เสื้อ": { parts: ["เสื้อ"] },
  "กางเกง": { parts: ["กางเกง"] },
  "ผ้าซิ่น / ผ้าถุง": { parts: ["ผ้าถุง"] },
  "ชุดไทยผู้หญิง": { parts: ["เสื้อ", "ผ้าถุง", "สไบ"] },
  "ผ้าพันคอ": { parts: ["ผ้าพันคอ"] },
};

/* ── อุปกรณ์เสริมที่ใช้บ่อย (วัสดุที่ร้านซื้อมา ไม่ใช่ค่าแรง) ── */
export const ADDON_PRESETS = [
  { name: "กระดุม", price: 5, unit: "เม็ด" },
  { name: "ซิป", price: 25, unit: "เส้น" },
  /* ผ้าซับใน/ลูกไม้ ร้านซื้อขายเป็นเมตร */
  { name: "ผ้าซับใน", price: 120, unit: "ม." },
  { name: "ลูกไม้ตกแต่ง", price: 40, unit: "ม." },
];

export function addonTotal(addons = []) {
  return round2(addons.reduce((s, a) => s + (Number(a.qty) || 0) * (Number(a.price) || 0), 0));
}
