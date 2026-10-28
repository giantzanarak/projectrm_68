import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiPackage,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDialog } from "../context/DialogContext";
import {
  deletePurchaseOrder,
  getPurchaseOrdersDetailed,
} from "../api/fetch_api_superadmin";
import "../styles/dashboard.css";
import "../styles/orders.css";

const ORDER_PAGE_SIZE = 10;

const totalOrdered = (order) =>
  order.items.reduce((sum, item) => sum + Number(item.ordered || 0), 0);

const totalReceived = (order) =>
  order.items.reduce((sum, item) => sum + Number(item.received || 0), 0);

const formatDateInput = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const nextOrderId = (orders) => {
  const year = new Date().getFullYear();
  const maxSequence = orders.reduce((max, order) => {
    const match = String(order.id || "").match(/PO-(\d{4})-(\d+)/);
    if (!match || Number(match[1]) !== year) return max;
    return Math.max(max, Number(match[2]));
  }, 0);

  return `PO-${year}-${String(maxSequence + 1).padStart(3, "0")}`;
};

export default function Orders() {
  const navigate = useNavigate();
  const { showConfirm, showAlert } = useDialog();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderPage, setOrderPage] = useState(1);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseOrdersDetailed();
      setOrders(data);
    } catch (error) {
      console.error("โหลดใบสั่งซื้อไม่สำเร็จ:", error);
      await showAlert(error?.response?.data?.message || "โหลดใบสั่งซื้อไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const totalOrdersCount = orders.length;
  const receivedCount = orders.filter((o) => o.receiveStatus === "รับครบแล้ว").length;
  const waitingCount = orders.filter((o) => o.receiveStatus !== "รับครบแล้ว").length;

  const orderTotalPages = Math.max(1, Math.ceil(orders.length / ORDER_PAGE_SIZE));
  const pagedOrders = useMemo(
    () => orders.slice((orderPage - 1) * ORDER_PAGE_SIZE, orderPage * ORDER_PAGE_SIZE),
    [orders, orderPage]
  );

  const deleteOrder = async (order) => {
    const confirmed = await showConfirm(`ต้องการลบใบสั่งซื้อ ${order.id} จริงหรือไม่?`, {
      title: "ยืนยันการลบ",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });
    if (!confirmed) return;

    try {
      await deletePurchaseOrder(order.po_id);
      await showAlert(`ลบใบสั่งซื้อ ${order.id} เรียบร้อยแล้ว`, {
        title: "ลบข้อมูลสำเร็จ",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
      await loadOrders();
      setOrderPage((p) => Math.min(p, Math.max(1, Math.ceil((orders.length - 1) / ORDER_PAGE_SIZE))));
    } catch (error) {
      console.error("ลบใบสั่งซื้อไม่สำเร็จ:", error);
      await showAlert(error?.response?.data?.message || "ลบใบสั่งซื้อไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        icon: "error",
      });
    }
  };

  const handleEditOrder = async (id) => {
    const confirmed = await showConfirm(`ต้องการแก้ไขใบสั่งซื้อ ${id} ใช่หรือไม่?`, {
      title: "ยืนยันการแก้ไข",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });

    if (!confirmed) return;
    navigate(`/orders/edit/${encodeURIComponent(id)}`);
  };

  return (
    <div className="dashboard-page orders-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dash-title">จัดซื้อ</h1>
          <p className="dash-sub">จัดการคำสั่งซื้อวัตถุดิบและผู้จัดจำหน่าย</p>
        </div>
      </div>

      <div className="summary-container">
        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">ใบสั่งซื้อทั้งหมด</span>
            <h2 className="card-value">{totalOrdersCount}</h2>
          </div>
          <div className="card-icon-box bg-gray-light">
            <FiCalendar size={22} />
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">รับครบแล้ว</span>
            <h2 className="card-value">{receivedCount}</h2>
          </div>
          <div className="card-icon-box bg-gray-light">
            <FiCheckCircle size={22} />
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">รอสินค้า / รับบางส่วน</span>
            <h2 className="card-value">{waitingCount}</h2>
          </div>
          <div className="card-icon-box bg-gray-light">
            <FiPackage size={22} />
          </div>
        </div>
      </div>

      <div className="orders-toolbar">
        <div className="orders-table-heading">คำสั่งซื้อ</div>
        <button
          className="btn-add"
          onClick={() =>
            navigate("/orders/add", {
              state: { nextOrderId: nextOrderId(orders), defaultDate: formatDateInput() },
            })
          }
        >
          <FiPlus size={14} /> สร้างใบสั่งซื้อ
        </button>
      </div>

      <div className="orders-table-section">
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>เลขที่ใบสั่งซื้อ</th>
                <th>วันที่สั่ง</th>
                <th>ผู้จัดจำหน่าย</th>
                <th>จำนวนผ้าทั้งหมด</th>
                <th>มูลค่า</th>
                <th>สถานะรับของ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="empty-row">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : (
                pagedOrders.map((order) => {
                  const ordered = totalOrdered(order);
                  const received = totalReceived(order);
                  const statusClass =
                    order.receiveStatus === "รับครบแล้ว"
                      ? "status-success"
                      : order.receiveStatus === "รับบางส่วน"
                        ? "status-partial"
                        : "status-pending";

                  return (
                    <tr key={order.po_id}>
                      <td className="order-id-cell">{order.id}</td>
                      <td>{order.date}</td>
                      <td>{order.supplier}</td>
                      <td>{ordered.toLocaleString()} ม้วน</td>
                      <td className="blue-text">฿{Number(order.price || 0).toLocaleString()}</td>
                      <td>
                        <span className={`status-pill ${statusClass}`}>
                          {order.receiveStatus}
                        </span>
                        <span className="status-note">{received}/{ordered} ม้วน</span>
                      </td>
                      <td>
                        <div className="orders-actions">
                          <button
                            className="icon-btn"
                            title="ดูรายละเอียด"
                            onClick={() => navigate(`/orders/detail/${encodeURIComponent(order.id)}`)}
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            className="icon-btn edit"
                            title="แก้ไข"
                            onClick={() => handleEditOrder(order.id)}
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            className="icon-btn delete"
                            title="ลบ"
                            onClick={() => deleteOrder(order)}
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {!loading && pagedOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-row">ไม่มีรายการสั่งซื้อ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {orderTotalPages > 1 && (
          <div className="orders-pagination">
            <button
              className="page-btn"
              onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
              disabled={orderPage === 1}
            >
              ก่อนหน้า
            </button>
            <span className="page-info">หน้า {orderPage} / {orderTotalPages}</span>
            <button
              className="page-btn"
              onClick={() => setOrderPage((p) => Math.min(orderTotalPages, p + 1))}
              disabled={orderPage === orderTotalPages}
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
