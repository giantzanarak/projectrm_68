import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiRefreshCw, FiDollarSign, FiCalendar, FiAlertCircle, FiLayers,
  FiClock, FiChevronRight, FiScissors, FiAward,
} from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip,
} from "chart.js";
import { getBills, getBillDetails, getProducts, baht } from "../api/billApi";
import { getTailoringOrders } from "../api/fetch_api_admin";
import { getFabricRolls } from "../api/fetch_api_superadmin";
import "../styles/dashboardHome.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const LOW_STOCK_METERS = 10;
const CHART_DAYS = 14;
const AUTO_REFRESH_MS = 5 * 60 * 1000;

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

const daysBetween = (fromK, toK) =>
  Math.round((fromKey(toK) - fromKey(fromK)) / 86400000);

const shortDate = (key) =>
  key ? fromKey(key).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : "-";

const sum = (arr, fn) => arr.reduce((s, x) => s + (Number(fn(x)) || 0), 0);

function orderIsFinished(o) {
  const list = (o.items || []).map((it) => it.status).filter(Boolean);
  return list.length > 0 && list.every((s) => s === "เสร็จแล้ว");
}

function orderMoney(o) {
  const total = (Number(o.pieces_total) || 0) + (Number(o.alterations_total) || 0);
  const paid = (Number(o.deposit) || 0) + (Number(o.final_paid_amount) || 0);
  return { total, paid, outstanding: Math.max(0, total - paid) };
}

const Panel = ({ title, icon: Icon, action, onAction, children, className = "" }) => (
  <section className={`dh-panel ${className}`}>
    <div className="dh-panel-head">
      <h3>{Icon && <Icon size={16} />} {title}</h3>
      {action && (
        <button type="button" className="dh-link" onClick={onAction}>
          {action} <FiChevronRight size={14} />
        </button>
      )}
    </div>
    {children}
  </section>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ bills: [], details: [], products: [], orders: [], rolls: [] });
  const [failed, setFailed] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState(null);

  // silent = โหลดเบื้องหลัง ไม่แสดงสถานะกำลังโหลด (ใช้กับรีเฟรชอัตโนมัติ)
  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    const [bills, details, products, orders, rolls] = await Promise.allSettled([
      getBills(), getBillDetails(), getProducts(), getTailoringOrders(), getFabricRolls(),
    ]);
    const val = (r) => (r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []);
    setData({
      bills: val(bills), details: val(details), products: val(products),
      orders: val(orders), rolls: val(rolls),
    });
    setFailed({
      bills: bills.status === "rejected",
      orders: orders.status === "rejected",
      rolls: rolls.status === "rejected",
    });
    setLoadedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // รีเฟรชอัตโนมัติทุก 5 นาที และทันทีเมื่อกลับมาที่แท็บนี้ — ข้ามวันแล้ววันที่/ตัวเลขเปลี่ยนเอง
  useEffect(() => {
    const timer = setInterval(() => load({ silent: true }), AUTO_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") load({ silent: true });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const todayKey = dayKey(new Date());
  const monthPrefix = todayKey.slice(0, 7);
  const yesterdayKey = dayKey(new Date(Date.now() - 86400000));

  /* ---------- sales ---------- */
  const sales = useMemo(() => {
    const byDay = {};
    data.bills.forEach((b) => {
      const k = dayKey(b.created_at);
      if (!k) return;
      byDay[k] = byDay[k] || { total: 0, count: 0 };
      byDay[k].total += Number(b.totalAmount) || 0;
      byDay[k].count += 1;
    });
    const monthBills = data.bills.filter((b) => dayKey(b.created_at).startsWith(monthPrefix));
    return {
      byDay,
      today: byDay[todayKey] || { total: 0, count: 0 },
      yesterday: byDay[yesterdayKey] || { total: 0, count: 0 },
      monthTotal: sum(monthBills, (b) => b.totalAmount),
      monthCount: monthBills.length,
      monthBillIds: new Set(monthBills.map((b) => String(b.idBill))),
    };
  }, [data.bills, todayKey, yesterdayKey, monthPrefix]);

  const chart = useMemo(() => {
    const keys = Array.from({ length: CHART_DAYS }, (_, i) =>
      dayKey(new Date(Date.now() - (CHART_DAYS - 1 - i) * 86400000))
    );
    return {
      labels: keys.map(shortDate),
      datasets: [{
        label: "ยอดขาย",
        data: keys.map((k) => sales.byDay[k]?.total || 0),
        backgroundColor: keys.map((k) => (k === todayKey ? "#2563eb" : "#bfdbfe")),
        hoverBackgroundColor: "#3b82f6",
        borderRadius: 6,
        maxBarThickness: 28,
      }],
    };
  }, [sales.byDay, todayKey]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${baht(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 11 } } },
      y: {
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

  /* ---------- tailoring ---------- */
  const tailoring = useMemo(() => {
    const active = data.orders.filter((o) => !orderIsFinished(o));
    const withMoney = data.orders.map((o) => ({ o, ...orderMoney(o) }));
    const owing = withMoney.filter((x) => x.outstanding > 0);

    const watch = active
      .filter((o) => o.deadline)
      .map((o) => ({ o, diff: daysBetween(todayKey, dayKey(o.deadline)) }))
      .filter((x) => x.diff <= 7)
      .sort((a, b) => a.diff - b.diff);

    const appointments = [];
    data.orders.forEach((o) => {
      (o.appointments || []).forEach((a) => {
        if (String(a.appointment_date || "").slice(0, 10) === todayKey && !a.done) {
          appointments.push({ o, time: a.appointment_time || "", purpose: a.purpose || "นัดหมาย" });
        }
      });
      if (dayKey(o.deadline) === todayKey && !orderIsFinished(o)) {
        appointments.push({ o, time: "", purpose: "กำหนดส่งงาน", deadline: true });
      }
    });
    appointments.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));

    return {
      activeCount: active.length,
      owingTotal: sum(owing, (x) => x.outstanding),
      owingCount: owing.length,
      overdueCount: watch.filter((x) => x.diff < 0).length,
      watch,
      appointments,
    };
  }, [data.orders, todayKey]);

  /* ---------- best sellers this month ---------- */
  const bestSellers = useMemo(() => {
    const nameOf = (id) => data.products.find((p) => String(p.id) === String(id))?.name;
    const map = {};
    data.details
      .filter((d) => sales.monthBillIds.has(String(d.Bill_idBill)))
      .forEach((d) => {
        const key = d.Products_idProducts ?? d.notes ?? "other";
        const name = nameOf(d.Products_idProducts) || d.notes || "สินค้า";
        map[key] = map[key] || { name, qty: 0, revenue: 0 };
        map[key].qty += Number(d.quantity) || 0;
        map[key].revenue += (Number(d.unit_price) || 0) * (Number(d.quantity) || 0);
      });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [data.details, data.products, sales.monthBillIds]);

  /* ---------- fabric stock ---------- */
  const fabric = useMemo(() => {
    const low = data.rolls
      .map((r) => ({ r, left: Number(r.remaining_length) || 0 }))
      .filter((x) => x.left < LOW_STOCK_METERS)
      .sort((a, b) => a.left - b.left);
    return { low, emptyCount: low.filter((x) => x.left === 0).length };
  }, [data.rolls]);

  const salesDiff = sales.today.total - sales.yesterday.total;

  const kpis = [
    {
      key: "today", tone: "blue", icon: FiDollarSign,
      label: "ยอดขายวันนี้",
      value: baht(sales.today.total),
      note: `${sales.today.count} บิล · ${
        salesDiff === 0 ? "เท่ากับเมื่อวาน"
          : `${salesDiff > 0 ? "▲" : "▼"} ${baht(Math.abs(salesDiff))} จากเมื่อวาน`
      }`,
      noteTone: salesDiff > 0 ? "up" : salesDiff < 0 ? "down" : "",
      to: "/staff/checkorders",
    },
    {
      key: "month", tone: "violet", icon: FiCalendar,
      label: `ยอดขาย${new Date().toLocaleDateString("th-TH", { month: "long" })}`,
      value: baht(sales.monthTotal),
      note: `${sales.monthCount} บิล`,
      to: "/staff/sales-report",
    },
    {
      key: "owe", tone: "red", icon: FiAlertCircle,
      label: "ยอดค้างชำระ (งานตัด)",
      value: baht(tailoring.owingTotal),
      note: `${tailoring.owingCount} ใบสั่งตัด`,
      to: "/staff/tailoringorders",
    },
    {
      key: "fabric", tone: "amber", icon: FiLayers,
      label: "ผ้าใกล้หมด",
      value: `${fabric.low.length} ม้วน`,
      note: fabric.emptyCount ? `หมดแล้ว ${fabric.emptyCount} ม้วน` : `เหลือน้อยกว่า ${LOW_STOCK_METERS} ม.`,
      to: "/Fabric",
    },
  ];

  return (
    <div className="dh-page">
      <header className="dh-header">
        <div>
          <h1>สรุปยอดขาย</h1>
          <p>
            {new Date().toLocaleDateString("th-TH", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
            {loadedAt && ` · อัปเดตล่าสุด ${loadedAt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.`}
          </p>
        </div>
        <button type="button" className="dh-refresh" onClick={() => load()} disabled={loading}>
          <FiRefreshCw size={15} className={loading ? "spin" : ""} />
          {loading ? "กำลังโหลด..." : "รีเฟรช"}
        </button>
      </header>

      {failed.bills && (
        <p className="dh-alert">โหลดข้อมูลบิลไม่สำเร็จ — ตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่</p>
      )}
      
      <div className="dh-kpis">
        {kpis.map(({ key, tone, icon: Icon, label, value, note, noteTone, to }) => (
          <button type="button" key={key} className={`dh-kpi ${tone}`} onClick={() => navigate(to)}>
            <span className="dh-kpi-icon"><Icon size={18} /></span>
            <span className="dh-kpi-label">{label}</span>
            <strong className="dh-kpi-value">{loading ? "…" : value}</strong>
            <span className={`dh-kpi-note ${noteTone || ""}`}>{loading ? "" : note}</span>
          </button>
        ))}
      </div>

      <div className="dh-row dh-row-main">
        <Panel
          title={`ยอดขาย ${CHART_DAYS} วันล่าสุด`}
          icon={FiDollarSign}
          action="ประวัติการขาย"
          onAction={() => navigate("/staff/checkorders")}
          className="dh-chart-panel"
        >
          <div className="dh-chart">
            <Bar data={chart} options={chartOptions} />
          </div>
        </Panel>

        <Panel
          title="นัดหมายวันนี้"
          icon={FiClock}
          action="ปฏิทิน"
          onAction={() => navigate("/staff/tailoringcalendar")}
        >
          {tailoring.appointments.length === 0 ? (
            <p className="dh-empty">ไม่มีนัดหมายวันนี้</p>
          ) : (
            <ul className="dh-list">
              {tailoring.appointments.map((a, i) => (
                <li key={i} onClick={() => navigate(`/Order/detail/${a.o.order_code}`)}>
                  <span className={`dh-time ${a.deadline ? "deadline" : ""}`}>
                    {a.time ? a.time.slice(0, 5) : a.deadline ? "ส่งงาน" : "—"}
                  </span>
                  <div className="dh-list-main">
                    <strong>{a.o.customer_name || "-"}</strong>
                    <span>{a.purpose} · {a.o.order_code}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="dh-row dh-row-three">
        <Panel
          title="งานตัดใกล้ถึงกำหนดส่ง"
          icon={FiScissors}
          action="คิวตัดชุด"
          onAction={() => navigate("/staff/tailoringorders")}
        >
          {failed.orders ? (
            <p className="dh-empty">โหลดข้อมูลงานตัดไม่สำเร็จ</p>
          ) : tailoring.watch.length === 0 ? (
            <p className="dh-empty">ไม่มีงานที่ต้องส่งใน 7 วันนี้</p>
          ) : (
            <ul className="dh-list">
              {tailoring.watch.slice(0, 6).map(({ o, diff }) => (
                <li key={o.order_id} onClick={() => navigate(`/Order/detail/${o.order_code}`)}>
                  <div className="dh-list-main">
                    <strong>{o.customer_name || "-"}</strong>
                    <span>{o.order_code} · ส่ง {shortDate(dayKey(o.deadline))}</span>
                  </div>
                  <span className={`dh-tag ${diff < 0 ? "red" : diff <= 2 ? "amber" : "gray"}`}>
                    {diff < 0 ? `เลย ${Math.abs(diff)} วัน` : diff === 0 ? "วันนี้" : `อีก ${diff} วัน`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {tailoring.watch.length > 6 && (
            <p className="dh-more">และอีก {tailoring.watch.length - 6} งาน</p>
          )}
        </Panel>

        <Panel
          title="สินค้าขายดีเดือนนี้"
          icon={FiAward}
          action="รายงาน"
          onAction={() => navigate("/staff/sales-report")}
        >
          {bestSellers.length === 0 ? (
            <p className="dh-empty">ยังไม่มีการขายสินค้าเดือนนี้</p>
          ) : (
            <ol className="dh-rank">
              {bestSellers.map((p, i) => (
                <li key={p.name}>
                  <span className="dh-rank-no">{i + 1}</span>
                  <div className="dh-list-main">
                    <strong>{p.name}</strong>
                    <span>ขายได้ {p.qty} ชิ้น</span>
                  </div>
                  <span className="dh-money">{baht(p.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel
          title="ผ้าใกล้หมด"
          icon={FiLayers}
          action="จัดการผ้า"
          onAction={() => navigate("/Fabric")}
        >
          {failed.rolls ? (
            <p className="dh-empty">โหลดข้อมูลผ้าไม่สำเร็จ</p>
          ) : fabric.low.length === 0 ? (
            <p className="dh-empty">ผ้าทุกม้วนมีเพียงพอ</p>
          ) : (
            <ul className="dh-list">
              {fabric.low.slice(0, 6).map(({ r, left }) => (
                <li key={r.roll_id} onClick={() => navigate(`/Fabric/detail/${r.roll_id}`)}>
                  <div className="dh-list-main">
                    <strong>{r.fabric_name || "ผ้า"}</strong>
                    <span>FR-{String(r.roll_id).padStart(3, "0")} · {r.color_name || r.type_name || "-"}</span>
                  </div>
                  <span className={`dh-tag ${left === 0 ? "red" : "amber"}`}>
                    {left === 0 ? "หมด" : `${left} ม.`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {fabric.low.length > 6 && (
            <p className="dh-more">และอีก {fabric.low.length - 6} ม้วน</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
