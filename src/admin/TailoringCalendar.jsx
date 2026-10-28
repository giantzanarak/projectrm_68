import { useCallback, useEffect, useMemo, useState } from "react";
import "../css/TailoringOrders.css";
import AppointmentCalendar from "../components/AppointmentCalendar";
import { getTailoringOrders, updateTailoringOrder } from "../api/fetch_api_admin";
import { garmentLabel } from "./AddTailoringOrders";
import { useDialog } from "../context/DialogContext";

function dbOrderToRow(o) {
  const items = o.items || [];
  return {
    order_id: o.order_code,
    db_order_id: o.order_id,
    customer_name: o.customer_name,
    customer_phone: o.customer_phone,
    type: items.map((it) => garmentLabel(it.garment_type)).filter(Boolean).join(", ") || "-",
    status: [...new Set(items.map((it) => it.status).filter(Boolean))].join(", ") || "-",
    piece_count: items.length,
    deadline: o.deadline,
    appointments: (o.appointments || []).map((a) => ({
      appointment_id: a.appointment_id,
      date: a.appointment_date || "",
      time: a.appointment_time || "",
      purpose: a.purpose || "",
      note: a.note || "",
      done: !!a.done,
    })),
  };
}

const TailoringCalendar = () => {
  const { showAlert, showConfirm } = useDialog();

  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const dbOrders = await getTailoringOrders();
      setOrders(dbOrders.map(dbOrderToRow));
    } catch (err) {
      console.error("โหลดใบสั่งตัดจากฐานข้อมูลไม่สำเร็จ:", err);
      setOrders([]);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const calendarEvents = useMemo(() => {
    const events = [];
    orders.forEach((o) => {
      o.appointments.forEach((a) => {
        if (!a.date) return;
        events.push({
          id: `appt-${a.appointment_id}`,
          appointmentId: a.appointment_id,
          date: a.date,
          time: a.time,
          purpose: a.purpose,
          note: a.note,
          done: a.done,
          order: o,
        });
      });
      if (o.deadline) {
        events.push({
          id: `deadline-${o.db_order_id}`,
          date: o.deadline,
          readOnly: true,
          order: o,
        });
      }
    });
    return events;
  }, [orders]);

  const saveAppointments = async (order, list, successText) => {
    setSaving(true);
    try {
      await updateTailoringOrder(order.db_order_id, {
        appointments: list
          .filter((a) => a.date && a.purpose)
          .map((a) => ({
            appointment_date: a.date,
            appointment_time: a.time || null,
            purpose: a.purpose,
            note: a.note,
            done: a.done,
          })),
      });
      await loadOrders();
      await showAlert(successText);
      return true;
    } catch (err) {
      await showAlert(err?.response?.data?.message || "บันทึกนัดหมายไม่สำเร็จ กรุณาลองใหม่");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const findOrder = (orderId) => orders.find((o) => o.order_id === orderId);

  const handleAddAppointment = async ({ orderId, date, time, purpose, note, done }) => {
    const order = findOrder(orderId);
    if (!order) {
      await showAlert("ไม่พบใบสั่งตัดนี้ในระบบ กรุณารีเฟรชหน้าแล้วลองใหม่");
      return false;
    }
    return saveAppointments(
      order,
      [...order.appointments, { date, time, purpose, note, done }],
      "เพิ่มนัดหมายเรียบร้อยแล้ว"
    );
  };

  const handleEditAppointment = async ({ orderId, appointmentId, date, time, purpose, note, done }) => {
    const order = findOrder(orderId);
    if (!order) {
      await showAlert("ไม่พบใบสั่งตัดนี้ในระบบ กรุณารีเฟรชหน้าแล้วลองใหม่");
      return false;
    }
    const list = order.appointments.map((a) =>
      a.appointment_id === appointmentId ? { ...a, date, time, purpose, note, done } : a
    );
    return saveAppointments(order, list, "แก้ไขนัดหมายเรียบร้อยแล้ว");
  };

  const handleDeleteAppointment = async (event) => {
    const order = findOrder(event.order?.order_id);
    if (!order) {
      await showAlert("ไม่พบใบสั่งตัดนี้ในระบบ กรุณารีเฟรชหน้าแล้วลองใหม่");
      return false;
    }
    const confirmed = await showConfirm(
      `ลบนัด "${event.purpose}" วันที่ ${event.date}${event.time ? ` ${event.time} น.` : ""} ของใบสั่งตัด ${order.order_id} ใช่หรือไม่?`,
      { title: "ยืนยันการลบนัดหมาย", confirmText: "ลบนัด", cancelText: "ยกเลิก" }
    );
    if (!confirmed) return false;

    const list = order.appointments.filter((a) => a.appointment_id !== event.appointmentId);
    return saveAppointments(order, list, "ลบนัดหมายเรียบร้อยแล้ว");
  };

  return (
    <div className="to-page-container">

      <div className="to-header">
        <div className="to-header-info">
          <h1>ปฏิทินในการตัดชุด</h1>
          <p>ดูและจัดการนัดหมายของคำสั่งตัดชุดทั้งหมดในระบบ — เพิ่ม แก้ไข หรือลบนัดได้จากปฏิทินนี้</p>
        </div>
      </div>

      <AppointmentCalendar
        events={calendarEvents}
        orders={orders}
        saving={saving}
        onAddAppointment={handleAddAppointment}
        onEditAppointment={handleEditAppointment}
        onDeleteAppointment={handleDeleteAppointment}
      />

    </div>
  );
};

export default TailoringCalendar;
