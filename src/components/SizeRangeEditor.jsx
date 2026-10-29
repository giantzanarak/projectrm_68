import { MEASURE_KEYS, measureField } from "../utils/tailorCalc";
import { emptyRange } from "../utils/productSizes";

export default function SizeRangeEditor({ value, onChange }) {
  const rows = value || [];
  const set = (i, patch) => onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const del = (i) => onChange(rows.filter((_, idx) => idx !== i));
  const add = () => onChange([...rows, emptyRange()]);

  const pickKey = (i, key) =>
    set(i, key === "__other"
      ? { field_key: "", field_label: "" }
      : { field_key: key, field_label: measureField(key).label });

  return (
    <div className="szr">
      <div className="szr-head">
        <span>จุดวัด</span>
        <span>ใส่ได้ตั้งแต่</span>
        <span>ถึง</span>
        <span />
      </div>
      {rows.map((r, i) => (
        <div className="szr-row" key={i}>
          <div className="szr-label">
            <select value={r.field_key || "__other"} onChange={(e) => pickKey(i, e.target.value)}>
              {MEASURE_KEYS.map((k) => <option key={k} value={k}>{measureField(k).label}</option>)}
              <option value="__other">อื่น ๆ (พิมพ์เอง)</option>
            </select>
            {!r.field_key && (
              <input placeholder="ชื่อจุดวัด" value={r.field_label}
                onChange={(e) => set(i, { field_label: e.target.value })} />
            )}
          </div>
          {[["min_cm", "ตั้งแต่"], ["max_cm", "ถึง"]].map(([k, ph]) => (
            <div className="szr-num" key={k}>
              <input type="number" min="0" step="0.5" placeholder={ph} value={r[k]}
                onChange={(e) => set(i, { [k]: e.target.value })} />
              <i>ซม.</i>
            </div>
          ))}
          <button type="button" className="szr-del" title="ลบแถวนี้" onClick={() => del(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="szr-add" onClick={add}>+ เพิ่มจุดวัด</button>
    </div>
  );
}
