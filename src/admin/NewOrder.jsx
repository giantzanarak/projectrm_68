import { useEffect, useMemo, useState } from "react";
import { onlyDigits, isValidOptionalPhone, PHONE_HINT } from "../utils/phone";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiCheck, FiPrinter } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import {
  IMAGE_URL, baht, toInt,
  getProducts, getPayments, getEmployees, getPromotions,
  getBills, nextBillNo, createBill,
} from "../api/billApi";
import { linkTailoringOrderToBill } from "../api/fetch_api_admin";
import { logAction } from "../api/activityLog";
import { saleStatusOf, STATUS_CUTTING } from "../utils/productStatus";
import { rangeText } from "../utils/productSizes";
import "../css/NewOrder.css";
import Select from "../components/Select";

const sumRemaining = (orders) =>
  (orders || []).reduce((s, t) => s + (Number(t.remaining) || 0), 0);

const PAGE_SIZE = 12;

const swalTheme = {
  popup: "pos-swal-popup",
  confirmButton: "pos-swal-confirm",
  cancelButton: "pos-swal-cancel",
};

export default function NewOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [tailoringOrders, setTailoringOrders] = useState([]);
  useEffect(() => {
    const attached = location.state?.attachedTailoringOrder;
    if (attached) {
      setTailoringOrders((prev) =>
        prev.some((t) => t.order_id === attached.order_id) ? prev : [...prev, attached]
      );
      if (attached.customer_name) setCustName((v) => v || attached.customer_name);
      if (attached.customer_phone) setCustPhone((v) => v || attached.customer_phone);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [billNo, setBillNo] = useState("");
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);

  const [paymentId, setPaymentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  /* ส่วนลดเป็นช่องเดียว: ปกติกรอกเป็นบาท — กดใช้โปรฯ แล้วช่องจะเปลี่ยนเป็นตัวเลือกโปรโมชั่น */
  const [usePromo, setUsePromo] = useState(false);
  const [promoId, setPromoId] = useState("");
  const [manualDiscount, setManualDiscount] = useState("");
  const [note, setNote] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");

  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [prod, pay, emp, promo, bills] = await Promise.all([
        getProducts(), getPayments(), getEmployees(), getPromotions(), getBills(),
      ]);
      setProducts(prod);
      setPayments(pay);
      setEmployees(emp);
      setPromotions(promo);
      setBillNo(nextBillNo(bills));
      if (pay.length) setPaymentId(String(pay[0].id_payment));
      if (emp.length) setEmployeeId(String(emp[0].idEmployee));
    } catch {
      Swal.fire({
        icon: "error", title: "โหลดข้อมูลไม่สำเร็จ",
        text: "เชื่อมต่อระบบไม่ได้ ตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่",
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
    } finally {
      setLoading(false);
    }
  };

  /* สินค้าขายหมดไม่ต้องโชว์ในหน้าเปิดบิล */
  const inStock = useMemo(
    () => products.filter((p) => saleStatusOf(p.status, p.stockQty) !== "ขายหมด"),
    [products]
  );

  const categories = useMemo(
    () => ["ทั้งหมด", ...new Set(inStock.map((p) => p.category).filter(Boolean))],
    [inStock]
  );

  const sellable = useMemo(
    () => inStock.filter((p) => {
      const term = search.trim().toLowerCase();
      const matchSearch = !term
        || p.name?.toLowerCase().includes(term)
        || p.pattern?.toLowerCase().includes(term)
        || p.category?.toLowerCase().includes(term)
        || p.lotCode?.toLowerCase().includes(term);
      const matchCat = categoryFilter === "ทั้งหมด" || p.category === categoryFilter;
      return matchSearch && matchCat;
    }),
    [inStock, search, categoryFilter]
  );

  /* แบ่งหน้าละ 12 รายการ — เปลี่ยนคำค้น/ประเภทแล้วกลับไปหน้าแรก */
  useEffect(() => { setPage(1); }, [search, categoryFilter]);
  const totalPages = Math.max(1, Math.ceil(sellable.length / PAGE_SIZE));
  const curPage = Math.min(page, totalPages);
  const pageItems = sellable.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);
  /* แสดงเลขหน้ารอบหน้าปัจจุบันไม่เกิน 5 ปุ่ม */
  const pageStart = Math.max(1, Math.min(curPage - 2, totalPages - 4));
  const pageNums = Array.from({ length: Math.min(5, totalPages) }, (_, i) => pageStart + i);

  const addToCart = (p) => {
    if (p.status === "ไม่พร้อมขาย" || p.status === STATUS_CUTTING) {
      Swal.fire({
        icon: "info", title: "สินค้านี้ยังไม่พร้อมขาย",
        text: p.status === STATUS_CUTTING
          ? `"${p.name}" ยังตัดไม่เสร็จ — ขายได้หลังกดตัดเสร็จที่หน้าสินค้า`
          : `"${p.name}" ถูกตั้งสถานะไม่พร้อมขาย`,
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
      return;
    }
    /* ขายเกินของที่เหลือในคลังไม่ได้ */
    const inCart = cart.find((c) => c.id === p.id)?.qty || 0;
    if (p.stockQty !== null && inCart >= p.stockQty) {
      Swal.fire({
        icon: "info",
        title: p.stockQty > 0 ? `เหลือแค่ ${p.stockQty} ชิ้น` : "สินค้านี้ขายหมดแล้ว",
        text: p.stockQty > 0 ? `"${p.name}" ใส่ในบิลครบตามที่เหลือแล้ว` : `"${p.name}" ไม่มีของเหลือในคลัง`,
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
      return;
    }
    setCart((prev) => {
      const hit = prev.find((c) => c.id === p.id);
      if (hit) return prev.map((c) => (c.id === p.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, {
        id: p.id, name: p.name, price: toInt(p.price), image: p.image, category: p.category,
        qty: 1, stockQty: p.stockQty,
      }];
    });
  };

  /* จำนวนในบิลต้องไม่เกินของที่เหลือ */
  const setQty = (id, qty) =>
    setCart((prev) => prev
      .map((c) => {
        if (c.id !== id) return c;
        let n = Math.max(0, Math.floor(Number(qty) || 0));
        if (c.stockQty !== null && c.stockQty !== undefined) n = Math.min(n, c.stockQty);
        return { ...c, qty: n };
      })
      .filter((c) => c.qty > 0));

  const removeItem = (id) => setCart((prev) => prev.filter((c) => c.id !== id));

  /* สลับช่องส่วนลด: บาท ↔ โปรโมชั่น — ใช้ได้ทีละแบบ */
  const toggleDiscountMode = () => {
    setUsePromo((v) => !v);
    setPromoId("");
    setManualDiscount("");
  };
  const clearCart = () => {
    setCart([]); setUsePromo(false); setPromoId(""); setManualDiscount(""); setCashReceived(""); setNote("");
    setCustName(""); setCustPhone(""); setTailoringOrders([]);
  };

  const promo = promotions.find((p) => String(p.idPromotion) === String(promoId)) || null;
  const promoPercent = promo ? Number(promo.PER_ITEM || 0) : 0;

  const bill = useMemo(() => {
    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const promoDiscount = toInt(subtotal * promoPercent / 100);
    /* ลดเองได้ไม่เกินยอดที่เหลือหลังหักโปรฯ */
    const manual = Math.min(Math.max(0, toInt(manualDiscount)), subtotal - promoDiscount);
    const discount = promoDiscount + manual;
    const total = Math.max(0, subtotal - discount);
    const itemCount = cart.reduce((s, c) => s + c.qty, 0);

    let left = discount;
    const lines = cart.map((c, i) => {
      const lineTotal = c.price * c.qty;
      const share = i === cart.length - 1
        ? left
        : toInt(subtotal > 0 ? discount * lineTotal / subtotal : 0);
      left -= share;
      return { ...c, lineTotal, lineDiscount: share };
    });

    return { subtotal, promoDiscount, manualDiscount: manual, discount, total, itemCount, lines };
  }, [cart, promoPercent, manualDiscount]);

  const tailoringTotal = useMemo(
    () => tailoringOrders.reduce((s, t) => s + (Number(t.total_price) || 0), 0),
    [tailoringOrders]
  );
  const tailoringRemaining = useMemo(
    () => tailoringOrders.reduce((s, t) => s + (Number(t.remaining) || 0), 0),
    [tailoringOrders]
  );
  const grandTotal = bill.total + tailoringTotal;
  const tailoringFull = useMemo(
    () => tailoringOrders.reduce((s, t) => s + (Number(t.tailoring_total) || 0), 0),
    [tailoringOrders]
  );
  const fullPrice = bill.total + tailoringFull;

  const removeTailoringOrder = (orderId) =>
    setTailoringOrders((prev) => prev.filter((t) => t.order_id !== orderId));

  const goCreateTailoringOrder = () => {
    navigate("/Order/add", {
      state: {
        returnTo: "/staff/neworder",
        prefill: { customerName: custName, customerPhone: custPhone },
      },
    });
  };

  const isCash = useMemo(() => {
    const p = payments.find((x) => String(x.id_payment) === String(paymentId));
    return /เงินสด/.test(p?.Payment_type || "");
  }, [payments, paymentId]);

  const cash = toInt(cashReceived);
  const change = cash - grandTotal;
  const cashOk = !isCash || cash >= grandTotal;
  const canSave = (cart.length > 0 || tailoringOrders.length > 0) && paymentId && employeeId && cashOk && !saving;
  const saveBlockedReason =
    cart.length === 0 && tailoringOrders.length === 0 ? "เพิ่มสินค้าหรือสร้างคำสั่งตัดชุดก่อนจึงจะบันทึกได้"
      : !paymentId ? "เลือกวิธีชำระเงินก่อนบันทึก"
        : !employeeId ? "เลือกพนักงานขายก่อนบันทึก"
          : !cashOk ? (cash <= 0 ? "กรอกจำนวนเงินที่รับมาก่อนบันทึก" : "เงินที่รับมายังไม่พอ")
            : "";

  const handleSave = async () => {
    if (!isValidOptionalPhone(custPhone)) {
      await Swal.fire({
        icon: "warning", title: "เบอร์โทรไม่ถูกต้อง", text: PHONE_HINT,
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
      return;
    }

    const tailoringNote = tailoringOrders.length
      ? `<br/>มัดจำใบสั่งตัด ${tailoringOrders.length} ใบ (${baht(tailoringTotal)})` +
        (tailoringRemaining > 0
          ? `<br/><small>อีก ${baht(tailoringRemaining)} เก็บวันลูกค้ามารับชุด</small>`
          : "")
      : "";
    const ok = await Swal.fire({
      icon: "question",
      title: "ยืนยันบันทึกบิลขาย?",
      html: `เลขบิล <b>${billNo}</b><br/>${bill.itemCount} ชิ้น · ยอดสุทธิ <b>${baht(grandTotal)}</b>${tailoringNote}`,
      showCancelButton: true, confirmButtonText: "บันทึกบิล", cancelButtonText: "ยกเลิก",
      reverseButtons: true, buttonsStyling: false, customClass: swalTheme,
    });
    if (!ok.isConfirmed) return;

    try {
      setSaving(true);
      const notes = [
        payments.find((p) => String(p.id_payment) === String(paymentId))?.Payment_type,
        promo ? `โค้ด ${promo.promo_code} -${promoPercent}%` : null,
        bill.manualDiscount > 0 ? `ร้านลดให้ ${baht(bill.manualDiscount)}` : null,
        note,
      ].filter(Boolean).join(" | ");

      const res = await createBill({
        billNo,
        userId: user?.id || 1,
        customerName: custName,
        customerPhone: custPhone,
        paymentId: Number(paymentId),
        employeeId: Number(employeeId),
        promotionId: promo ? Number(promo.idPromotion) : null,
        totalAmount: grandTotal,
        discountAmount: bill.discount,
        notes,
        items: bill.lines,
      });

      if (tailoringOrders.length) {
        await Promise.allSettled(
          tailoringOrders.map((t) => linkTailoringOrderToBill(t.order_id, res.idBill))
        );
      }

      setReceipt({
        billNo: res.billNo,
        idBill: res.idBill,
        at: new Date(),
        payment: payments.find((p) => String(p.id_payment) === String(paymentId))?.Payment_type || "-",
        custName, custPhone,
        employee: employees.find((e) => String(e.idEmployee) === String(employeeId)),
        promo,
        lines: bill.lines,
        tailoringOrders,
        subtotal: bill.subtotal,
        discount: bill.discount,
        promoDiscount: bill.promoDiscount,
        manualDiscount: bill.manualDiscount,
        tailoringTotal,
        total: grandTotal,
        cash: isCash ? cash : null,
        change: isCash ? change : null,
        note,
      });

      if (res.failedItems.length) {
        await Swal.fire({
          icon: "warning",
          title: "บันทึกบิลแล้ว แต่บางรายการไม่สำเร็จ",
          text: `บันทึกรายการได้ ${res.savedItems.length} จาก ${bill.lines.length} รายการ`
            + (res.failedItems?.[0]?.reason?.response?.data?.message
              ? ` — ${res.failedItems[0].reason.response.data.message}` : ""),
          confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
        });
      }

      /* โหลดสินค้าใหม่ด้วย ให้จำนวนคงเหลือลดตามที่ขายไป */
      const [bills, freshProducts] = await Promise.all([getBills(), getProducts()]);
      setProducts(freshProducts);
      setBillNo(nextBillNo(bills));
      clearCart();
    } catch (err) {
      Swal.fire({
        icon: "error", title: "บันทึกไม่สำเร็จ",
        text: err?.response?.data?.message || err.message || "เกิดข้อผิดพลาด",
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!receipt) return;
    const onKey = (e) => { if (e.key === "Escape") setReceipt(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [receipt]);

  const handlePrint = () => {
    logAction("print", "sales", `พิมพ์ใบเสร็จ บิล ${receipt?.billNo || billNo || "-"}`);
    document.body.classList.add("pos-printing");
    const cleanup = () => {
      document.body.classList.remove("pos-printing");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    setTimeout(cleanup, 1500);
  };

  return (
    <div className="pos-root">
      <header className="pos-top">
        <div>
          <h1 className="pos-title">สร้างบิลขาย</h1>
          <p className="pos-sub">เลขบิล <b>{billNo || "—"}</b> · {new Date().toLocaleDateString("th-TH")}</p>
        </div>
        <div className="pos-top-actions">
          <button className="pos-btn-primary" onClick={goCreateTailoringOrder}>
            <span className="plus-icon">+</span> สร้างคำสั่งตัดชุด
          </button>
          <button className="pos-btn-primary" onClick={() => navigate("/staff/checkorders")}>
            ดูบิลทั้งหมด
          </button>
        </div>
      </header>

      <div className="pos-layout">
        <div className="pos-card">
          <div className="pos-block-head">
            <h2>เลือกสินค้า</h2>
            <span className="pos-count">{sellable.length} รายการ</span>
          </div>

          <div className="pos-filters">
            <div className="pos-search">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input placeholder="ค้นหาสินค้า / ลาย / ประเภท / เลขล็อต..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>

          {loading ? (
            <p className="pos-empty">กำลังโหลดสินค้า...</p>
          ) : sellable.length === 0 ? (
            <p className="pos-empty">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
          ) : (
            <div className="pos-grid">
              {pageItems.map((p) => {
                const inCart = cart.find((c) => c.id === p.id);
                const saleStatus = saleStatusOf(p.status, p.stockQty);
                const off = saleStatus !== "พร้อมขาย";
                return (
                  <button key={p.id} className={`pos-item ${off ? "off" : ""} ${inCart ? "picked" : ""}`}
                    onClick={() => addToCart(p)}>
                    <div className="pos-item-img">
                      {p.image
                        ? <img src={IMAGE_URL + p.image} alt={p.name} />
                        : <span className="pos-noimg">ไม่มีรูป</span>}
                      {inCart && <span className="pos-item-qty">{inCart.qty}</span>}
                      {off && <span className="pos-item-off">{saleStatus}</span>}
                    </div>
                    <p className="pos-item-name">{p.name}</p>
                    {(p.sizeRanges?.length > 0 || p.size) && (
                      <p className="pos-item-size">
                        {p.sizeRanges?.length ? p.sizeRanges.map(rangeText).join(" · ") : p.size}
                      </p>
                    )}
                    {p.stockQty !== null && <p className="pos-item-stock">เหลือ {p.stockQty} ชิ้น</p>}
                    <p className="pos-item-price">{baht(p.price)}</p>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="pos-pager">
              <button onClick={() => setPage(curPage - 1)} disabled={curPage === 1}>‹ ก่อนหน้า</button>
              <div className="pos-dots">
                {pageNums.map((n) => (
                  <button key={n} className={n === curPage ? "active" : ""} onClick={() => setPage(n)}>{n}</button>
                ))}
              </div>
              <button onClick={() => setPage(curPage + 1)} disabled={curPage === totalPages}>ถัดไป ›</button>
            </div>
          )}
        </div>

        <div className="pos-bill">
          <div className="pos-bill-head">
            <span>รายการในบิล</span>
            {(cart.length > 0 || tailoringOrders.length > 0) && (
              <button className="pos-link pos-link-danger" onClick={clearCart}>ล้างตะกร้า</button>
            )}
          </div>

          {cart.length === 0 && tailoringOrders.length === 0 ? (
            <p className="pos-cart-empty">ยังไม่มีสินค้า — กดที่สินค้าด้านซ้ายเพื่อเพิ่ม หรือสร้างคำสั่งตัดชุด</p>
          ) : (
            <div className="pos-cart">
              {bill.lines.map((c) => (
                <div className="pos-line" key={c.id}>
                  <div className="pos-line-info">
                    <p className="pos-line-name">{c.name}</p>
                    <p className="pos-line-price">{baht(c.price)} × {c.qty}</p>
                  </div>
                  <div className="pos-qty">
                    <button onClick={() => setQty(c.id, c.qty - 1)}>−</button>
                    <input type="number" min="0" value={c.qty}
                      onChange={(e) => setQty(c.id, e.target.value)} />
                    <button onClick={() => setQty(c.id, c.qty + 1)}>+</button>
                  </div>
                  <span className="pos-line-total">{baht(c.lineTotal)}</span>
                  <button className="pos-line-x" title="ลบ" onClick={() => removeItem(c.id)}>✕</button>
                </div>
              ))}

              {tailoringOrders.map((t) => (
                <div className="pos-line pos-line-tailoring" key={t.order_id}>
                  <div className="pos-line-info">
                    <p className="pos-line-name">ใบสั่งตัด {t.order_code} <i>(มัดจำ)</i></p>
                    <p className="pos-line-price">
                      {t.piece_count} ชิ้น · {t.customer_name || "-"}
                      {t.remaining > 0 && (
                        <> · เหลือ {baht(t.remaining)} เก็บวันรับชุด</>
                      )}
                    </p>
                  </div>
                  <span className="pos-line-total">{baht(t.total_price)}</span>
                  <button className="pos-line-x" title="เอาออกจากบิลนี้"
                    onClick={() => removeTailoringOrder(t.order_id)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="pos-fields">
            <div className="pos-f">
              <div className="pos-f-head">
                <span>{usePromo ? "ส่วนลด (โปรโมชั่น)" : "ส่วนลด (บาท)"}</span>
                {(usePromo || promotions.length > 0) && (
                  <button type="button" className="pos-link" onClick={toggleDiscountMode}>
                    {usePromo ? "ลดเป็นบาทเอง" : "ใช้โปรโมชั่น"}
                  </button>
                )}
              </div>
              {usePromo ? (
                <Select value={promoId} onChange={(e) => setPromoId(e.target.value)}>
                  <option value="">— เลือกโปรโมชั่น —</option>
                  {promotions.map((p) => (
                    <option key={p.idPromotion} value={p.idPromotion}>
                      {p.promo_code} · ลด {Number(p.PER_ITEM || 0)}% ({p.Promotion_details})
                      {p.remaining_quota !== null && p.remaining_quota !== undefined
                        ? ` · เหลือ ${p.remaining_quota} สิทธิ์`
                        : ""}
                    </option>
                  ))}
                </Select>
              ) : (
                <input type="number" min="0" step="1" inputMode="numeric" value={manualDiscount}
                  placeholder="0"
                  onChange={(e) => setManualDiscount(e.target.value)} />
              )}
            </div>

            <div className="pos-f2">
              <label className="pos-f">
                <span>วิธีชำระเงิน</span>
                <Select value={paymentId} onChange={(e) => setPaymentId(e.target.value)}>
                  {payments.map((p) => (
                    <option key={p.id_payment} value={p.id_payment}>{p.Payment_type}</option>
                  ))}
                </Select>
              </label>
              <label className="pos-f">
                <span>พนักงานขาย</span>
                <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                  {employees.map((e) => (
                    <option key={e.idEmployee} value={e.idEmployee}>
                      {e.Emp_first_name} {e.Emp_last_name}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div className="pos-f2">
              <label className="pos-f">
                <span>ชื่อลูกค้า</span>
                <input value={custName} placeholder="เช่น คุณสมศรี"
                  onChange={(e) => setCustName(e.target.value)} />
              </label>
              <label className="pos-f">
                <span>เบอร์โทร</span>
                <input value={custPhone} placeholder="0812345678" inputMode="numeric" maxLength={10}
                  onChange={(e) => setCustPhone(onlyDigits(e.target.value))} />
              </label>
            </div>

            <label className="pos-f">
              <span>หมายเหตุ (ไม่บังคับ)</span>
              <input value={note} placeholder="เช่น ลูกค้าขอใบกำกับภาษี"
                onChange={(e) => setNote(e.target.value)} />
            </label>
          </div>

          <div className="pos-sum">
            <div className="pos-sum-row">
              <span>สินค้า ({bill.itemCount} ชิ้น)</span>
              <span>{baht(bill.subtotal)}</span>
            </div>
            {bill.promoDiscount > 0 && (
              <div className="pos-sum-row minus">
                <span>ส่วนลด {promo ? `(${promo.promo_code} ${promoPercent}%)` : ""}</span>
                <span>− {baht(bill.promoDiscount)}</span>
              </div>
            )}
            {bill.manualDiscount > 0 && (
              <div className="pos-sum-row minus">
                <span>ร้านลดให้เอง</span>
                <span>− {baht(bill.manualDiscount)}</span>
              </div>
            )}
            {tailoringOrders.length > 0 && (
              <div className="pos-sum-row">
                <span>ค่าตัดชุด ({tailoringOrders.length} ใบ)</span>
                <span>{baht(tailoringFull)}</span>
              </div>
            )}

            <div className="pos-sum-main">
              {tailoringOrders.length > 0 && (
                <div className="pos-sum-line">
                  <span>ราคาทั้งหมด</span>
                  <span>{baht(fullPrice)}</span>
                </div>
              )}
              <div className="pos-sum-line paid">
                <span>ยอดชำระ</span>
                <span>{baht(grandTotal)}</span>
              </div>
              {tailoringOrders.length > 0 && (
                <div className={`pos-sum-line owe${tailoringRemaining > 0 ? "" : " zero"}`}>
                  <span>ยอดค้างชำระ</span>
                  <span>{baht(tailoringRemaining)}</span>
                </div>
              )}
            </div>
          </div>

          {isCash && (cart.length > 0 || tailoringOrders.length > 0) && (
            <div className="pos-cash">
              <label className="pos-f">
                <span>รับเงินมา (บาท)</span>
                <input type="number" min="0" value={cashReceived} placeholder="0"
                  onChange={(e) => setCashReceived(e.target.value)} />
              </label>
              <div className="pos-quick">
                {[grandTotal, 500, 1000, 2000, 5000].map((v, i) => (
                  <button key={i} onClick={() => setCashReceived(String(toInt(v)))}>
                    {i === 0 ? "พอดี" : baht(v)}
                  </button>
                ))}
              </div>
              <div className={`pos-change ${cash <= 0 ? "idle" : cashOk ? "ok" : "bad"}`}>
                {cash <= 0
                  ? <>ต้องรับ <b>{baht(grandTotal)}</b></>
                  : cashOk
                    ? <>เงินทอน <b>{baht(change)}</b></>
                    : <>ยังขาดอีก <b>{baht(grandTotal - cash)}</b></>}
              </div>
            </div>
          )}

          <button className="pos-btn-save" onClick={handleSave} disabled={!canSave}>
            {saving ? "กำลังบันทึก..." : `บันทึกบิลขาย · ${baht(grandTotal)}`}
          </button>
          {!canSave && !saving && saveBlockedReason && (
            <p className="pos-note">{saveBlockedReason}</p>
          )}
        </div>
      </div>

      {receipt && (
        <div className="pos-backdrop" onClick={() => setReceipt(null)}>
          <div className="pos-receipt-wrap" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="pos-receipt-success">
              <span><FiCheck size={16} /></span>
              บันทึกบิลเรียบร้อย
            </div>

            <div className="pos-receipt" id="pos-receipt">
              <div className="pos-receipt-head">
                <h3>ร้านผ้าไหมพื้นเมือง</h3>
                <p>ใบเสร็จรับเงิน</p>
                <p className="pos-receipt-no">{receipt.billNo}</p>
                <p>
                  {receipt.at.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}
                  {receipt.at.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                </p>
              </div>

              <table className="pos-receipt-table">
                <thead>
                  <tr><th>รายการ</th><th>จำนวน</th><th>รวม</th></tr>
                </thead>
                <tbody>
                  {receipt.lines.map((l) => (
                    <tr key={l.id}>
                      <td>{l.name}</td>
                      <td>{l.qty}</td>
                      <td>{baht(l.lineTotal)}</td>
                    </tr>
                  ))}
                  {(receipt.tailoringOrders || []).map((t) => (
                    <tr key={t.order_id} className="pos-receipt-tailor">
                      <td>
                        ใบสั่งตัด {t.order_code} <i>(มัดจำ)</i>
                        {Number(t.tailoring_total) > 0 && (
                          <small>
                            ราคาเต็ม {baht(t.tailoring_total)}
                            {Number(t.remaining) > 0 && <> · <b>ค้างชำระ {baht(t.remaining)}</b></>}
                          </small>
                        )}
                        {t.deadline && (
                          <small>
                            กำหนดรับชุด{" "}
                            {new Date(`${String(t.deadline).slice(0, 10)}T00:00:00`).toLocaleDateString("th-TH", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </small>
                        )}
                      </td>
                      <td>{t.piece_count}</td>
                      <td>{baht(t.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pos-receipt-sum">
                {receipt.discount > 0 && (
                  <>
                    <div><span>ยอดรวม</span><span>{baht(receipt.subtotal + (receipt.tailoringTotal || 0))}</span></div>
                    {receipt.promoDiscount > 0 && (
                      <div><span>ส่วนลด{receipt.promo ? ` (${receipt.promo.promo_code})` : ""}</span>
                        <span>− {baht(receipt.promoDiscount)}</span></div>
                    )}
                    {receipt.manualDiscount > 0 && (
                      <div><span>ร้านลดให้เอง</span>
                        <span>− {baht(receipt.manualDiscount)}</span></div>
                    )}
                  </>
                )}
                <div className="grand"><span>ยอดสุทธิ</span><span>{baht(receipt.total)}</span></div>
                {receipt.cash !== null && (
                  <>
                    <div><span>รับเงิน</span><span>{baht(receipt.cash)}</span></div>
                    <div><span>เงินทอน</span><span>{baht(receipt.change)}</span></div>
                  </>
                )}
                {(receipt.tailoringOrders || []).some((t) => Number(t.remaining) > 0) && (
                  <div className="owe">
                    <span>ค้างชำระงานตัด (จ่ายวันรับชุด)</span>
                    <span>{baht(sumRemaining(receipt.tailoringOrders))}</span>
                  </div>
                )}
              </div>

              <div className="pos-receipt-foot">
                {(receipt.custName || receipt.custPhone) && (
                  <div>
                    <span>ลูกค้า</span>
                    <span>{[receipt.custName, receipt.custPhone].filter(Boolean).join(" · ")}</span>
                  </div>
                )}
                <div><span>ชำระโดย</span><span>{receipt.payment}</span></div>
                {receipt.employee && (
                  <div>
                    <span>พนักงาน</span>
                    <span>{`${receipt.employee.Emp_first_name} ${receipt.employee.Emp_last_name}`.trim()}</span>
                  </div>
                )}
                {receipt.note && <div><span>หมายเหตุ</span><span>{receipt.note}</span></div>}
              </div>
              <p className="pos-thanks">ขอบคุณที่อุดหนุนค่ะ</p>
            </div>

            <div className="pos-receipt-actions">
              <button className="pos-receipt-btn ghost" onClick={() => setReceipt(null)}>ปิด</button>
              <button className="pos-receipt-btn ghost" onClick={() => navigate(`/staff/order/${receipt.idBill}`)}>
                ดูรายละเอียดบิล
              </button>
              <button className="pos-receipt-btn primary" onClick={handlePrint}>
                <FiPrinter size={15} /> พิมพ์ใบเสร็จ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
