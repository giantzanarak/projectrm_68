import { measureField } from "./tailorCalc";

const DEFAULT_KEYS = ["chest", "waist", "hip"];

const n = (v) => Number(v).toLocaleString("th-TH", { maximumFractionDigits: 1 });

export const emptyRange = (key = "") => ({
  field_key: key,
  field_label: key ? measureField(key).label : "",
  min_cm: "",
  max_cm: "",
});

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

export const rangeText = (r) => `${r.field_label} ${n(r.min_cm)}–${n(r.max_cm)} ซม.`;

