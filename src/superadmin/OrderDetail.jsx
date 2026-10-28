import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiEdit2,
  FiPackage,
  FiTruck,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";
import { useDialog } from "../context/DialogContext";
import {
  getFabricRolls,
  getPurchaseOrderDetailedByCode,
  receivePurchaseOrder,
} from "../api/fetch_api_superadmin";
import "../styles/dashboard.css";
import "../styles/orders.css";

const totalOrdered = (order) =>
  order.items.reduce((sum, item) => sum + Number(item.ordered || 0), 0);

export default function OrderDetail() {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useDialog();
  const { id } = useParams();
  const orderCode = decodeURIComponent(id || "");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  // รับครั้งนี้: จำนวนม้วน + ความยาวแต่ละม้วน (ค่าเริ่มต้น = เมตร/ม้วน ในใบสั่งซื้อ)
  const [receiveQty, setReceiveQty] = useState({});
  const [lengths, setLengths] = useState({});
  const [storageLocation, setStorageLocation] = useState("");
  const [storageOptions, setStorageOptions] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseOrderDetailedByCode(orderCode);
      setOrder(data);
    } catch (error) {
      console.error("โหลดรายละเอียดใบสั่งซื้อไม่สำเร็จ:", error);
      await showAlert(error?.response?.data?.message || "โหลดข้อมูลไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderCode]);

  useEffect(() => {
    if (!order) return;
    setReceiveQty({});
    setLengths({});
  }, [order]);

  // คลังที่เคยใช้ — ให้เลือกได้โดยไม่ต้องพิมพ์
  useEffect(() => {
    getFabricRolls()
      .then((rolls) => {
        const locations = rolls.map((r) => r.storage_location?.trim()).filter(Boolean);
        setStorageOptions([...new Set(locations)]);
      })
      .catch(() => {});
  }, []);

  const remainingOf = (item) => Math.max(Number(item.ordered || 0) - Number(item.received || 0), 0);

  const sumOrdered = useMemo(() => (order ? totalOrdered(order) : 0), [order]);
  const sumReceivedBefore = useMemo(
    () => (order ? order.items.reduce((sum, item) => sum + Number(item.received || 0), 0) : 0),
    [order]
  );
  const sumReceivingNow = useMemo(
    () => Object.values(receiveQty).reduce((sum, n) => sum + Number(n || 0), 0),
    [receiveQty]
  );
  const sumReceived = sumReceivedBefore + sumReceivingNow;

  const isAllReceived = sumReceived >= sumOrdered && sumOrdered > 0;
  const isClosed = sumReceivedBefore >= sumOrdered && sumOrdered > 0;
  const missingCount = Math.max(sumOrdered - sumReceived, 0);

  const changeQty = (item, value) => {
    const nextValue = Math.min(Math.max(0, Math.floor(Number(value) || 0)), remainingOf(item));
    setReceiveQty((prev) => ({ ...prev, [item.item_id]: nextValue }));
    setLengths((prev) => {
      const current = prev[item.item_id] || [];
      const next = Array.from({ length: nextValue }, (_, i) => current[i] ?? String(item.rollLength || ""));
      return { ...prev, [item.item_id]: next };
    });
  };

  const changeLength = (itemId, index, value) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    setLengths((prev) => ({
      ...prev,
      [itemId]: prev[itemId].map((v, i) => (i === index ? cleaned : v)),
    }));
  };

  const receivingItems = order
    ? order.items.filter((item) => Number(receiveQty[item.item_id] || 0) > 0)
    : [];

  const handleConfirmReceive = async () => {
    if (!order) return;

    if (!receivingItems.length) {
      await showAlert("กรุณาระบุจำนวนม้วนที่รับครั้งนี้");
      return;
    }

    const badLength = receivingItems.some((item) =>
      (lengths[item.item_id] || []).some((v) => !(Number(v) > 0))
    );
    if (badLength) {
      await showAlert("กรุณากรอกความยาวของทุกม้วนให้ถูกต้อง");
      return;
    }

    const confirmed = await showConfirm(
      `รับผ้าเข้าคลัง ${sumReceivingNow} ม้วน ใช่หรือไม่?\nระบบจะสร้างม้วนผ้าในหน้าจัดการผ้าให้อัตโนมัติ`,
      {
        title: "ยืนยันการตรวจรับสินค้า",
        confirmText: "ตกลง",
        cancelText: "ยกเลิก",
      }
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      const result = await receivePurchaseOrder(order.po_id, {
        storage_location: storageLocation.trim(),
        items: receivingItems.map((item) => ({
          item_id: item.item_id,
          receive_qty: receiveQty[item.item_id],
          lengths: (lengths[item.item_id] || []).map(Number),
        })),
      });

      const codes = (result.rolls || []).map((r) => r.roll_code).join("\n");
      await showAlert(`รับผ้าเข้าคลังเรียบร้อยแล้ว ${result.rolls?.length || 0} ม้วน\n${codes}`);
      await loadOrder();
    } catch (error) {
      console.error("บันทึกการตรวจรับไม่สำเร็จ:", error);
      await showAlert(error?.response?.data?.message || "บันทึกการตรวจรับไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        icon: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!loading && !order) {
    return (
      <div className="dashboard-page orders-page">
        <div className="order-detail-empty">
          <h2>ไม่พบใบสั่งซื้อ</h2>
          <p>รายการที่คุณเปิดอาจถูกลบไปแล้ว หรือยังไม่มีข้อมูลในระบบ</p>
          <button className="btn-add" onClick={() => navigate("/orders")}>
            <FiArrowLeft size={14} />
            กลับไปหน้าจัดซื้อ
          </button>
        </div>
      </div>
    );
  }

  const statusClass =
    order?.receiveStatus === "รับครบแล้ว"
      ? "status-success"
      : order?.receiveStatus === "รับบางส่วน"
        ? "status-partial"
        : "status-pending";

  return (
    <div className="dashboard-page orders-page">
      <div className="dashboard-header order-detail-header">
        <div>
          <h1 className="dash-title">รายละเอียดใบสั่งซื้อ</h1>
          <p className="dash-sub">
            ตรวจสอบข้อมูลใบสั่งซื้อและบันทึกการตรวจรับสินค้าในหน้านี้
          </p>
        </div>
        {!!order && (
          <div className="dash-right">
            <button
              className="order-edit-btn"
              onClick={async () => {
                const confirmed = await showConfirm(`ต้องการแก้ไขใบสั่งซื้อ ${order.id} ใช่หรือไม่?`, {
                  title: "ยืนยันการแก้ไข",
                  confirmText: "ตกลง",
                  cancelText: "ยกเลิก",
                });
                if (!confirmed) return;
                navigate(`/orders/edit/${encodeURIComponent(order.id)}`);
              }}
            >
              <FiEdit2 size={15} />
              แก้ไขใบสั่งซื้อ
            </button>
          </div>
        )}
      </div>

      {loading || !order ? (
        <div className="order-detail-empty">
          <p>กำลังโหลดรายละเอียดใบสั่งซื้อ...</p>
        </div>
      ) : (
        <div className="order-detail-grid">
          <section className="order-detail-card">
            <div className="order-detail-card-head">
              <div>
                <p className="order-detail-eyebrow">เลขที่ใบสั่งซื้อ</p>
                <h2 className="order-detail-id">{order.id}</h2>
              </div>
              <span className={`status-pill ${statusClass}`}>{order.receiveStatus}</span>
            </div>

            <div className="order-detail-meta">
              <div className="order-meta-item">
                <FiCalendar size={16} />
                <div>
                  <span>วันที่สั่ง</span>
                  <strong>{order.date}</strong>
                </div>
              </div>
              <div className="order-meta-item">
                <FiTruck size={16} />
                <div>
                  <span>จำนวนม้วนรวม</span>
                  <strong>{sumOrdered.toLocaleString()} ม้วน</strong>
                </div>
              </div>
              <div className="order-meta-item">
                <FiUser size={16} />
                <div>
                  <span>ซัพพลายเออร์</span>
                  <strong>{order.supplier}</strong>
                </div>
              </div>
              <div className="order-meta-item">
                <FiPackage size={16} />
                <div>
                  <span>มูลค่ารวม</span>
                  <strong>฿{Number(order.price || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="order-detail-card receive-detail-card">
            <div className="receive-modal-header receive-detail-head">
              <div>
                <h2 className="modal-title">ตรวจรับสินค้า</h2>
                <p className="modal-sub">
                  ใส่จำนวนม้วนที่ได้รับ ระบบจะสร้างม้วนผ้าในหน้าจัดการผ้าให้อัตโนมัติ
                </p>
              </div>
            </div>

            <div className={`receive-summary-bar ${isAllReceived ? "bar-ok" : "bar-warn"}`}>
              {isAllReceived ? (
                <>
                  <FiCheckCircle size={15} />
                  รับครบตามคำสั่งซื้อแล้ว
                </>
              ) : (
                <>
                  <FiAlertCircle size={15} />
                  ยังขาดอีก <strong>{missingCount}</strong> ม้วน
                </>
              )}
              <span className="bar-count">{sumReceived} / {sumOrdered}</span>
            </div>

            <div className="receive-table-wrap order-detail-receive-table">
              <table className="receive-table">
                <thead>
                  <tr>
                    <th>รายการผ้า</th>
                    <th>สั่งซื้อ</th>
                    <th>เมตร/ม้วน</th>
                    <th>ราคาต่อม้วน</th>
                    <th>รับแล้ว</th>
                    <th>รับครั้งนี้</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => {
                    const remaining = remainingOf(item);
                    const totalAfter = Number(item.received || 0) + Number(receiveQty[item.item_id] || 0);
                    const full = totalAfter >= item.ordered;
                    const partial = totalAfter > 0 && totalAfter < item.ordered;

                    return (
                      <tr key={item.item_id}>
                        <td className="receive-item-name">
                          {item.name}
                          {item.spec && <span className="receive-new-badge">ผ้าใหม่</span>}
                        </td>
                        <td>{item.ordered} ม้วน</td>
                        <td>{Number(item.rollLength || 0).toLocaleString()} เมตร</td>
                        <td>฿{Number(item.unitPrice || 0).toLocaleString()}</td>
                        <td>{item.received} ม้วน</td>
                        <td>
                          {remaining > 0 ? (
                            <input
                              className="receive-qty-input"
                              type="text"
                              inputMode="numeric"
                              value={receiveQty[item.item_id] ?? ""}
                              placeholder="0"
                              onChange={(e) => changeQty(item, e.target.value)}
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <span
                            className={`receive-badge ${
                              full ? "receive-complete" : partial ? "receive-partial" : "receive-pending"
                            }`}
                          >
                            {full ? "ครบแล้ว" : partial ? "บางส่วน" : "รอรับ"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {receivingItems.length > 0 && (
              <div className="receive-rolls">
                <h3 className="receive-rolls-title">ความยาวแต่ละม้วน (เมตร)</h3>
                <p className="receive-rolls-sub">แก้เฉพาะม้วนที่ความยาวจริงไม่ตรงกับที่สั่ง</p>
                {receivingItems.map((item) => (
                  <div key={item.item_id} className="receive-rolls-item">
                    <span className="receive-rolls-name">{item.name}</span>
                    <div className="receive-rolls-inputs">
                      {(lengths[item.item_id] || []).map((value, index) => (
                        <label key={index} className="receive-roll-length">
                          <span>ม้วน {index + 1}</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => changeLength(item.item_id, index, e.target.value)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <label className="receive-storage">
                  <span>คลังที่จัดเก็บ</span>
                  <input
                    type="text"
                    list="receive-storage-options"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="เลือกหรือระบุสถานที่จัดเก็บ"
                  />
                  <datalist id="receive-storage-options">
                    {storageOptions.map((loc) => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </label>
              </div>
            )}

            {!isClosed && (
              <div className="receive-footer">
                <button
                  className="receive-confirm-btn"
                  onClick={handleConfirmReceive}
                  disabled={saving}
                >
                  <FiCheck size={16} />
                  {saving ? "กำลังบันทึก..." : "บันทึกการตรวจรับ"}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
