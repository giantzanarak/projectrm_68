
export const INCH_CM = 2.54;

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
export const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;
export const roundQuarter = (n) => Math.round((Number(n) || 0) * 4) / 4;
export const cmToInch = (cm) => (cm === "" || cm == null ? "" : roundQuarter(Number(cm) / INCH_CM));
export const inchToCm = (inch) => (inch === "" || inch == null ? null : round2(Number(inch) * INCH_CM));

export const money = (n) =>
  `฿${round2(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtMeter = (m) =>
  `${round2(m).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ม.`;

export const MEASURE_FIELDS = {
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

  frontLength: { label: "ความยาวหน้า",  hint: "จากบ่าลงมาถึงเอวด้านหน้า" },
  backLength:  { label: "ความยาวหลัง",  hint: "จากต้นคอลงมาถึงเอวด้านหลัง" },
  length:      { label: "ตัวยาว",       hint: "จากบ่าถึงชายเสื้อที่ต้องการ" },
  sleeve:      { label: "แขนยาว",       hint: "จากปลายไหล่ถึงปลายแขนที่ต้องการ" },
  skirtLength: { label: "ผ้าถุงยาว",     hint: "จากเอวถึงชายผ้าถุง/กระโปรง" },
  pantLength:  { label: "ขายาว",        hint: "จากเอวถึงปลายขา" },

  bodyLen:     { label: "ตัวยาว",       hint: "จากบ่าถึงชายเสื้อ" },
  skirtLen:    { label: "ผ้าถุงยาว",     hint: "จากเอวถึงชายผ้าถุง" },
  pantLen:     { label: "ขายาว",        hint: "จากเอวถึงข้อเท้า" },
};

export const MEASURE_KEYS = [
  "neck", "shoulder", "chest", "waist", "hip", "armhole", "upperArm", "wrist", "thigh", "legOpening",
  "frontLength", "backLength", "length", "sleeve", "skirtLength", "pantLength",
];

export const CORE_MEASURE_KEYS = ["shoulder", "chest", "waist", "hip", "length", "sleeve"];

export const EXTRA_MEASURE_KEYS = MEASURE_KEYS.filter((k) => !CORE_MEASURE_KEYS.includes(k));

export const measureField = (k) => MEASURE_FIELDS[k] || { label: String(k), hint: "" };

export const STD = {
  neck: 36, shoulder: 38, chest: 86, waist: 71, hip: 97,
  armhole: 41, upperArm: 28, wrist: 16.5, thigh: 56, legOpening: 41,
  frontLength: 41, backLength: 39.5, length: 61,
  sleeve: 56, skirtLength: 97, pantLength: 99,
  bodyLen: 61, skirtLen: 97, pantLen: 99,
};

export const OUTFITS = {
  "เสื้อ": { parts: ["เสื้อ"] },
  "กางเกง": { parts: ["กางเกง"] },
  "ผ้าซิ่น / ผ้าถุง": { parts: ["ผ้าถุง"] },
  "ชุดไทยผู้หญิง": { parts: ["เสื้อ", "ผ้าถุง", "สไบ"] },
  "ผ้าพันคอ": { parts: ["ผ้าพันคอ"] },
};

export const ADDON_PRESETS = [
  { name: "กระดุม", price: 5, unit: "เม็ด" },
  { name: "ซิป", price: 25, unit: "เส้น" },
  { name: "ผ้าซับใน", price: 120, unit: "ม." },
  { name: "ลูกไม้ตกแต่ง", price: 40, unit: "ม." },
];

export function addonTotal(addons = []) {
  return round2(addons.reduce((s, a) => s + (Number(a.qty) || 0) * (Number(a.price) || 0), 0));
}
