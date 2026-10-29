import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDownload, FiRefreshCw, FiDollarSign, FiFileText, FiTrendingUp, FiPieChart,
  FiCreditCard, FiUsers, FiAward, FiChevronRight,
} from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend,
} from "chart.js";
import {
  getBills, getBillDetails, getProducts, getPayments, getEmployees, baht,
} from "../api/billApi";
import { getTailoringOrders } from "../api/fetch_api_admin";
import "../css/SalesReport.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const dayKey = (d) => {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

const fromKey = (key) => {
  const [y, m, d] = String(key).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (key, n) => {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
};

const spanDays = (from, to) => Math.round((fromKey(to) - fromKey(from)) / 86400000) + 1;

const thDate = (key, opts = { day: "numeric", month: "short", year: "2-digit" }) =>
  key ? fromKey(key).toLocaleDateString("th-TH", opts) : "-";

const PERIODS = [
  { key: "today", label: "วันนี้" },
  { key: "7d", label: "7 วัน" },
  { key: "month", label: "เดือนนี้" },
  { key: "lastMonth", label: "เดือนที่แล้ว" },
  { key: "year", label: "ปีนี้" },
  { key: "custom", label: "กำหนดเอง" },
];

function periodRange(period, custom) {
  const now = new Date();
  const today = dayKey(now);
  switch (period) {
    case "today": return { from: today, to: today };
    case "7d": return { from: addDays(today, -6), to: today };
    case "lastMonth": {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: dayKey(first), to: dayKey(last) };
    }
    case "year": return { from: `${now.getFullYear()}-01-01`, to: today };
    case "custom": {
      const from = custom.from || today;
      const to = custom.to && custom.to >= from ? custom.to : from;
      return { from, to };
    }
    case "month":
    default:
      return { from: dayKey(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
  }
}

const inRange = (key, r) => key >= r.from && key <= r.to;
const sum = (arr, fn) => arr.reduce((s, x) => s + (Number(fn(x)) || 0), 0);
const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

const paymentGroup = (text) => (/สด/.test(text || "") ? "เงินสด" : "โอนผ่านธนาคาร/QR");

const Change = ({ now, before }) => {
  if (!before && !now) return <span className="sr-change flat">—</span>;
  if (!before) return <span className="sr-change up">ใหม่ในช่วงนี้</span>;
  const diff = ((now - before) / before) * 100;
  const tone = diff > 0.5 ? "up" : diff < -0.5 ? "down" : "flat";
  return (
    <span className={`sr-change ${tone}`}>
      {tone === "up" ? "▲" : tone === "down" ? "▼" : "•"} {Math.abs(diff).toFixed(1)}% จากช่วงก่อนหน้า
    </span>
  );
};

const Panel = ({ title, icon: Icon, children, action, onAction, className = "" }) => (
  <section className={`sr-panel ${className}`}>
    <div className="sr-panel-head">
      <h3><Icon size={16} /> {title}</h3>
      {action && (
        <button type="button" className="sr-link" onClick={onAction}>
          {action} <FiChevronRight size={14} />
        </button>
      )}
    </div>
    {children}
  </section>
);

const BarList = ({ rows, total, empty }) =>
  rows.length === 0 ? (
    <p className="sr-empty">{empty}</p>
  ) : (
    <ul className="sr-bars">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="sr-bars-top">
            <span>{r.label}</span>
            <strong>{baht(r.value)}</strong>
          </div>
          <div className="sr-bars-track">
            <i style={{ width: `${pct(r.value, total)}%`, background: r.color || "#3b82f6" }} />
          </div>
          <span className="sr-bars-note">
            {pct(r.value, total)}%{r.note ? ` · ${r.note}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );

export default function SalesReport() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("month");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [raw, setRaw] = useState({
    bills: [], details: [], products: [], payments: [], employees: [], orders: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await Promise.allSettled([
      getBills(), getBillDetails(), getProducts(), getPayments(), getEmployees(), getTailoringOrders(),
    ]);
    const val = (r) => (r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []);
    const [bills, details, products, payments, employees, orders] = res.map(val);
    setRaw({ bills, details, products, payments, employees, orders });
    setLoadFailed(res[0].status === "rejected");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const range = useMemo(() => periodRange(period, custom), [period, custom]);
  const prevRange = useMemo(() => {
    const n = spanDays(range.from, range.to);
    return { from: addDays(range.from, -n), to: addDays(range.from, -1) };
  }, [range]);

  const events = useMemo(() => {
    const productById = new Map(raw.products.map((p) => [String(p.id), p]));
    const payName = (id) =>
      raw.payments.find((p) => String(p.id_payment) === String(id))?.Payment_type || "ไม่ระบุ";
    const empName = (id) =>
      raw.employees.find((e) => String(e.idEmployee) === String(id))?.Emp_first_name || "ไม่ระบุ";

    const linesByBill = new Map();
    raw.details.forEach((d) => {
      const k = String(d.Bill_idBill);
      if (!linesByBill.has(k)) linesByBill.set(k, []);
      linesByBill.get(k).push(d);
    });

    const bills = raw.bills
      .map((b) => {
        const lines = linesByBill.get(String(b.idBill)) || [];
        const itemsGross = sum(lines, (d) => (Number(d.unit_price) || 0) * (Number(d.quantity) || 0));
        const discount = Number(b.discount_amount) || 0;
        const total = Number(b.totalAmount) || 0;
        const itemsNet = Math.min(total, Math.max(0, itemsGross - discount));
        const cost = sum(lines, (d) => {
          const c = productById.get(String(d.Products_idProducts))?.cost || 0;
          return c * (Number(d.quantity) || 0);
        });
        const costKnown = lines.length > 0 && lines.every(
          (d) => (productById.get(String(d.Products_idProducts))?.cost || 0) > 0
        );
        return {
          key: dayKey(b.created_at),
          total,
          discount,
          itemsNet,
          deposit: Math.max(0, total - itemsNet),
          cost,
          costKnown,
          lines,
          payment: paymentGroup(payName(b.Payment_idPayment)),
          employee: lines[0] ? empName(lines[0].Employee_idEmployee) : "ไม่ระบุ",
        };
      })
      .filter((b) => b.key);

    const finals = raw.orders
      .filter((o) => Number(o.final_paid_amount) > 0 && o.final_paid_at)
      .map((o) => ({
        key: dayKey(o.final_paid_at),
        amount: Number(o.final_paid_amount) || 0,
        payment: paymentGroup(o.final_payment_method),
      }))
      .filter((f) => f.key);

    return { bills, finals, productById };
  }, [raw]);

  const report = useMemo(() => {
    const bills = events.bills.filter((b) => inRange(b.key, range));
    const finals = events.finals.filter((f) => inRange(f.key, range));
    const prevBills = events.bills.filter((b) => inRange(b.key, prevRange));
    const prevFinals = events.finals.filter((f) => inRange(f.key, prevRange));

    const productSales = sum(bills, (b) => b.itemsNet);
    const deposits = sum(bills, (b) => b.deposit);
    const finalPaid = sum(finals, (f) => f.amount);
    const revenue = productSales + deposits + finalPaid;
    const prevRevenue = sum(prevBills, (b) => b.total) + sum(prevFinals, (f) => f.amount);

    const billTotal = sum(bills, (b) => b.total);
    const prevBillTotal = sum(prevBills, (b) => b.total);

    const costedBills = bills.filter((b) => b.costKnown);
    const grossProfit = sum(costedBills, (b) => b.itemsNet - b.cost);
    const prevCosted = prevBills.filter((b) => b.costKnown);
    const prevProfit = sum(prevCosted, (b) => b.itemsNet - b.cost);

    const payMap = {};
    bills.forEach((b) => {
      payMap[b.payment] = payMap[b.payment] || { value: 0, count: 0 };
      payMap[b.payment].value += b.total;
      payMap[b.payment].count += 1;
    });
    finals.forEach((f) => {
      payMap[f.payment] = payMap[f.payment] || { value: 0, count: 0 };
      payMap[f.payment].value += f.amount;
      payMap[f.payment].count += 1;
    });
    const byPayment = Object.entries(payMap)
      .map(([label, v]) => ({
        label, value: v.value, note: `${v.count} รายการ`,
        color: label === "เงินสด" ? "#16a34a" : "#3b82f6",
      }))
      .sort((a, b) => b.value - a.value);

    const empMap = {};
    bills.forEach((b) => {
      empMap[b.employee] = empMap[b.employee] || { value: 0, count: 0 };
      empMap[b.employee].value += b.total;
      empMap[b.employee].count += 1;
    });
    const byEmployee = Object.entries(empMap)
      .map(([label, v]) => ({ label, value: v.value, note: `${v.count} บิล`, color: "#8b5cf6" }))
      .sort((a, b) => b.value - a.value);

    const prodMap = {};
    bills.forEach((b) =>
      b.lines.forEach((d) => {
        const id = String(d.Products_idProducts ?? d.notes ?? "other");
        const name = events.productById.get(String(d.Products_idProducts))?.name || d.notes || "สินค้า";
        prodMap[id] = prodMap[id] || { name, qty: 0, revenue: 0 };
        prodMap[id].qty += Number(d.quantity) || 0;
        prodMap[id].revenue += (Number(d.unit_price) || 0) * (Number(d.quantity) || 0);
      })
    );
    const products = Object.values(prodMap).sort((a, b) => b.revenue - a.revenue);
    const productsTotal = sum(products, (p) => p.revenue);

    const days = spanDays(range.from, range.to);
    const monthly = days > 62;
    const bucketOf = (key) => (monthly ? key.slice(0, 7) : key);
    const buckets = [];
    if (monthly) {
      let d = fromKey(range.from);
      d = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = fromKey(range.to);
      while (d <= end) {
        buckets.push(dayKey(d).slice(0, 7));
        d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      }
    } else {
      for (let i = 0; i < days; i++) buckets.push(addDays(range.from, i));
    }
    const productSeries = Object.fromEntries(buckets.map((k) => [k, 0]));
    const tailorSeries = Object.fromEntries(buckets.map((k) => [k, 0]));
    bills.forEach((b) => {
      const k = bucketOf(b.key);
      if (k in productSeries) {
        productSeries[k] += b.itemsNet;
        tailorSeries[k] += b.deposit;
      }
    });
    finals.forEach((f) => {
      const k = bucketOf(f.key);
      if (k in tailorSeries) tailorSeries[k] += f.amount;
    });

    return {
      bills, finals, revenue, prevRevenue, productSales, deposits, finalPaid,
      billCount: bills.length, prevBillCount: prevBills.length,
      avgBill: bills.length ? billTotal / bills.length : 0,
      prevAvgBill: prevBills.length ? prevBillTotal / prevBills.length : 0,
      discount: sum(bills, (b) => b.discount),
      grossProfit, prevProfit, costedCount: costedBills.length,
      byPayment, byEmployee, products, productsTotal,
      chart: { monthly, buckets, productSeries, tailorSeries },
    };
  }, [events, range, prevRange]);

  const chartData = useMemo(() => {
    const { monthly, buckets, productSeries, tailorSeries } = report.chart;
    const label = (k) =>
      monthly
        ? fromKey(`${k}-01`).toLocaleDateString("th-TH", { month: "short", year: "2-digit" })
        : thDate(k, { day: "numeric", month: "short" });
    return {
      labels: buckets.map(label),
      datasets: [
        {
          label: "ขายสินค้า",
          data: buckets.map((k) => productSeries[k]),
          backgroundColor: "#3b82f6",
          borderRadius: 4,
          maxBarThickness: 32,
          stack: "s",
        },
        {
          label: "งานตัดชุด",
          data: buckets.map((k) => tailorSeries[k]),
          backgroundColor: "#a78bfa",
          borderRadius: 4,
          maxBarThickness: 32,
          stack: "s",
        },
      ],
    };
  }, [report.chart]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, color: "#475569", font: { size: 12 } },
      },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${baht(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 11 } } },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        border: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
          callback: (v) => (v >= 1000 ? `฿${(v / 1000).toLocaleString("th-TH")}k` : `฿${v}`),
        },
      },
    },
  }), []);

  const handleDownload = () => {
    const esc = (v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [
      ["รายงานยอดขาย", `${thDate(range.from, { day: "numeric", month: "long", year: "numeric" })} – ${thDate(range.to, { day: "numeric", month: "long", year: "numeric" })}`],
      [],
      ["สรุป"],
      ["รายรับรวม", report.revenue],
      ["ขายสินค้า (หลังส่วนลด)", report.productSales],
      ["มัดจำงานตัด", report.deposits],
      ["รับชำระงานตัดตอนรับชุด", report.finalPaid],
      ["จำนวนบิล", report.billCount],
      ["ค่าเฉลี่ยต่อบิล", Math.round(report.avgBill)],
      ["ส่วนลดที่ให้ไป", report.discount],
      ["กำไรขั้นต้น (สินค้าที่ตั้งต้นทุน)", report.grossProfit],
      [],
      [report.chart.monthly ? "เดือน" : "วันที่", "ขายสินค้า", "งานตัดชุด", "รวม"],
      ...report.chart.buckets.map((k) => {
        const p = report.chart.productSeries[k];
        const t = report.chart.tailorSeries[k];
        return [k, p, t, p + t];
      }),
      [],
      ["อันดับ", "สินค้า", "จำนวน (ชิ้น)", "ยอดขาย"],
      ...report.products.map((p, i) => [i + 1, p.name, p.qty, p.revenue]),
    ];
    const csv = "﻿" + rows.map((r) => r.map(esc).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report_${range.from}_${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rangeText =
    range.from === range.to
      ? thDate(range.from, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : `${thDate(range.from, { day: "numeric", month: "short", year: "numeric" })} – ${thDate(range.to, { day: "numeric", month: "short", year: "numeric" })}`;

  const kpis = [
    {
      key: "rev", tone: "blue", icon: FiDollarSign, label: "รายรับรวม",
      value: baht(report.revenue),
      change: <Change now={report.revenue} before={report.prevRevenue} />,
    },
    {
      key: "bills", tone: "sky", icon: FiFileText, label: "จำนวนบิล",
      value: `${report.billCount.toLocaleString("th-TH")} บิล`,
      change: <Change now={report.billCount} before={report.prevBillCount} />,
    },
    {
      key: "avg", tone: "amber", icon: FiPieChart, label: "ค่าเฉลี่ยต่อบิล",
      value: baht(report.avgBill),
      change: <Change now={report.avgBill} before={report.prevAvgBill} />,
    },
    {
      key: "profit", tone: "green", icon: FiTrendingUp, label: "กำไรขั้นต้น (สินค้า)",
      value: report.costedCount ? baht(report.grossProfit) : "—",
      change: report.costedCount
        ? <Change now={report.grossProfit} before={report.prevProfit} />
        : <span className="sr-change flat">ยังไม่ได้ตั้งต้นทุนสินค้า</span>,
    },
  ];

  const incomeRows = [
    { label: "ขายสินค้าสำเร็จรูป", value: report.productSales, color: "#3b82f6",
      note: report.discount ? `หลังหักส่วนลด ${baht(report.discount)}` : "" },
    { label: "มัดจำงานตัดชุด", value: report.deposits, color: "#a78bfa" },
    { label: "รับชำระงานตัดตอนรับชุด", value: report.finalPaid, color: "#7c3aed",
      note: `${report.finals.length} รายการ` },
  ].filter((r) => r.value > 0);

  return (
    <div className="sr-page">
      <header className="sr-header">
        <div>
          <h1>รายงานยอดขาย</h1>
          <p>{rangeText}</p>
        </div>
        <div className="sr-header-actions">
          <button type="button" className="sr-btn-ghost" onClick={load} disabled={loading}>
            <FiRefreshCw size={15} className={loading ? "spin" : ""} /> รีเฟรช
          </button>
          <button type="button" className="sr-btn-primary" onClick={handleDownload} disabled={loading}>
            <FiDownload size={15} /> ดาวน์โหลด CSV
          </button>
        </div>
      </header>

      <div className="sr-filter">
        <div className="sr-periods">
          {PERIODS.map((p) => (
            <button
              type="button"
              key={p.key}
              className={period === p.key ? "active" : ""}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {period === "custom" && (
          <div className="sr-custom">
            <input
              type="date"
              value={custom.from}
              max={custom.to || undefined}
              onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
            />
            <span>ถึง</span>
            <input
              type="date"
              value={custom.to}
              min={custom.from || undefined}
              onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
            />
          </div>
        )}
      </div>

      {loadFailed && <p className="sr-alert">โหลดข้อมูลบิลไม่สำเร็จ — ตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่</p>}

      <div className="sr-kpis">
        {kpis.map(({ key, tone, icon: Icon, label, value, change }) => (
          <div key={key} className={`sr-kpi ${tone}`}>
            <span className="sr-kpi-icon"><Icon size={18} /></span>
            <span className="sr-kpi-label">{label}</span>
            <strong className="sr-kpi-value">{loading ? "…" : value}</strong>
            {!loading && change}
          </div>
        ))}
      </div>

      <Panel
        title={report.chart.monthly ? "รายรับรายเดือน" : "รายรับรายวัน"}
        icon={FiTrendingUp}
        className="sr-chart-panel"
      >
        <div className="sr-chart">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Panel>

      <div className="sr-row">
        <Panel title="แยกตามประเภทรายรับ" icon={FiPieChart}>
          <BarList rows={incomeRows} total={report.revenue} empty="ไม่มีรายรับในช่วงนี้" />
        </Panel>
        <Panel title="แยกตามวิธีชำระเงิน" icon={FiCreditCard}>
          <BarList rows={report.byPayment} total={report.revenue} empty="ไม่มีรายรับในช่วงนี้" />
        </Panel>
        <Panel title="ยอดขายตามพนักงาน" icon={FiUsers}>
          <BarList
            rows={report.byEmployee}
            total={sum(report.byEmployee, (r) => r.value)}
            empty="ไม่มีบิลในช่วงนี้"
          />
        </Panel>
      </div>

      <Panel
        title="สินค้าขายดี"
        icon={FiAward}
        action="ดูบิลทั้งหมด"
        onAction={() => navigate("/staff/checkorders")}
      >
        {report.products.length === 0 ? (
          <p className="sr-empty">ไม่มีการขายสินค้าในช่วงนี้</p>
        ) : (
          <div className="sr-table-wrap">
            <table className="sr-table">
              <thead>
                <tr>
                  <th className="c">อันดับ</th>
                  <th>สินค้า</th>
                  <th className="r">จำนวน</th>
                  <th className="r">ยอดขาย</th>
                  <th className="share">สัดส่วน</th>
                </tr>
              </thead>
              <tbody>
                {report.products.slice(0, 10).map((p, i) => (
                  <tr key={p.name + i}>
                    <td className="c"><span className={`sr-rank ${i === 0 ? "first" : ""}`}>{i + 1}</span></td>
                    <td>{p.name}</td>
                    <td className="r">{p.qty.toLocaleString("th-TH")} ชิ้น</td>
                    <td className="r"><b>{baht(p.revenue)}</b></td>
                    <td className="share">
                      <div className="sr-share">
                        <div className="sr-bars-track"><i style={{ width: `${pct(p.revenue, report.productsTotal)}%` }} /></div>
                        <span>{pct(p.revenue, report.productsTotal)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {report.products.length > 10 && (
              <p className="sr-more">แสดง 10 จาก {report.products.length} สินค้า — ดาวน์โหลด CSV เพื่อดูทั้งหมด</p>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}
