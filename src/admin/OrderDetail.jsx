import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPrinter, FiExternalLink, FiImage } from "react-icons/fi";
import {
  baht,
  getBills, getBillDetails, getPayments, getProducts, getEmployees,
} from "../api/billApi";
import { getTailoringOrdersByBill, getTailoringOrderByCode } from "../api/fetch_api_admin";
import {
  GARMENT_TYPES, MEASUREMENT_FIELDS, SEAM_ALLOWANCE_ROWS, garmentLabel,
} from "./AddTailoringOrders";
import { transformDbOrder, dueLabel, formatDateTH, tailoringTotals } from "../utils/tailoringOrder";
import { logAction } from "../api/activityLog";
import { UnitToggle } from "../components/MeasureUnit";
import { useMeasureUnit, cmToUnit, unitLabelOf, formatLength } from "../utils/measureUnit";
import "../css/OrderDetail.css";

const ImageThumb = ({ src, alt }) => {
  const [broken, setBroken] = useState(false);
  if (broken || !src) {
    return (
      <div className="uod-thumb uod-thumb-broken">
        <FiImage size={18} />
        <span>ไม่พบรูปภาพ</span>
      </div>
    );
  }
  return (
    <div className="uod-thumb">
      <img src={src} alt={alt} onError={() => setBroken(true)} />
    </div>
  );
};

function TailoringPiece({ item, index, unit, onUnitChange }) {
  const activeGarment = GARMENT_TYPES.find((g) => g.key === item.garmentType);
  const measureFields = MEASUREMENT_FIELDS[item.garmentType] || [];
  const filledMeasures = measureFields.filter(([fKey]) => {
    const m = item.measurements?.[fKey];
    return m && (m.current || m.min || m.max);
  });
  const seamRows = SEAM_ALLOWANCE_ROWS.filter((row) => item.seamAllowance?.[row.key]);
  const hasMeasures = filledMeasures.length > 0 || (item.extraMeasurements || []).length > 0;
  const unitLabel = unitLabelOf(unit);
  const show = (cm) => cmToUnit(cm, unit) || "-";

  return (
    <details className="uod-piece">
      <summary className="uod-piece-head">
        <span className="uod-piece-no">{index + 1}</span>
        <span className="uod-piece-name">
          {garmentLabel(item.garmentType) || "ยังไม่เลือกประเภท"}
          {item.subtype && <i> ({item.subtype})</i>}
        </span>
        <span className={`uod-status uod-status-${item.status === "เสร็จแล้ว" ? "done" : "wip"}`}>
          {item.status}
        </span>
        <span className="uod-piece-price">{baht(item.price)}</span>
      </summary>

      <div className="uod-piece-body">
        {hasMeasures && (
          <section className="uod-sub">
            <div className="measure-titlebar">
              <h5>ขนาดตัว{activeGarment ? ` (${activeGarment.label})` : ""}</h5>
              <UnitToggle unit={unit} onChange={onUnitChange} />
            </div>
            <div className="uod-measure">
              <div className="uod-measure-row uod-measure-head">
                <span>จุดวัด</span>
                <span>ปัจจุบัน ({unitLabel})</span>
                <span>เล็กสุด ({unitLabel})</span>
                <span>ใหญ่สุด ({unitLabel})</span>
              </div>
              {filledMeasures.map(([fKey, fLabel]) => {
                const m = item.measurements[fKey];
                return (
                  <div key={fKey} className="uod-measure-row">
                    <span>{fLabel}</span>
                    <span>{show(m.current)}</span>
                    <span>{show(m.min)}</span>
                    <span>{show(m.max)}</span>
                  </div>
                );
              })}
              {(item.extraMeasurements || []).map((m) => (
                <div key={m.id} className="uod-measure-row">
                  <span>{m.label || "-"}</span>
                  <span>{show(m.current)}</span>
                  <span>{show(m.min)}</span>
                  <span>{show(m.max)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="uod-sub">
          <h5>ข้อมูลผ้า</h5>
          <div className="uod-info">
            <div><span>แหล่งที่มา</span><strong>{item.fabricSource === "customer" ? "ลูกค้านำมาเอง" : "ผ้าของร้าน"}</strong></div>
            <div><span>ชื่อผ้า</span><strong>{item.fabric?.fabricName || "-"}</strong></div>
            <div><span>ประเภท</span><strong>{item.fabric?.fabricType || "-"}</strong></div>
            <div><span>สี</span><strong>{item.fabric?.colorName || "-"}</strong></div>
            <div><span>ลวดลาย</span><strong>{item.fabric?.patternName || "-"}</strong></div>
            {item.fabricSource === "shop" ? (
              <>
                {item.shopFabric?.rollCode && (
                  <div><span>ม้วนผ้า</span><strong>{item.shopFabric.rollCode}</strong></div>
                )}
                <div><span>ราคาต่อเมตร</span><strong>{baht(item.shopFabric?.pricePerMeter || 0)}</strong></div>
                <div><span>ผ้าเบิกจริง</span><strong>{Number(item.postCut?.fabricIssuedMeters || item.shopFabric?.metersIssued || 0).toFixed(2)} ม.</strong></div>
              </>
            ) : (
              <>
                <div><span>รับผ้าวันที่</span><strong>{formatDateTH(item.customerFabric?.receivedDate)}</strong></div>
                <div><span>ผ้าที่วัดได้</span><strong>{Number(item.customerFabric?.measuredLength || 0).toFixed(2)} ม.</strong></div>
                <div><span>ผ้าพอไหม</span><strong>{item.customerFabric?.enough || "-"}</strong></div>
              </>
            )}
          </div>

          {item.fabricSource === "customer" && item.customerFabric?.condition && (
            <p className="uod-note">สภาพผ้าตอนรับ: {item.customerFabric.condition}</p>
          )}
          {item.customerFabricPhotos?.length > 0 && (
            <div className="uod-thumbs">
              {item.customerFabricPhotos.map((img) => (
                <ImageThumb key={img.id} src={img.preview} alt="สภาพผ้าตอนรับ" />
              ))}
            </div>
          )}
        </section>

        {item.designImages?.length > 0 && (
          <section className="uod-sub">
            <h5>ภาพร่าง / แบบแนบ</h5>
            <div className="uod-thumbs">
              {item.designImages.map((img) => (
                <ImageThumb key={img.id} src={img.preview} alt="แบบตัด" />
              ))}
            </div>
          </section>
        )}

        {seamRows.length > 0 && (
          <section className="uod-sub">
            <div className="measure-titlebar">
              <h5>ส่วนเผื่อไซซ์</h5>
              <UnitToggle unit={unit} onChange={onUnitChange} />
            </div>
            <div className="uod-info">
              {seamRows.map((row) => (
                <div key={row.key}>
                  <span>{row.label}</span>
                  <strong>{formatLength(item.seamAllowance[row.key], unit)}</strong>
                </div>
              ))}
            </div>
            {item.allowancePlan?.cannotAllow && (
              <p className="uod-note warn">
                ไม่สามารถเผื่อได้ (แจ้งลูกค้าแล้ว){item.allowancePlan.cannotAllowNote && ` — ${item.allowancePlan.cannotAllowNote}`}
              </p>
            )}
          </section>
        )}

        {(item.alterationRows || []).length > 0 && (
          <section className="uod-sub">
            <h5>ประวัติการแก้ไข</h5>
            <div className="uod-alt">
              {item.alterationRows.map((r, i) => (
                <div key={r.id} className="uod-alt-row">
                  <span>ครั้งที่ {i + 1} · {formatDateTH(r.date)}</span>
                  <span>{r.point || "-"}{r.adjustCm && ` (${r.adjustCm})`}</span>
                  <strong>{baht(r.feeAmount)}</strong>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </details>
  );
}

export default function OrderDetail() {
  const navigate = useNavigate();
  const { billId } = useParams();

  const [bill, setBill] = useState(null);
  const [lines, setLines] = useState([]);
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tailoring, setTailoring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [measureUnit, setMeasureUnit] = useMeasureUnit();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const [bills, details, pays, prods, emps, tSummary] = await Promise.all([
          getBills(), getBillDetails(), getPayments(), getProducts(), getEmployees(),
          getTailoringOrdersByBill(billId).catch(() => []),
        ]);
        if (!alive) return;

        const found = bills.find((b) => String(b.idBill) === String(billId));
        if (!found) {
          setError("ไม่พบออเดอร์นี้ อาจถูกยกเลิกไปแล้ว");
          return;
        }

        setBill(found);
        setLines(details.filter((d) => String(d.Bill_idBill) === String(billId)));
        setPayments(pays);
        setProducts(prods);
        setEmployees(emps);

        const full = await Promise.all(
          (tSummary || []).map((t) =>
            getTailoringOrderByCode(t.order_code)
              .then((o) => ({
                ...transformDbOrder(o),
                finalPaid: Number(o.final_paid_amount ?? t.final_paid_amount) || 0,
              }))
              .catch(() => null)
          )
        );
        if (!alive) return;
        setTailoring(full.filter(Boolean));
      } catch {
        if (alive) setError("โหลดข้อมูลไม่สำเร็จ ตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [billId]);

  const productName = (id) =>
    products.find((p) => String(p.id) === String(id))?.name || null;
  const payName = (id) =>
    payments.find((p) => String(p.id_payment) === String(id))?.Payment_type || "—";
  const empName = (id) => {
    const e = employees.find((x) => String(x.idEmployee) === String(id));
    return e ? `${e.Emp_first_name} ${e.Emp_last_name}`.trim() : "—";
  };

  const money = useMemo(() => {
    const productsSubtotal = lines.reduce(
      (s, d) => s + (Number(d.unit_price) || 0) * (Number(d.quantity) || 0), 0
    );
    const discount = Number(bill?.discount_amount) || 0;

    const t = tailoring.reduce(
      (acc, o) => {
        const sums = tailoringTotals(o.detail);
        acc.pieces += sums.piecesTotal;
        acc.alterations += sums.alterationsTotal;
        acc.deposit += sums.deposit;
        acc.finalPaid += Number(o.finalPaid) || 0;
        return acc;
      },
      { pieces: 0, alterations: 0, deposit: 0, finalPaid: 0 }
    );

    const billed = Number(bill?.totalAmount) || 0;
    const total = productsSubtotal - discount + t.pieces + t.alterations;
    const paid = billed + t.finalPaid;
    const outstanding = Math.max(0, total - paid);

    return {
      productsSubtotal, discount,
      tailoringPieces: t.pieces,
      tailoringAlterations: t.alterations,
      deposit: t.deposit,
      finalPaid: t.finalPaid,
      billed, total, paid, outstanding,
    };
  }, [lines, bill, tailoring]);

  const extraNotes = String(bill?.notes || "")
    .split("|")
    .map((x) => x.trim())
    .filter((x) => x && x !== payName(bill?.Payment_idPayment))
    .join(" · ");

  const productCount = lines.reduce((s, d) => s + (Number(d.quantity) || 0), 0);
  const tailoringPieceCount = tailoring.reduce((s, o) => s + (o.detail?.items?.length || 0), 0);

  const handlePrint = () => {
    logAction("print", "sales", `พิมพ์รายละเอียดบิล #${billId}`);
    document.body.classList.add("uod-printing");
    const cleanup = () => {
      document.body.classList.remove("uod-printing");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    setTimeout(cleanup, 1500);
  };

  if (loading) return <div className="uod-page"><p className="uod-empty">กำลังโหลดออเดอร์...</p></div>;

  if (error) {
    return (
      <div className="uod-page">
        <div className="uod-empty-box">
          <h2>{error}</h2>
          <button className="uod-btn-back" onClick={() => navigate("/staff/checkorders")}>
            <FiArrowLeft size={14} /> กลับไปหน้าประวัติการขาย
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="uod-page">
      <header className="uod-top">
        <div className="uod-top-main">
          <h1 className="uod-title">บิล {bill.Bill_details}</h1>
          <p className="uod-sub">
            {bill.customer_name || "ลูกค้าทั่วไป"}
            {bill.customer_phone && ` · ${bill.customer_phone}`}
            {" · "}
            {bill.created_at && !Number.isNaN(new Date(bill.created_at).getTime())
              ? new Date(bill.created_at).toLocaleString("th-TH", {
                  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                })
              : "—"}
          </p>
        </div>
        <button className="uod-btn-print" onClick={handlePrint}>
          <FiPrinter size={15} /> พิมพ์
        </button>
      </header>

      <div className="uod-kpi">
        <div className="uod-kpi-cell">
          <span className="uod-kpi-label">สินค้าสำเร็จรูป</span>
          <strong className="uod-kpi-num">{productCount} ชิ้น</strong>
          <span className="uod-kpi-note">{baht(money.productsSubtotal)}</span>
        </div>
        {tailoring.length > 0 && (
          <div className="uod-kpi-cell">
            <span className="uod-kpi-label">สินค้าสั่งตัด</span>
            <strong className="uod-kpi-num">{tailoringPieceCount} ชิ้น</strong>
            <span className="uod-kpi-note">
              {tailoring.length} ใบสั่งตัด · {baht(money.tailoringPieces)}
            </span>
          </div>
        )}
        {money.outstanding > 0 ? (
          <div className="uod-kpi-cell status owe">
            <span className="uod-kpi-label">ยอดค้างชำระ</span>
            <strong className="uod-kpi-num">{baht(money.outstanding)}</strong>
            <span className="uod-kpi-note">
              ชำระแล้ว {baht(money.paid)} จาก {baht(money.total)}
            </span>
          </div>
        ) : (
          <div className="uod-kpi-cell status paid">
            <span className="uod-kpi-label">ยอดชำระแล้ว</span>
            <strong className="uod-kpi-num">{baht(money.paid)}</strong>
            <span className="uod-kpi-note">ชำระครบแล้ว · {payName(bill.Payment_idPayment)}</span>
          </div>
        )}
      </div>

      <section className="uod-card">
        <div className="uod-card-head">
          <h2>สินค้าสำเร็จรูป</h2>
          <span className="uod-count">{lines.length} รายการ</span>
        </div>

        {lines.length === 0 ? (
          <p className="uod-none">ออเดอร์นี้ไม่มีสินค้าสำเร็จรูป</p>
        ) : (
          <div className="uod-table-wrap">
            <table className="uod-table">
              <thead>
                <tr>
                  <th>รายการ</th>
                  <th className="c">จำนวน</th>
                  <th className="r">ราคา/ชิ้น</th>
                  <th className="r">ส่วนลด</th>
                  <th className="r">รวม</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((d) => {
                  const qty = Number(d.quantity) || 0;
                  const unit = Number(d.unit_price) || 0;
                  const disc = Number(d.discount_amount) || 0;
                  return (
                    <tr key={d.idDetail_bill}>
                      <td>{productName(d.Products_idProducts) || d.notes || "สินค้า"}</td>
                      <td className="c">{qty}</td>
                      <td className="r">{baht(unit)}</td>
                      <td className="r">{disc > 0 ? `− ${baht(disc)}` : "—"}</td>
                      <td className="r"><b>{baht(unit * qty)}</b></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {tailoring.length > 0 && (
      <section className="uod-card">
        <div className="uod-card-head">
          <h2>สินค้าสั่งตัด</h2>
          <span className="uod-count">
            {tailoring.length > 0 ? `${tailoring.length} ใบสั่งตัด · ${tailoringPieceCount} ชิ้น` : "0 ใบสั่งตัด"}
          </span>
        </div>

        {tailoring.length === 0 ? (
          <p className="uod-none">ออเดอร์นี้ไม่มีงานสั่งตัด</p>
        ) : (
          tailoring.map((o) => {
            const h = o.detail.header;
            const sums = tailoringTotals(o.detail);
            const deadline = dueLabel(h.deadline);
            const fitting = dueLabel(h.fittingDate);

            return (
              <div className="uod-torder" key={o.order_id}>
                <div className="uod-torder-head">
                  <div>
                    <h3>ใบสั่งตัด {h.orderCode}</h3>
                    <p>{o.detail.items.length} ชิ้น · ค่าตัดรวม {baht(sums.piecesTotal)}</p>
                  </div>
                  <button className="uod-link" onClick={() => navigate(`/Order/detail/${h.orderCode}`)}>
                    เปิดใบสั่งตัดเต็ม <FiExternalLink size={13} />
                  </button>
                </div>

                <div className="uod-dates">
                  <div className={`uod-date tone-${fitting.tone}`}>
                    <span>วันนัดลองชุด</span>
                    {h.fittingDate ? (
                      <>
                        <strong>{formatDateTH(h.fittingDate)}</strong>
                        <i>{fitting.text}</i>
                      </>
                    ) : (
                      <strong className="muted">ยังไม่กำหนด</strong>
                    )}
                  </div>
                  <div className={`uod-date tone-${deadline.tone}`}>
                    <span>กำหนดส่งงาน</span>
                    {h.deadline ? (
                      <>
                        <strong>{formatDateTH(h.deadline)}</strong>
                        <i>{deadline.text}</i>
                      </>
                    ) : (
                      <strong className="muted">ยังไม่กำหนด</strong>
                    )}
                  </div>
                  {sums.deposit > 0 && (
                    <div className="uod-date tone-paid">
                      <span>มัดจำที่รับแล้ว</span>
                      <strong>{baht(sums.deposit)}</strong>
                      <i>{h.depositPaymentMethod || "หักจากยอดแล้ว"}</i>
                    </div>
                  )}
                </div>

                <div className="uod-pieces">
                  {o.detail.items.map((it, idx) => (
                    <TailoringPiece key={it.id} item={it} index={idx} unit={measureUnit} onUnitChange={setMeasureUnit} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>
      )}

      <section className="uod-card uod-summary">
        <div className="uod-card-head">
          <h2>สรุปยอดทั้งออเดอร์</h2>
        </div>

        <div className="uod-sum-rows">
          <div className="uod-sum-row">
            <span>สินค้าสำเร็จรูป ({productCount} ชิ้น)</span>
            <span>{baht(money.productsSubtotal)}</span>
          </div>
          {money.discount > 0 && (
            <div className="uod-sum-row minus">
              <span>ส่วนลด</span>
              <span>− {baht(money.discount)}</span>
            </div>
          )}
          {money.tailoringPieces > 0 && (
            <div className="uod-sum-row">
              <span>ค่าตัดชุด ({tailoringPieceCount} ชิ้น)</span>
              <span>{baht(money.tailoringPieces)}</span>
            </div>
          )}
          {money.tailoringAlterations > 0 && (
            <div className="uod-sum-row">
              <span>ค่าแก้ไขเพิ่มเติม</span>
              <span>{baht(money.tailoringAlterations)}</span>
            </div>
          )}
        </div>

        <div className="uod-sum-main">
          <div className="uod-sum-line">
            <span>ราคาทั้งหมด</span>
            <span>{baht(money.total)}</span>
          </div>
          <div className="uod-sum-line">
            <span>ยอดชำระแล้ว</span>
            <span>{baht(money.paid)}</span>
          </div>
          {money.finalPaid > 0 && (
            <div className="uod-sum-sub">
              <span>ชำระตอนเปิดบิล {baht(money.billed)} · ชำระเพิ่มตอนรับชุด {baht(money.finalPaid)}</span>
            </div>
          )}
          <div className={`uod-sum-line owe${money.outstanding > 0 ? "" : " zero"}`}>
            <span>ยอดค้างชำระ</span>
            <span>{baht(money.outstanding)}</span>
          </div>
        </div>

        <div className="uod-foot">
          <div><span>วิธีชำระเงิน</span><strong>{payName(bill.Payment_idPayment)}</strong></div>
          {lines[0] && (
            <div><span>พนักงานขาย</span><strong>{empName(lines[0].Employee_idEmployee)}</strong></div>
          )}
          {extraNotes && <div><span>หมายเหตุ</span><strong>{extraNotes}</strong></div>}
        </div>
      </section>
    </div>
  );
}
