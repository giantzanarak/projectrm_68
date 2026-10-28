import { useState } from "react";
import { MEASURE_UNITS, cmToUnit, unitToCm } from "../utils/measureUnit";
import "../css/MeasureUnit.css";

export function UnitToggle({ unit, onChange, units = MEASURE_UNITS }) {
  return (
    <div className="measure-unit-toggle" role="group" aria-label="หน่วยวัด">
      {units.map((u) => (
        <button
          key={u.key}
          type="button"
          className={unit === u.key ? "active" : ""}
          aria-pressed={unit === u.key}
          onClick={() => onChange(u.key)}
        >
          {u.label}
        </button>
      ))}
    </div>
  );
}

// ระหว่างพิมพ์ใช้ข้อความที่ผู้ใช้พิมพ์เอง ไม่งั้นการปัดเศษตอนแปลงหน่วยจะกลืน "12." หรือ "12.50"
export function MeasureInput({ cm, unit, onChange, ...rest }) {
  const [draft, setDraft] = useState(null);
  return (
    <input
      type="number" inputMode="decimal"
      min="0" step="any"
      {...rest}
      value={draft ?? cmToUnit(cm, unit)}
      onFocus={() => setDraft(cmToUnit(cm, unit))}
      onBlur={() => setDraft(null)}
      onChange={(e) => {
        setDraft(e.target.value);
        onChange(unitToCm(e.target.value, unit));
      }}
    />
  );
}
