import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../api/http";
import {
  OUTFITS,
  STD,
  measureField,
  CORE_MEASURE_KEYS,
  EXTRA_MEASURE_KEYS,
  ADDON_PRESETS,
  addonTotal,
  round2,
  money,
} from "../utils/tailorCalc";
import { getOutfits, toOutfitMap } from "../api/outfitApi";
import { MeasureInput, UnitToggle } from "../components/MeasureUnit";
import { useMeasureUnit, cmToUnit, unitLabelOf, metersToCm, cmToMeters, CM_PER_INCH } from "../utils/measureUnit";
import "../styles/fabricCalc.css";

const API = `${API_BASE}/api/fabric-calculator`;

const partRow = (name = "") => ({ name, meters: "", rollId: "", otherFabric: false });

export default function FabricCalculator() {
  const navigate = useNavigate();
  const [outfitMap, setOutfitMap] = useState(OUTFITS);
  const outfitNames = useMemo(() => Object.keys(outfitMap), [outfitMap]);

  const [outfitText, setOutfitText] = useState("");
  const outfitName = outfitText.trim();
  const isKnown = Boolean(outfitMap[outfitName]);
  const isNew = Boolean(outfitName) && !isKnown;
  const knownParts = useMemo(() => outfitMap[outfitName]?.parts || [], [outfitName, outfitMap]);

  const [measureUnit, setMeasureUnit] = useMeasureUnit();
  const unitLabel = unitLabelOf(measureUnit);
  const cmPerUnit = measureUnit === "in" ? CM_PER_INCH : 1;
  const fmtLen = (m) =>
    `${Number(cmToUnit(metersToCm(Number(m) || 0), measureUnit)).toLocaleString("th-TH", { maximumFractionDigits: 2 })} ${unitLabel}`;
  const priceText = (perMeter) => `${money((Number(perMeter) || 0) * cmPerUnit / 100).replace(".00", "")}/${unitLabel}`;

  const [measure, setMeasure] = useState({});
  const [extraMeasures, setExtraMeasures] = useState([]);

  const [mainRollId, setMainRollId] = useState("");
  const [parts, setParts] = useState([partRow("ทั้งชุด")]);

  const [addons, setAddons] = useState([]);
  const [note, setNote] = useState("");

  const [rolls, setRolls] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [list, r, h] = await Promise.all([
        getOutfits().catch(() => []),
        axios.get(`${API}/rolls`).then((x) => x.data || []).catch(() => []),
        axios.get(`${API}/history`).then((x) => x.data || []).catch(() => []),
      ]);
      setRolls(r);
      setHistory(h);
      if (list.length) setOutfitMap(toOutfitMap(list));
    } catch {  }
  };

  const partsKey = isKnown ? `known:${outfitName}` : "new";
  useEffect(() => {
    setParts(isKnown
      ? (knownParts.length ? knownParts : ["ทั้งชุด"]).map((n) => partRow(n))
      : [partRow("")]);
  }, [partsKey]);

  const setMeasureField = (k, v) => setMeasure((p) => ({ ...p, [k]: v }));

  const addExtra = (key) => {
    if (!key) return;
    setExtraMeasures((p) => (key !== "__other" && p.some((x) => x.key === key)
      ? p
      : [...p, key === "__other"
        ? { key: "", label: "", value: "" }
        : { key, label: measureField(key).label, value: "" }]));
  };
  const setExtra = (i, field, v) =>
    setExtraMeasures((p) => p.map((x, idx) => (idx === i ? { ...x, [field]: v } : x)));
  const delExtra = (i) => setExtraMeasures((p) => p.filter((_, idx) => idx !== i));
  const unusedExtras = EXTRA_MEASURE_KEYS.filter((k) => !extraMeasures.some((x) => x.key === k));

  const setPart = (i, patch) => setParts((p) => p.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const addPart = () => setParts((p) => [...p, partRow("")]);
  const delPart = (i) => setParts((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p));

  const addAddon = (name) => {
    if (!name) return;
    const preset = ADDON_PRESETS.find((a) => a.name === name);
    setAddons((p) => {
      if (preset && p.some((a) => a.name === preset.name)) {
        return p.map((a) => (a.name === preset.name ? { ...a, qty: (Number(a.qty) || 0) + 1 } : a));
      }
      return [...p, preset ? { ...preset, qty: 1 } : { name: "", qty: 1, price: 0, unit: "ชิ้น" }];
    });
  };
  const setAddon = (i, key, v) =>
    setAddons((p) => p.map((a, idx) => (idx === i ? { ...a, [key]: v } : a)));
  const delAddon = (i) => setAddons((p) => p.filter((_, idx) => idx !== i));

  const rollById = useMemo(() => {
    const m = {};
    rolls.forEach((r) => { m[String(r.roll_id)] = r; });
    return m;
  }, [rolls]);

  const rollGroups = useMemo(() => {
    const g = {};
    rolls.forEach((r) => { (g[r.type_name || "อื่น ๆ"] = g[r.type_name || "อื่น ๆ"] || []).push(r); });
    return Object.entries(g);
  }, [rolls]);

  const lines = useMemo(() => parts.map((p) => {
    const rollId = String(p.otherFabric && p.rollId ? p.rollId : mainRollId);
    const roll = rollById[rollId] || null;
    const meters = Math.max(0, Number(p.meters) || 0);
    const pricePerMeter = Number(roll?.price_per_meter) || 0;
    return { ...p, rollId, roll, meters, pricePerMeter, cost: round2(meters * pricePerMeter) };
  }), [parts, mainRollId, rollById]);

  const filled = lines.filter((l) => l.roll && l.meters > 0);

  const shortRolls = useMemo(() => {
    const used = {};
    filled.forEach((l) => { used[l.rollId] = (used[l.rollId] || 0) + l.meters; });
    return Object.entries(used)
      .map(([id, m]) => ({ roll: rollById[id], need: round2(m), have: Number(rollById[id]?.length_remaining) || 0 }))
      .filter((x) => x.need > x.have);
  }, [filled, rollById]);

  const fabricCost = round2(filled.reduce((s, l) => s + l.cost, 0));
  const totalMeters = round2(filled.reduce((s, l) => s + l.meters, 0));
  const addonCost = useMemo(() => addonTotal(addons), [addons]);
  const cost = round2(fabricCost + addonCost);

  const missingCore = CORE_MEASURE_KEYS.filter((k) => !(Number(measure[k]) > 0));
  const namedParts = parts.filter((p) => String(p.name).trim());
  const problem = !outfitName
    ? "พิมพ์หรือเลือกแบบชุดก่อน"
    : isNew && !namedParts.length
        ? `วัดตัวให้ครบ: ยังขาด ${missingCore.map((k) => measureField(k).label).join(", ")}`
        : !mainRollId && !lines.some((l) => l.otherFabric && l.rollId)
          ? "เลือกผ้าที่ใช้"
          : !filled.length
            ? "กรอกความยาวผ้าของชิ้นส่วน"
            : lines.some((l) => l.meters > 0 && !l.roll)
              ? "เลือกผ้าให้ทุกชิ้นที่กรอกความยาว"
              : shortRolls.length
                ? `ผ้าไม่พอ: ${shortRolls.map((s) =>
                    `${s.roll?.fabric_name || "-"} ต้องใช้ ${fmtLen(s.need)} เหลือ ${fmtLen(s.have)}`).join(", ")}`
                : null;

  const measureNote = [
    ...CORE_MEASURE_KEYS.filter((k) => Number(measure[k]) > 0).map((k) => `${measureField(k).label} ${measure[k]} ซม.`),
    ...extraMeasures.filter((x) => x.label && Number(x.value) > 0).map((x) => `${x.label} ${x.value} ซม.`),
  ].join(", ");

  const rollName = (r) => r?.fabric_name || r?.type_name || "-";
  const rollLabel = (r) =>
    `${rollName(r)}${r.color_name ? ` · ${r.color_name}` : ""}${r.lot_number ? ` · ล็อต ${r.lot_number}` : ""} — ${priceText(r.price_per_meter)} · เหลือ ${fmtLen(r.length_remaining)}`;

  const rollOptions = rollGroups.map(([type, list]) => (
    <optgroup key={type} label={type}>
      {list.map((r) => <option key={r.roll_id} value={r.roll_id}>{rollLabel(r)}</option>)}
    </optgroup>
  ));

  const goSetPrice = () => {
    if (problem) return;
    const partNames = namedParts.map((p) => String(p.name).trim());
    navigate("/set-price", {
      state: {
        job: {
          outfit: outfitName,
          isNewOutfit: isNew,
          parts: partNames,
          qty: 1,
          fabricCost,
          addonPerPiece: round2(addonCost),
          addons: addons.filter((a) => a.name && Number(a.qty) > 0),
          totalMeters,
          measureNote,
          rolls: filled.map((l) => ({
            rollCode: l.roll.roll_code || `#${l.roll.roll_id}`,
            fabricName: rollName(l.roll),
            label: l.name,
            meters: l.meters,
            pricePerMeter: l.pricePerMeter,
            remainingM: Number(l.roll.length_remaining) || 0,
          })),
          payload: {
            product_type: outfitName,
            qty: 1,
            note: [note, measureNote].filter(Boolean).join(" | "),
            extra_cost_per_piece: round2(addonCost),
            items: filled.map((l) => ({
              roll_id: Number(l.rollId),
              meters_per_piece: l.meters,
              part_name: (String(l.name).trim() || rollName(l.roll)).slice(0, 100),
            })),
          },
        },
      },
    });
  };

  const measureInput = (k, i) => (
    <label className="fc-m" key={k}>
      <span><i>{i + 1}</i>{measureField(k).label}</span>
      <div className="fc-with-unit">
        <MeasureInput cm={measure[k] ?? ""} unit={measureUnit}
          placeholder={cmToUnit(STD[k], measureUnit)}
          onChange={(v) => setMeasureField(k, v)} />
        <i>{unitLabel}</i>
      </div>
      <small>{measureField(k).hint}</small>
    </label>
  );

  return (
    <div className="fc-root">
      <header className="fc-top">
        <div>
          <h1 className="fc-title">คำนวณราคาชุด</h1>
          
        </div>
        <UnitToggle unit={measureUnit} onChange={setMeasureUnit} />
      </header>

      <div className="fc-layout">
        <div className="fc-card">

          <div className="fc-block">
            <p className="fc-block-title"><b>1</b> แบบชุด</p>
            <label className="fc-f">
              <span>พิมพ์หรือเลือกแบบชุด</span>
              <input list="fc-outfits" value={outfitText} placeholder="เช่น ชุดไทยจิตรลดา"
                onChange={(e) => setOutfitText(e.target.value)} />
              <datalist id="fc-outfits">
                {outfitNames.map((o) => <option key={o} value={o} />)}
              </datalist>
            </label>
            <p className="fc-parts-line">
              {!outfitName
                ? "พิมพ์ชื่อบางส่วนแล้วเลือกจากรายการ หรือพิมพ์ชื่อชุดใหม่ได้เลย"
                : isNew
                  }
            </p>
          </div>

          <div className="fc-block">
            <p className="fc-block-title">
              <b>2</b> วัดตัวลูกค้า
              
            </p>

            <div className="fc-measures">
              {CORE_MEASURE_KEYS.map(measureInput)}
            </div>

            <div className="fc-extra">
              <label className="fc-f fc-extra-pick">
                <span>จุดวัดเสริม</span>
                <select value="" onChange={(e) => addExtra(e.target.value)}>
                  <option value="">+ เลือกจุดวัดที่จะเพิ่ม...</option>
                  {unusedExtras.map((k) => <option key={k} value={k}>{measureField(k).label}</option>)}
                  <option value="__other">+เพิ่มรายการ</option>
                </select>
              </label>

              {extraMeasures.map((x, i) => (
                <div className="fc-extra-row" key={i}>
                  {x.key ? (
                    <span className="fc-extra-name">{x.label}</span>
                  ) : (
                    <input placeholder="ชื่อจุดวัด เช่น รอบศอก" autoFocus
                      value={x.label} onChange={(e) => setExtra(i, "label", e.target.value)} />
                  )}
                  <div className="fc-extra-val">
                    <MeasureInput cm={x.value} unit={measureUnit} autoFocus={Boolean(x.key)}
                      placeholder={x.key ? cmToUnit(STD[x.key] ?? 0, measureUnit) : "0"}
                      onChange={(v) => setExtra(i, "value", v)} />
                    <i>{unitLabel}</i>
                  </div>
                  <button className="fc-x" title="ลบจุดวัดนี้" onClick={() => delExtra(i)}>✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="fc-block">
            <p className="fc-block-title">
              <b>3</b> ผ้าที่ใช้
            </p>

            <label className="fc-f">
              <span>ผ้าที่ใช้ตัดชุดนี้</span>
              <select value={mainRollId} onChange={(e) => setMainRollId(e.target.value)}>
                <option value="">เลือกผ้า...</option>
                {rollOptions}
              </select>
            </label>
            {rolls.length === 0 && <p className="fc-hint">ยังไม่มีม้วนผ้าในคลังที่ใช้ได้</p>}

            <div className="fc-parts-table">
              <div className="fc-pt-head">
                <span>ชิ้นส่วน</span>
                <span>ความยาว ({unitLabel})</span>
                <span className="r">ต้นทุน</span>
              </div>
              {lines.map((l, i) => (
                <div className="fc-pt-row" key={i}>
                  <div className="fc-pt-name">
                    {isNew ? (
                      <input placeholder="ชื่อชิ้นส่วน เช่น เสื้อ" value={parts[i].name}
                        onChange={(e) => setPart(i, { name: e.target.value })} />
                    ) : (
                      <b>{l.name}</b>
                    )}
                    {l.otherFabric ? (
                      <select value={parts[i].rollId} onChange={(e) => setPart(i, { rollId: e.target.value })}>
                        <option value="">เลือกผ้าของชิ้นนี้...</option>
                        {rollOptions}
                      </select>
                    ) : (
                      <button type="button" className="fc-link fc-pt-switch"
                        onClick={() => setPart(i, { otherFabric: true })}>
                        ชิ้นนี้ใช้ผ้าอื่น
                      </button>
                    )}
                  </div>
                  <div className="fc-extra-val">
                    <MeasureInput cm={metersToCm(parts[i].meters)} unit={measureUnit} placeholder="0"
                      onChange={(cm) => setPart(i, { meters: cmToMeters(cm) })} />
                    <i>{unitLabel}</i>
                  </div>
                  <span className="fc-fab-sum">
                    {l.roll && l.meters > 0 ? money(l.cost) : "—"}
                    {l.roll && l.meters > 0 && <small>{fmtLen(l.meters)} × {priceText(l.pricePerMeter)}</small>}
                  </span>
                  {isNew && parts.length > 1
                    ? <button className="fc-x" title="ลบชิ้นนี้" onClick={() => delPart(i)}>✕</button>
                    : <span />}
                </div>
              ))}
            </div>
            {isNew && <button className="fc-link" onClick={addPart}>+ เพิ่มชิ้นส่วน</button>}
          </div>

          <div className="fc-block">
            <p className="fc-block-title">
              <b>4</b> อุปกรณ์เสริม
              
            </p>

            <div className="fc-addon-picks">
              <div className="fc-addon-chips">
                {ADDON_PRESETS.map((a) => {
                  const added = addons.some((x) => x.name === a.name);
                  return (
                    <button key={a.name} type="button"
                      className={`fc-addon-chip ${added ? "added" : ""}`}
                      onClick={() => addAddon(a.name)}
                      title={added ? "เพิ่มจำนวนอีก 1" : "เพิ่มรายการนี้"}>
                      <b>{added ? "✓" : "+"} {a.name}</b>
                      <small>{money(a.price).replace(".00", "")}/{a.unit}</small>
                    </button>
                  );
                })}
              </div>
              <button type="button" className="fc-link" onClick={() => addAddon("__custom")}>
                + เพิ่มรายการเอง
              </button>
            </div>

            {addons.length > 0 && (
              <div className="fc-addon-table">
                <div className="fc-addon-head">
                  <span>รายการ</span>
                  <span>จำนวน</span>
                  <span>ราคาต่อหน่วย</span>
                  <span className="r">รวม</span>
                  <span />
                </div>
                {addons.map((a, i) => (
                  <div className="fc-addon-row" key={i}>
                    <input className="fc-addon-name" value={a.name} placeholder="ชื่อรายการ"
                      onChange={(e) => setAddon(i, "name", e.target.value)} />
                    <div className="fc-addon-num">
                      <input type="number" min="0" step={a.unit === "ม." ? "0.1" : "1"} value={a.qty}
                        onChange={(e) => setAddon(i, "qty", e.target.value)} />
                      <i>{a.unit}</i>
                    </div>
                    <div className="fc-addon-num fc-addon-price">
                      <i>฿</i>
                      <input type="number" min="0" value={a.price}
                        onChange={(e) => setAddon(i, "price", e.target.value)} />
                    </div>
                    <span className="fc-addon-sum">
                      {money((Number(a.qty) || 0) * (Number(a.price) || 0))}
                    </span>
                    <button className="fc-x" title="ลบรายการนี้" onClick={() => delAddon(i)}>✕</button>
                  </div>
                ))}
                <div className="fc-addon-total">
                  <span>รวมอุปกรณ์เสริม</span>
                  <b>{money(addonCost)}</b>
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="fc-col">
          <div className="fc-result">
            <div className="fc-big cost">
              <span className="fc-big-label">ต้นทุนชุดนี้</span>
              <span className="fc-big-num">{money(cost)}</span>
              <span className="fc-big-sub">{outfitName || "ยังไม่ได้เลือกแบบชุด"}{isNew ? " (ชุดใหม่)" : ""}</span>
            </div>

            <div className="fc-costlines">
              {filled.map((l, i) => (
                <div key={i}>
                  <span>{String(l.name).trim() || rollName(l.roll)} {fmtLen(l.meters)}</span>
                  <span>{money(l.cost)}</span>
                </div>
              ))}
              <div><span>ค่าผ้ารวม ({fmtLen(totalMeters)})</span><span>{money(fabricCost)}</span></div>
              <div><span>อุปกรณ์เสริม ({addons.length} รายการ)</span><span>{money(addonCost)}</span></div>
              <div className="sum"><span>ต้นทุนรวม</span><span>{money(cost)}</span></div>
            </div>

            <div className={`fc-verdict ${problem ? (shortRolls.length ? "bad" : "wait") : "ok"}`}>
              {problem || `ผ้าพอ — ตัดผ้าออก ${fmtLen(totalMeters)}`}
            </div>

            <label className="fc-f fc-f-note">
              <span>หมายเหตุ (บันทึกในประวัติ)</span>
              <input value={note} placeholder="เช่น ออเดอร์คุณสมศรี"
                onChange={(e) => setNote(e.target.value)} />
            </label>
            <button className="fc-btn-gold" onClick={goSetPrice} disabled={Boolean(problem)}>
              ตั้งราคาขาย →
            </button>
          </div>

          <details className="fc-history">
            <summary>ประวัติล่าสุด ({history.length})</summary>
            <div className="fc-table-wrap">
              <table className="fc-table">
                <thead>
                  <tr><th>แบบชุด</th><th>ต้นทุน</th><th>เวลา</th></tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr><td colSpan={3} className="fc-table-empty">ยังไม่มีประวัติ</td></tr>
                  ) : (
                    history.map((h) => (
                      <tr key={h.calc_id}>
                        <td>{h.product_type}</td>
                        <td>{money(h.total_cost)}</td>
                        <td>{String(h.created_at).slice(0, 10)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
