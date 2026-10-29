import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../api/http";
import Swal from "sweetalert2";
import { money, round2, fmtMeter } from "../utils/tailorCalc";
import { FiCheck } from "react-icons/fi";
import SizeRangeModal from "../components/SizeRangeModal";
import "../styles/setPrice.css";
import Select from "../components/Select";

const API = `${API_BASE}/api/fabric-calculator`;
const USERS_API = `${API_BASE}/users`;
const CATEGORY_API = `${API_BASE}/product-categories`;

const swalTheme = {
  popup: "sp-swal-popup",
  confirmButton: "sp-swal-confirm",
  cancelButton: "sp-swal-cancel",
};

export default function SetPrice() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const job = state?.job || null;

  const [users, setUsers] = useState([]);
  const [tailorId, setTailorId] = useState("");
  const [sell, setSell] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [finishing, setFinishing] = useState(null);

  const [categories, setCategories] = useState([]);
  const pattern = [...new Set((job?.rolls || []).map((r) => r.fabricName).filter((n) => n && n !== "-"))]
    .join(", ").slice(0, 255);
  const [product, setProduct] = useState({ category_id: "" });
  const setProductField = (key, v) => setProduct((p) => ({ ...p, [key]: v }));

  useEffect(() => {
    if (job) {
      axios.get(USERS_API)
        .then((r) => setUsers((r.data || []).filter((u) => !u.deleted_at)))
        .catch(() => setUsers([]));
      axios.get(CATEGORY_API)
        .then((r) => setCategories((r.data || []).filter((c) => !c.deleted_at)))
        .catch(() => setCategories([]));
    } else {
      loadHistory();
    }
  }, [job]);

  function loadHistory() {
    axios.get(`${API}/history`)
      .then((r) => setHistory(r.data || []))
      .catch(() => setHistory([]));
  }

  const usedByRoll = {};
  (job?.rolls || []).forEach((r) => { usedByRoll[r.rollCode] = (usedByRoll[r.rollCode] || 0) + (Number(r.meters) || 0); });

  const calc = useMemo(() => {
    const qty = Math.max(1, Number(job?.qty) || 1);
    const fabric = Number(job?.fabricCost) || 0;
    const addonPer = Number(job?.addonPerPiece) || 0;
    const addonTotal = round2(addonPer * qty);

    const costPer = round2(fabric / qty + addonPer);
    const costTotal = round2(fabric + addonTotal);

    const sellPer = Math.max(0, Number(sell) || 0);
    const sellTotal = round2(sellPer * qty);

    const profitPer = round2(sellPer - costPer);
    const profitTotal = round2(sellTotal - costTotal);
    const margin = sellPer > 0 ? round2((profitPer / sellPer) * 100) : 0;

    return {
      qty, fabric, addonPer, addonTotal,
      costPer, costTotal, sellPer, sellTotal,
      profitPer, profitTotal, margin,
    };
  }, [job, sell]);

  const canSave = calc.sellPer > 0 && !saving;
  const loss = calc.sellPer > 0 && calc.profitPer < 0;

  const handleSave = async () => {
    if (saving) return;
    if (loss) {
      const ok = await Swal.fire({
        icon: "warning",
        title: "ราคานี้ขาดทุน",
        html: `ต้นทุน <b>${money(calc.costPer)}</b>/ชุด แต่ตั้งขาย <b>${money(calc.sellPer)}</b><br/>
               ขาดทุนชุดละ <b>${money(Math.abs(calc.profitPer))}</b> ยืนยันหรือไม่`,
        showCancelButton: true, confirmButtonText: "ยืนยันราคานี้", cancelButtonText: "กลับไปแก้ไข",
        reverseButtons: true, buttonsStyling: false, customClass: swalTheme,
      });
      if (!ok.isConfirmed) return;
    }

    const ok = await Swal.fire({
      icon: "question",
      title: "บันทึกและตัดผ้าออกจากคลัง?",
      html: `ตัดผ้าออกจากคลัง<br/>${(job.rolls || [])
               .map((r) => `${r.rollCode} <b>${fmtMeter(r.meters)}</b>`).join("<br/>")}
             <br/><br/>ต้นทุนรวม <b>${money(calc.costTotal)}</b> · ขายรวม <b>${money(calc.sellTotal)}</b>
             <br/><br/><b>${job.outfit}</b> ${calc.qty} ชิ้น เข้าคลังเป็น "กำลังตัด"<br/>กดตัดเสร็จที่หน้าตั้งราคาขายแล้วจึงขายได้`,
      showCancelButton: true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก",
      reverseButtons: true, buttonsStyling: false, customClass: swalTheme,
    });
    if (!ok.isConfirmed) return;

    try {
      setSaving(true);
      const res = await axios.post(`${API}/commit`, {
        ...job.payload,
        tailor_id: tailorId || null,
        sell_price_per_piece: calc.sellPer,
        product: {
          category_id: product.category_id || null,
          pattern,
          parts: job.parts || [],
        },
      });

      const done = await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        html: `หักผ้าออกจากคลังแล้ว<br/>กำไรรวม <b>${money(calc.profitTotal)}</b>`
          + `<br/><br/><b>${job.outfit}</b> ล็อต <b>${res.data?.product?.lot_code || "-"}</b> ${calc.qty} ชิ้น
               อยู่ในคลังสถานะ "กำลังตัด"<br/>ตัดเสร็จแล้วกด ✓ ที่หน้าตั้งราคาขาย แล้วกรอกขนาดชุดเพื่อเปิดขาย`,
        showCancelButton: true,
        confirmButtonText: "ดูรายการที่ตั้งราคาไว้",
        cancelButtonText: "คำนวณชุดต่อไป",
        reverseButtons: true, buttonsStyling: false, customClass: swalTheme,
      });
      navigate(done.isConfirmed ? "/set-price" : "/fabriccalc", { replace: true });
    } catch (err) {
      Swal.fire({
        icon: "error", title: "บันทึกไม่สำเร็จ",
        text: err?.response?.data?.message || "เกิดข้อผิดพลาด",
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
    } finally { setSaving(false); }
  };

  if (!job) {
    return (
      <div className="sp-root">
        <header className="sp-top">
          <div>
            <h1 className="sp-title">ตั้งราคาขาย</h1>
            
          </div>
        </header>

        <div className="sp-start">
          <div className="sp-start-text">
            <h2>เริ่มจากคำนวณราคาชุดก่อน</h2>
            
          </div>
          <button className="sp-btn-gold" onClick={() => navigate("/fabriccalc")}>
            ไปคำนวณราคาชุด →
          </button>
        </div>

        <section className="sp-block">
          <p className="sp-block-title">ราคาที่เคยตั้งไว้</p>

          {history.length === 0 ? (
            <p className="sp-none">ยังไม่มีประวัติการตั้งราคา</p>
          ) : (
            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th>แบบชุด</th>
                    <th>ช่างตัด</th>
                    <th className="r">ต้นทุน/ชุด</th>
                    <th className="r">ขาย/ชุด</th>
                    <th className="r">กำไรรวม</th>
                    <th>สถานะ</th>
                    <th className="c">ตัดเสร็จ</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => {
                    const qty = Math.max(1, Number(h.qty) || 1);
                    const costPer = round2(Number(h.total_cost || 0) / qty);
                    const sellPer = Number(h.sell_price_per_piece || h.price_per_piece || 0);
                    const profit = round2(Number(h.total_sell_price || 0) - Number(h.total_cost || 0));
                    const cutting = h.product_status === "กำลังตัด";
                    return (
                      <tr key={h.calc_id}>
                        <td>{String(h.created_at || "").slice(0, 10)}</td>
                        <td>
                          {h.product_type}
                          {h.product_lot_code && <small className="sp-lot">ล็อต {h.product_lot_code}</small>}
                        </td>
                        <td>{h.tailor_name || <span className="sp-none-i">ไม่ระบุ</span>}</td>
                        <td className="r">{money(costPer)}</td>
                        <td className="r"><b>{money(sellPer)}</b></td>
                        <td className={`r ${profit < 0 ? "bad" : "good"}`}>{money(profit)}</td>
                        <td>
                          {h.product_status
                            ? <span className={`sp-status ${cutting ? "cutting" : ""}`}>{h.product_status}</span>
                            : <span className="sp-none-i">—</span>}
                        </td>
                        <td className="c">
                          {cutting && (
                            <button className="sp-finish-btn" title="ตัดเสร็จแล้ว — กรอกขนาดชุดแล้วเปิดขาย"
                              onClick={() => setFinishing({
                                id: h.product_id, name: h.product_name || h.product_type,
                                lot_code: h.product_lot_code, stock_qty: qty,
                              })}>
                              <FiCheck size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {finishing && (
          <SizeRangeModal product={finishing} mode="finish"
            onClose={() => setFinishing(null)} onSaved={loadHistory} />
        )}
      </div>
    );
  }

  return (
    <div className="sp-root">
      <header className="sp-top">
        <button className="sp-back" onClick={() => navigate(-1)}>← กลับไปหน้าคำนวณ</button>
        <div>
          <h1 className="sp-title">ตั้งราคาขาย</h1>
          
        </div>
      </header>

      <div className="sp-grid">
        <div className="sp-col">
          <section className="sp-block">
            <p className="sp-block-title">ผ้าที่จะตัดออกจากคลัง</p>
            <div className="sp-fabric">
              {(job.rolls || []).map((r, i) => (
                <div className="sp-fabric-row" key={i}>
                  <div>
                    <b>{r.rollCode}</b> · {r.fabricName}
                    <em>{r.label ? `${r.label} · ` : ""}{money(r.pricePerMeter)}/ม.</em>
                  </div>
                  <div className="r">
                    <b>{fmtMeter(r.meters)}</b>
                    <em>{money(r.meters * r.pricePerMeter)} · ม้วนนี้เหลือ {fmtMeter(r.remainingM - (usedByRoll[r.rollCode] || 0))}</em>
                  </div>
                </div>
              ))}
            </div>
            {job.measureNote && <p className="sp-fabric-note">ค่าวัด: {job.measureNote}</p>}
          </section>

          <section className="sp-block">
            <p className="sp-block-title"><b>1</b> มอบให้ช่างตัดคนไหนตัดชุดนี้</p>

            <label className="sp-f">
              <span>ช่างตัด</span>
              <Select value={tailorId} onChange={(e) => setTailorId(e.target.value)}>
                <option value="">— ยังไม่ระบุ —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}{u.nickname ? ` (${u.nickname})` : ""}
                    {u.role ? ` · ${u.role}` : ""}
                  </option>
                ))}
              </Select>
              
            </label>
          </section>

          <section className="sp-block">
            <p className="sp-block-title"><b>2</b> ตั้งราคาขาย</p>

            <label className="sp-f">
              <span>ราคาขาย ต่อ 1 ชุด</span>
              <div className="sp-num sp-num-lg">
                <i>฿</i>
                <input type="number" min="0" step="50" value={sell} placeholder="0"
                  onChange={(e) => setSell(e.target.value)} />
              </div>
              
            </label>

            
          </section>

          <section className="sp-block">
            <p className="sp-block-title"><b>3</b> ข้อมูลสินค้า</p>

            <div className="sp-product">
                <div className="sp-f">
                  <span>ชื่อสินค้า </span>
                  <p className="sp-auto-name">
                    <b>{job.outfit}</b> 
                    {job.parts?.length > 0 && <em>ส่วนประกอบ: {job.parts.join(" + ")}</em>}
                  </p>
                </div>
                <label className="sp-f">
                  <span>หมวดหมู่</span>
                  <Select value={product.category_id} onChange={(e) => setProductField("category_id", e.target.value)}>
                    <option value="">— ไม่ระบุ —</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                    ))}
                  </Select>
                </label>
                <div className="sp-f">
                  <span>ลวดลาย </span>
                  <p className="sp-auto-name">{pattern || "—"}</p>
                </div>
            </div>
          </section>
        </div>

        <div className="sp-col">
          <div className="sp-result">
            <div className="sp-big">
              <span className="sp-big-label">ราคาขายต่อชุด</span>
              <span className="sp-big-num">
                {calc.sellPer > 0 ? money(calc.sellPer) : "—"}
              </span>
              {calc.qty > 1 && calc.sellPer > 0 && (
                <span className="sp-big-sub">ทั้งหมด {calc.qty} ชุด = {money(calc.sellTotal)}</span>
              )}
            </div>

            <div className="sp-rows">
              <div className="sp-row">
                <span>ค่าผ้า {fmtMeter(job.totalMeters)} {calc.qty > 1 ? `(${calc.qty} ชุด)` : ""}</span>
                <span>{money(calc.fabric)}</span>
              </div>
              {calc.addonTotal > 0 && (
                <div className="sp-row">
                  <span>อุปกรณ์เสริม {calc.qty > 1 ? `${money(calc.addonPer)} × ${calc.qty}` : ""}</span>
                  <span>{money(calc.addonTotal)}</span>
                </div>
              )}
              <div className="sp-row sp-row-sum">
                <span>ต้นทุนรวม</span>
                <span>{money(calc.costTotal)}</span>
              </div>
              <div className="sp-row sp-row-sub">
                <span>ต้นทุนต่อชุด</span>
                <span>{money(calc.costPer)}</span>
              </div>
            </div>

            <div className={`sp-profit ${loss ? "loss" : calc.sellPer > 0 ? "ok" : ""}`}>
              <div className="sp-profit-main">
                <span>{loss ? "ขาดทุน" : "กำไร"}</span>
                <b>{calc.sellPer > 0 ? money(Math.abs(calc.profitTotal)) : "—"}</b>
              </div>
              {calc.sellPer > 0 && (
                <div className="sp-profit-sub">
                  ชุดละ {money(Math.abs(calc.profitPer))}
                  {!loss && ` · กำไร ${calc.margin}% ของราคาขาย`}
                </div>
              )}
            </div>

            <button className="sp-btn-gold" onClick={handleSave} disabled={!canSave}>
              {saving ? "กำลังบันทึก..." : "บันทึก + ตัดผ้า + เข้าคลัง (กำลังตัด)"}
            </button>

            {!canSave && !saving && (
              <p className="sp-hint">
                กรอกราคาขายก่อนจึงจะบันทึกได้
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
