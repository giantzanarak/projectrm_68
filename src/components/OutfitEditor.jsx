export default function OutfitEditor({ value, onChange }) {
  const draft = value;
  const set = (patch) => onChange({ ...draft, ...patch });

  const parts = draft.parts || [];
  const setPart = (i, v) => set({ parts: parts.map((x, idx) => (idx === i ? v : x)) });
  const addPart = () => set({ parts: [...parts, ""] });
  const delPart = (i) => set({ parts: parts.filter((_, idx) => idx !== i) });
  const named = parts.filter((x) => String(x).trim());

  return (
    <div className="oe">
      <section className="oe-sec">
        <h3 className="oe-h">ข้อมูลแบบชุด</h3>
        <label className="oe-field">
          <span>ชื่อแบบชุด</span>
          <input value={draft.outfitName} placeholder="เช่น ชุดไทยจิตรลดา"
            onChange={(e) => set({ outfitName: e.target.value })} />
        </label>
      </section>

      <section className="oe-sec">
        <h3 className="oe-h">
          ชิ้นส่วนชุด
          <small>ชุดนี้มีอะไรบ้าง เช่น เสื้อ ผ้าถุง สไบ — หน้าคำนวณราคาชุดจะขึ้นแถวผ้าให้ตามนี้</small>
        </h3>
        {parts.map((name, i) => (
          <div className="oe-part-line" key={i}>
            <span className="oe-part-no">{i + 1}</span>
            <input placeholder="ชื่อชิ้นส่วน เช่น เสื้อ" value={name}
              onChange={(e) => setPart(i, e.target.value)} />
            <button type="button" className="oe-del" title="ลบชิ้นนี้" onClick={() => delPart(i)}>✕</button>
          </div>
        ))}
        <button type="button" className="oe-add" onClick={addPart}>+ เพิ่มชิ้นส่วน</button>
      </section>

      <section className="oe-summary">
        <div className="oe-summary-row">
          <span>ส่วนประกอบ</span>
          <div className="oe-tags">
            {named.length ? <em>{named.join(" + ")}</em> : <i>ยังไม่ได้ระบุชิ้นส่วน</i>}
          </div>
        </div>
      </section>
    </div>
  );
}
