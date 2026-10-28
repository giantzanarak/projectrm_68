import { useState } from "react";

// ค่าที่วัดเก็บเป็นซม.เสมอ (backend ใช้ current_cm/min_cm/max_cm, width_cm) — แปลงหน่วยเฉพาะตอนแสดง/กรอก
// ความยาวม้วนผ้าเก็บเป็นเมตร → แปลงเป็นซม. ด้วย metersToCm/cmToMeters ก่อนส่งเข้าฟังก์ชันชุดนี้
export const CM_PER_INCH = 2.54;
const CM_PER_UNIT = { cm: 1, in: CM_PER_INCH, m: 100 };
const UNIT_LABEL = { cm: "ซม.", in: "นิ้ว", m: "ม." };

export const MEASURE_UNITS = [
  { key: "cm", label: UNIT_LABEL.cm },
  { key: "in", label: UNIT_LABEL.in },
];
// หน้าผ้า: หน้ากว้าง / ความยาวม้วน
export const FABRIC_UNITS = [
  { key: "m", label: UNIT_LABEL.m },
  { key: "cm", label: UNIT_LABEL.cm },
  { key: "in", label: UNIT_LABEL.in },
];
const UNIT_NAME = { cm: "เซนติเมตร", in: "นิ้ว", m: "เมตร" };
export const unitNameOf = (unit) => UNIT_NAME[unit] || UNIT_NAME.cm;
// ตัวอย่างหน้ากว้าง 110 ซม. ในหน่วยที่เลือก
export const widthExample = (unit) => `เช่น ${cmToUnit(110, unit)}`;
export const unitLabelOf = (unit) => UNIT_LABEL[unit] || UNIT_LABEL.cm;

const round = (n, digits = 2) => String(Math.round(n * 10 ** digits) / 10 ** digits);
const isBlank = (v) => v === "" || v == null || Number.isNaN(Number(v));

export const cmToUnit = (cm, unit) => {
  if (isBlank(cm)) return "";
  return round(Number(cm) / (CM_PER_UNIT[unit] || 1));
};

export const unitToCm = (text, unit) => {
  if (text === "" || Number.isNaN(Number(text))) return text;
  return unit === "cm" ? text : round(Number(text) * (CM_PER_UNIT[unit] || 1));
};

export const metersToCm = (m) => (isBlank(m) ? "" : round(Number(m) * 100));
export const cmToMeters = (cm) => (isBlank(cm) ? cm : round(Number(cm) / 100, 4));

// จำหน่วยที่เลือกไว้ในเบราว์เซอร์ ใช้ร่วมกันทุกหน้าที่ใช้ key เดียวกัน
export function useMeasureUnit(storageKey = "measureUnit", units = MEASURE_UNITS) {
  const fallback = units[0].key;
  const [unit, setUnitState] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return units.some((u) => u.key === saved) ? saved : fallback;
    } catch {
      return fallback;
    }
  });
  const setUnit = (next) => {
    setUnitState(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // ใช้งานต่อได้ แค่จำหน่วยไม่ได้
    }
  };
  return [unit, setUnit];
}

export const useFabricUnit = () => useMeasureUnit("fabricLengthUnit", FABRIC_UNITS);

// "30.5 ซม." / "12.01 นิ้ว" — ใช้แสดงค่าแบบอ่านอย่างเดียว
export const formatLength = (cm, unit) => {
  const v = cmToUnit(cm, unit);
  return v === "" ? "-" : `${v} ${unitLabelOf(unit)}`;
};

// คำแนะนำส่วนเผื่อ เช่น "แนะนำ 2.5–3 ซม. ต่อข้าง" → "แนะนำ 0.98–1.18 นิ้ว ต่อข้าง"
export const seamHint = ({ recommendCm: [lo, hi], perSide }, unit) =>
  `แนะนำ ${cmToUnit(lo, unit)}–${cmToUnit(hi, unit)} ${unitLabelOf(unit)}${perSide ? " ต่อข้าง" : ""}`;
