import { useState } from "react";

export const CM_PER_INCH = 2.54;
const CM_PER_UNIT = { cm: 1, in: CM_PER_INCH, m: 100 };
const UNIT_LABEL = { cm: "ซม.", in: "นิ้ว", m: "ม." };

export const MEASURE_UNITS = [
  { key: "cm", label: UNIT_LABEL.cm },
  { key: "in", label: UNIT_LABEL.in },
];
export const FABRIC_UNITS = [
  { key: "m", label: UNIT_LABEL.m },
  { key: "cm", label: UNIT_LABEL.cm },
  { key: "in", label: UNIT_LABEL.in },
];
const UNIT_NAME = { cm: "เซนติเมตร", in: "นิ้ว", m: "เมตร" };
export const unitNameOf = (unit) => UNIT_NAME[unit] || UNIT_NAME.cm;
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
    }
  };
  return [unit, setUnit];
}

export const useFabricUnit = () => useMeasureUnit("fabricLengthUnit", FABRIC_UNITS);

export const formatLength = (cm, unit) => {
  const v = cmToUnit(cm, unit);
  return v === "" ? "-" : `${v} ${unitLabelOf(unit)}`;
};

export const seamHint = ({ recommendCm: [lo, hi], perSide }, unit) =>
  `แนะนำ ${cmToUnit(lo, unit)}–${cmToUnit(hi, unit)} ${unitLabelOf(unit)}${perSide ? " ต่อข้าง" : ""}`;
