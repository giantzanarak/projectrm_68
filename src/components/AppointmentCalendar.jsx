import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronLeft, FiChevronRight, FiPlus, FiX, FiEdit2, FiTrash2,
  FiCalendar, FiClock, FiFlag, FiCheckCircle,
} from "react-icons/fi";
import "../styles/AppointmentCalendar.css";
import Select from "./Select";

const APPOINTMENT_PURPOSES = ["ลองชุด", "วัดตัวเพิ่ม", "แก้ไขงาน", "รับชุด", "อื่น ๆ"];

const PURPOSE_STYLES = [
  { key: "fitting", label: "ลองชุด", test: /ลอง/, color: "#3b82f6", bg: "#eff6ff" },
  { key: "measure", label: "วัดตัวเพิ่ม", test: /วัด/, color: "#8b5cf6", bg: "#f5f3ff" },
  { key: "fix", label: "แก้ไขงาน", test: /แก้/, color: "#dc2626", bg: "#fef2f2" },
  { key: "pickup", label: "รับชุด", test: /รับ/, color: "#16a34a", bg: "#f0fdf4" },
];
const OTHER_STYLE = { key: "other", label: "อื่น ๆ", color: "#64748b", bg: "#f1f5f9" };
const DEADLINE_STYLE = { key: "deadline", label: "กำหนดส่งงาน", color: "#ea580c", bg: "#fff7ed" };
const DONE_STYLE = { key: "done", label: "นัดที่ผ่านแล้ว", color: "#94a3b8", bg: "#f8fafc" };

const eventStyle = (ev) => {
  if (ev.readOnly) return DEADLINE_STYLE;
  if (ev.done) return DONE_STYLE;
  return PURPOSE_STYLES.find((s) => s.test.test(ev.purpose || "")) || OTHER_STYLE;
};
const eventLabel = (ev) => (ev.readOnly ? DEADLINE_STYLE.label : ev.purpose || "นัดหมาย");

const eventTimeLabel = (ev) => (ev.time ? `${ev.time} น.` : "");
const eventChipText = (ev) =>
  `${ev.time ? `${ev.time} ` : ""}${eventLabel(ev)} · ${ev.order?.customer_name ?? ""}`;

const VIEW_MODES = [
  { key: "year", label: "ปี" },
  { key: "month", label: "เดือน" },
  { key: "week", label: "สัปดาห์" },
];

const WEEKDAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function toKey(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromKey(key) {
  const [y, m, d] = String(key).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

const chipVars = (ev) => {
  const s = eventStyle(ev);
  return { "--ev": s.color, "--ev-bg": s.bg };
};

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function buildMonthGrid(anchor) {
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeek(firstOfMonth);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

const MonthGrid = ({ anchor, today, selectedDate, eventsByDay, onSelectDay, onQuickAdd, onEventClick }) => {
  const days = buildMonthGrid(anchor);
  const currentMonth = anchor.getMonth();
  return (
    <div className="cal-month">
      <div className="cal-weekday-row">
        {WEEKDAYS_TH.map((w, i) => (
          <span key={w} className={i === 0 || i === 6 ? "weekend" : ""}>{w}</span>
        ))}
      </div>
      <div className="cal-month-grid">
        {days.map((d) => {
          const key = toKey(d);
          const dayEvents = eventsByDay[key] || [];
          const outside = d.getMonth() !== currentMonth;
          const visibleEvents = dayEvents.slice(0, 3);
          const extraCount = dayEvents.length - visibleEvents.length;
          return (
            <button
              type="button"
              key={key}
              className={[
                "cal-day",
                outside && "outside",
                (d.getDay() === 0 || d.getDay() === 6) && "weekend",
                isSameDay(d, today) && "today",
                selectedDate && isSameDay(d, selectedDate) && "selected",
              ].filter(Boolean).join(" ")}
              onClick={() => onSelectDay(d)}
            >
              <div className="cal-day-head">
                <span className="cal-day-num">{d.getDate()}</span>
                <span
                  className="cal-day-quickadd"
                  role="button"
                  tabIndex={-1}
                  title="เพิ่มนัดหมายวันนี้"
                  onClick={(e) => { e.stopPropagation(); onQuickAdd(d); }}
                >
                  <FiPlus size={12} />
                </span>
              </div>
              {dayEvents.length > 0 && (
                <div className="cal-day-events">
                  {visibleEvents.map((ev) => (
                    <span
                      key={ev.id}
                      className={`cal-day-chip${ev.done ? " done" : ""}`}
                      style={chipVars(ev)}
                      title={eventChipText(ev)}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    >
                      {ev.time && <b>{ev.time}</b>}
                      {eventLabel(ev)} · {ev.order?.customer_name ?? ""}
                    </span>
                  ))}
                  {extraCount > 0 && <span className="cal-more">+{extraCount} รายการ</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const WeekGrid = ({ anchor, today, selectedDate, eventsByDay, onSelectDay, onQuickAdd, onEventClick }) => {
  const start = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  return (
    <div className="cal-week">
      {days.map((d) => {
        const key = toKey(d);
        const dayEvents = eventsByDay[key] || [];
        return (
          <div
            key={key}
            className={[
              "cal-week-day",
              isSameDay(d, today) && "today",
              selectedDate && isSameDay(d, selectedDate) && "selected",
            ].filter(Boolean).join(" ")}
            onClick={() => onSelectDay(d)}
          >
            <div className="cal-week-day-head">
              <span className="cal-week-dow">{WEEKDAYS_TH[d.getDay()]}</span>
              <span className="cal-week-date">{d.getDate()}</span>
              <span
                className="cal-week-quickadd"
                role="button"
                tabIndex={-1}
                title="เพิ่มนัดหมายวันนี้"
                onClick={(e) => { e.stopPropagation(); onQuickAdd(d); }}
              >
                <FiPlus size={12} />
              </span>
            </div>
            <div className="cal-week-events">
              {dayEvents.length === 0 ? (
                <span className="cal-week-empty">ไม่มีนัด</span>
              ) : (
                dayEvents.map((ev) => (
                  <span
                    key={ev.id}
                    className={`cal-week-chip${ev.done ? " done" : ""}`}
                    style={chipVars(ev)}
                    onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                  >
                    <small>{ev.time ? `${ev.time} น.` : "ทั้งวัน"}</small>
                    <strong>{eventLabel(ev)}</strong>
                    <span>{ev.order?.customer_name}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const YearGrid = ({ anchor, today, eventsByDay, onSelectMonth }) => {
  const year = anchor.getFullYear();
  return (
    <div className="cal-year">
      {Array.from({ length: 12 }, (_, m) => {
        const monthAnchor = new Date(year, m, 1);
        const days = buildMonthGrid(monthAnchor);
        const monthCount = days
          .filter((d) => d.getMonth() === m)
          .reduce((sum, d) => sum + (eventsByDay[toKey(d)] || []).length, 0);
        const isCurrent = today.getFullYear() === year && today.getMonth() === m;
        return (
          <button
            type="button"
            key={m}
            className={`cal-year-month${isCurrent ? " current" : ""}`}
            onClick={() => onSelectMonth(monthAnchor)}
          >
            <div className="cal-year-month-title">
              {monthAnchor.toLocaleDateString("th-TH", { month: "long" })}
              {monthCount > 0 && <span className="cal-year-count">{monthCount}</span>}
            </div>
            <div className="cal-year-grid">
              {days.map((d) => {
                const key = toKey(d);
                const hasEvent = (eventsByDay[key] || []).length > 0;
                return (
                  <span
                    key={key}
                    className={[
                      "cal-year-cell",
                      d.getMonth() !== m && "outside",
                      isSameDay(d, today) && "today",
                      hasEvent && "has-event",
                    ].filter(Boolean).join(" ")}
                  >
                    {d.getDate()}
                  </span>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const useEscToClose = (onClose) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
};

const longDateTH = (key) =>
  key
    ? fromKey(key).toLocaleDateString("th-TH", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "";

const AppointmentModal = ({ date, orders, editing, saving, onClose, onSubmit }) => {
  const isEdit = !!editing;
  const [orderId, setOrderId] = useState(editing?.order?.order_id || "");
  const [purpose, setPurpose] = useState(editing?.purpose || APPOINTMENT_PURPOSES[0]);
  const [dateStr, setDateStr] = useState(editing?.date || toKey(date));
  const [timeStr, setTimeStr] = useState(editing?.time || "");
  const [note, setNote] = useState(editing?.note || "");
  const [done, setDone] = useState(!!editing?.done);
  const [error, setError] = useState("");

  useEscToClose(onClose);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderId) return setError("กรุณาเลือกใบสั่งตัด");
    if (!purpose.trim()) return setError("กรุณาระบุสิ่งที่นัด");
    if (!dateStr) return setError("กรุณาเลือกวันที่นัด");
    onSubmit({
      orderId,
      appointmentId: editing?.appointmentId ?? null,
      date: dateStr,
      time: timeStr || "",
      purpose: purpose.trim(),
      note: note.trim(),
      done,
    });
  };

  return (
    <div className="cal-modal-overlay" onClick={onClose}>
      <div className="cal-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="cal-modal-head">
          <span className="cal-modal-icon">
            {isEdit ? <FiEdit2 size={18} /> : <FiCalendar size={18} />}
          </span>
          <div className="cal-modal-titles">
            <h4>{isEdit ? "แก้ไขนัดหมาย" : "เพิ่มนัดหมายใหม่"}</h4>
            <p>{dateStr ? longDateTH(dateStr) : "ยังไม่ได้เลือกวันที่"}</p>
          </div>
          <button type="button" className="cal-modal-close" onClick={onClose} aria-label="ปิด">
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cal-modal-body">
            <label className="cal-form-field">
              <span>ใบสั่งตัด</span>
              <Select
                value={orderId}
                className={orderId ? "" : "is-placeholder"}
                disabled={isEdit}
                autoFocus={!isEdit}
                onChange={(e) => { setOrderId(e.target.value); setError(""); }}
              >
                <option value="">-- เลือกใบสั่งตัด --</option>
                {orders.map((o) => (
                  <option key={o.order_id} value={o.order_id}>
                    {o.order_id} · {o.customer_name}
                  </option>
                ))}
              </Select>
            </label>

            <label className="cal-form-field">
              <span>สิ่งที่นัด</span>
              <input
                list="cal-purpose-options"
                value={purpose}
                placeholder="เช่น ลองชุด"
                autoFocus={isEdit}
                onChange={(e) => { setPurpose(e.target.value); setError(""); }}
              />
              <datalist id="cal-purpose-options">
                {APPOINTMENT_PURPOSES.map((p) => <option key={p} value={p} />)}
              </datalist>
            </label>

            <div className="cal-form-row">
              <label className="cal-form-field">
                <span>วันที่นัด</span>
                <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} required />
              </label>

              <label className="cal-form-field">
                <span>เวลานัด <small className="cal-field-hint">(ไม่ระบุก็ได้)</small></span>
                <input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} />
              </label>
            </div>

            <label className="cal-form-field">
              <span>หมายเหตุ</span>
              <input value={note} placeholder="เช่น นัดช่วงบ่าย" onChange={(e) => setNote(e.target.value)} />
            </label>

            <label className="cal-form-check">
              <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} />
              <span>นัดนี้ผ่านไปแล้ว (ลูกค้ามาตามนัดเรียบร้อย)</span>
            </label>

            {error && <p className="cal-form-error">{error}</p>}
          </div>

          <div className="cal-modal-foot">
            <button type="button" className="cal-btn-cancel" onClick={onClose}>ยกเลิก</button>
            <button type="submit" className="cal-btn-submit" disabled={saving}>
              {saving ? "กำลังบันทึก..." : "บันทึกนัดหมาย"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EventDetailModal = ({ event, onClose, onViewOrder, onEdit, onDelete }) => {
  const style = eventStyle(event);
  const order = event.order || {};
  useEscToClose(onClose);

  return (
    <div className="cal-modal-overlay" onClick={onClose}>
      <div
        className="cal-modal cal-modal-detail"
        role="dialog"
        aria-modal="true"
        style={{ "--ev": style.color, "--ev-bg": style.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cal-modal-head">
          <span className="cal-event-type">{eventLabel(event)}</span>
          <button type="button" className="cal-modal-close" onClick={onClose} aria-label="ปิด">
            <FiX size={18} />
          </button>
        </div>

        <div className="cal-modal-body">
          <div className="cal-event-hero">
            <span className="cal-event-hero-label">{event.readOnly ? "กำหนดส่ง" : "วันที่นัด"}</span>
            <strong className="cal-event-hero-date">
              {longDateTH(event.date)}
            </strong>
            {!event.readOnly && (
              <span className="cal-event-hero-time">
                <FiClock size={13} /> {eventTimeLabel(event) || "ยังไม่ระบุเวลา"}
              </span>
            )}
            <span className="cal-event-hero-cust">
              ใบสั่งตัด <b>{order.order_id || "-"}</b>
            </span>
          </div>

          <div className="cal-event-info-grid">
            <div className="cal-event-info-row">
              <span>ลูกค้า</span>
              <strong className="primary">{order.customer_name || "-"}</strong>
            </div>
            <div className="cal-event-info-row">
              <span>เบอร์โทร</span>
              {order.customer_phone ? (
                <strong className="cal-event-phone">{order.customer_phone}</strong>
              ) : (
                <strong className="muted">ไม่ได้ระบุ</strong>
              )}
            </div>
            {order.type && (
              <div className="cal-event-info-row">
                <span>ประเภทชุด</span>
                <strong>{order.type}</strong>
              </div>
            )}
            {order.status && (
              <div className="cal-event-info-row">
                <span>สถานะงาน</span>
                <strong>{order.status}</strong>
              </div>
            )}
            {event.note && (
              <div className="cal-event-info-row">
                <span>หมายเหตุ</span>
                <strong>{event.note}</strong>
              </div>
            )}
            {!event.readOnly && (
              <div className="cal-event-info-row">
                <span>สถานะนัด</span>
                <strong>{event.done ? "ผ่านไปแล้ว" : "ยังไม่ถึงนัด"}</strong>
              </div>
            )}
          </div>

          {event.readOnly && (
            <p className="cal-modal-hint">
              กำหนดส่งงานมาจากใบสั่งตัด แก้ไขได้ที่หน้ารายละเอียดใบสั่งตัด
            </p>
          )}
        </div>

        <div className="cal-modal-foot">
          {!event.readOnly && (
            <button type="button" className="cal-btn-danger" onClick={() => onDelete(event)}>
              <FiTrash2 size={13} /> ลบนัด
            </button>
          )}
          <button type="button" className="cal-btn-cancel" onClick={() => onViewOrder(order.order_id)}>
            ดูใบสั่งตัด
          </button>
          {!event.readOnly && (
            <button type="button" className="cal-btn-submit" onClick={() => onEdit(event)}>
              <FiEdit2 size={13} /> แก้ไขนัด
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AppointmentCalendar({
  events = [],
  orders = [],
  saving = false,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
}) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("month");
  const [anchor, setAnchor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [addModalDate, setAddModalDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      if (!ev.date) return;
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"))
    );
    return map;
  }, [events]);

  useEffect(() => { setDetailEvent(null); }, [events]);

  const stats = useMemo(() => {
    const todayKey = toKey(today);
    const weekEnd = toKey(addDays(today, 6));
    const monthPrefix = toKey(anchor).slice(0, 7);
    let todayCount = 0, weekCount = 0, deadlineSoon = 0, monthCount = 0;
    events.forEach((ev) => {
      const key = String(ev.date).slice(0, 10);
      const inWeek = key >= todayKey && key <= weekEnd;
      if (ev.readOnly) {
        if (inWeek) deadlineSoon += 1;
        return;
      }
      if (key === todayKey) todayCount += 1;
      if (inWeek && !ev.done) weekCount += 1;
      if (key.startsWith(monthPrefix)) monthCount += 1;
    });
    return { todayCount, weekCount, deadlineSoon, monthCount };
  }, [events, today, anchor]);

  const upcoming = useMemo(() => {
    const todayKey = toKey(today);
    return events
      .filter((ev) => !ev.done && String(ev.date).slice(0, 10) >= todayKey)
      .sort((a, b) =>
        `${a.date} ${a.time || "99:99"}`.localeCompare(`${b.date} ${b.time || "99:99"}`)
      )
      .slice(0, 6);
  }, [events, today]);

  const shiftAnchor = (dir) => {
    const d = new Date(anchor);
    if (viewMode === "year") d.setFullYear(d.getFullYear() + dir);
    else if (viewMode === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setAnchor(d);
  };

  const goToday = () => {
    setAnchor(new Date(today));
    setSelectedDate(new Date(today));
  };

  const title = useMemo(() => {
    if (viewMode === "year") {
      return anchor.toLocaleDateString("th-TH", { year: "numeric" });
    }
    if (viewMode === "month") {
      return anchor.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
    }
    const start = startOfWeek(anchor);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const sameMonth = start.getMonth() === end.getMonth();
    const startLabel = start.toLocaleDateString("th-TH", { day: "numeric", month: sameMonth ? undefined : "short" });
    const endLabel = end.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
    return `${startLabel} – ${endLabel}`;
  }, [anchor, viewMode]);

  const selectedEvents = selectedDate ? eventsByDay[toKey(selectedDate)] || [] : [];

  const closeForm = () => { setAddModalDate(null); setEditingEvent(null); };

  const handleFormSubmit = async (payload) => {
    const ok = payload.appointmentId
      ? await onEditAppointment?.(payload)
      : await onAddAppointment?.(payload);
    if (ok !== false) closeForm();
  };

  const startEdit = (ev) => {
    setDetailEvent(null);
    setEditingEvent(ev);
  };

  const handleDelete = async (ev) => {
    setDetailEvent(null);
    await onDeleteAppointment?.(ev);
  };

  const handleViewOrder = (orderId) => {
    setDetailEvent(null);
    navigate(`/Order/detail/${orderId}`);
  };

  const statCards = [
    { key: "today", label: "นัดวันนี้", value: stats.todayCount, icon: FiCalendar, tone: "blue" },
    { key: "week", label: "นัดใน 7 วันข้างหน้า", value: stats.weekCount, icon: FiClock, tone: "violet" },
    { key: "deadline", label: "ใกล้กำหนดส่ง (7 วัน)", value: stats.deadlineSoon, icon: FiFlag, tone: "orange" },
    {
      key: "month",
      label: `นัดทั้งหมดใน${anchor.toLocaleDateString("th-TH", { month: "long" })}`,
      value: stats.monthCount,
      icon: FiCheckCircle,
      tone: "green",
    },
  ];

  return (
    <div className="cal-shell">
      <div className="cal-stats">
        {statCards.map(({ key, label, value, icon: Icon, tone }) => (
          <div key={key} className={`cal-stat ${tone}`}>
            <span className="cal-stat-icon"><Icon size={18} /></span>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="cal-layout">
        <div className="cal-card">
          <div className="cal-toolbar">
            <div className="cal-nav">
              <span className="cal-title">{title}</span>
              <div className="cal-nav-group">
                <button type="button" className="cal-nav-btn" onClick={() => shiftAnchor(-1)} title="ก่อนหน้า">
                  <FiChevronLeft size={16} />
                </button>
                <button type="button" className="cal-today-btn" onClick={goToday}>
                  วันนี้
                </button>
                <button type="button" className="cal-nav-btn" onClick={() => shiftAnchor(1)} title="ถัดไป">
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="cal-toolbar-right">
              <button
                type="button"
                className="cal-add-btn"
                onClick={() => setAddModalDate(selectedDate || today)}
              >
                <FiPlus size={14} /> เพิ่มนัดหมาย
              </button>
              <div className="cal-view-switch">
                {VIEW_MODES.map((v) => (
                  <button
                    type="button"
                    key={v.key}
                    className={viewMode === v.key ? "active" : ""}
                    onClick={() => setViewMode(v.key)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="cal-legend">
            {[...PURPOSE_STYLES, OTHER_STYLE, DEADLINE_STYLE, DONE_STYLE].map((cfg) => (
              <span key={cfg.key} className="cal-legend-item">
                <i style={{ background: cfg.color }} />
                {cfg.label}
              </span>
            ))}
          </div>

          {viewMode === "month" && (
            <MonthGrid
              anchor={anchor}
              today={today}
              selectedDate={selectedDate}
              eventsByDay={eventsByDay}
              onSelectDay={setSelectedDate}
              onQuickAdd={setAddModalDate}
              onEventClick={setDetailEvent}
            />
          )}
          {viewMode === "week" && (
            <WeekGrid
              anchor={anchor}
              today={today}
              selectedDate={selectedDate}
              eventsByDay={eventsByDay}
              onSelectDay={setSelectedDate}
              onQuickAdd={setAddModalDate}
              onEventClick={setDetailEvent}
            />
          )}
          {viewMode === "year" && (
            <YearGrid
              anchor={anchor}
              today={today}
              eventsByDay={eventsByDay}
              onSelectMonth={(m) => {
                setAnchor(m);
                setViewMode("month");
              }}
            />
          )}

        </div>

        <aside className="cal-side">
            {selectedDate && (
            <div className="cal-side-card cal-detail">
              <div className="cal-detail-headrow">
                <div className="cal-detail-date">
                  <span className="cal-detail-daynum">{selectedDate.getDate()}</span>
                  <div>
                    <h4>{selectedDate.toLocaleDateString("th-TH", { weekday: "long" })}</h4>
                    <small>
                      {selectedDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="cal-detail-add"
                  title="เพิ่มนัดวันนี้"
                  onClick={() => setAddModalDate(selectedDate)}
                >
                  <FiPlus size={14} />
                </button>
              </div>
              {selectedEvents.length === 0 ? (
                <div className="cal-detail-empty">
                  <FiCalendar size={22} />
                  <p>ไม่มีนัดหมายในวันนี้</p>
                </div>
              ) : (
                <ul className="cal-detail-list">
                  {selectedEvents.map((ev) => (
                    <li key={ev.id} style={chipVars(ev)} onClick={() => setDetailEvent(ev)}>
                      <div className="cal-detail-info">
                        <span className="cal-detail-time">
                          {ev.time ? `${ev.time} น.` : ev.readOnly ? "กำหนดส่ง" : "ไม่ระบุเวลา"}
                        </span>
                        <strong>{ev.order.customer_name}</strong>
                        <span className="cal-detail-type">
                          {eventLabel(ev)} · {ev.order.order_id}
                          {ev.note && ` · ${ev.note}`}
                          {ev.done && " · ผ่านไปแล้ว"}
                        </span>
                      </div>
                      {!ev.readOnly && (
                        <span className="cal-detail-actions">
                          <button
                            type="button"
                            title="แก้ไขนัด"
                            onClick={(e) => { e.stopPropagation(); startEdit(ev); }}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="danger"
                            title="ลบนัด"
                            onClick={(e) => { e.stopPropagation(); handleDelete(ev); }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            )}

            <div className="cal-side-card">
              <h4 className="cal-side-title">นัดหมายที่กำลังจะมาถึง</h4>
              {upcoming.length === 0 ? (
                <p className="cal-side-empty">ยังไม่มีนัดหมายถัดไป</p>
              ) : (
                <ul className="cal-upcoming">
                  {upcoming.map((ev) => {
                    const d = fromKey(ev.date);
                    return (
                      <li key={ev.id} style={chipVars(ev)} onClick={() => setDetailEvent(ev)}>
                        <span className="cal-upcoming-date">
                          <b>{d.getDate()}</b>
                          <small>{d.toLocaleDateString("th-TH", { month: "short" })}</small>
                        </span>
                        <div className="cal-upcoming-info">
                          <strong>{ev.order?.customer_name}</strong>
                          <span>
                            <i />
                            {eventLabel(ev)}{ev.time ? ` · ${ev.time} น.` : ""}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
        </aside>
      </div>

      {(addModalDate || editingEvent) && (
        <AppointmentModal
          date={editingEvent ? new Date(editingEvent.date) : addModalDate}
          orders={orders}
          editing={editingEvent}
          saving={saving}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onViewOrder={handleViewOrder}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
