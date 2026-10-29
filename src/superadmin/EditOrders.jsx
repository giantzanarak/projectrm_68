import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiTrash2, FiPlus } from "react-icons/fi";
import { useDialog } from "../context/DialogContext";
import {
  addPurchaseOrderItem,
  deletePurchaseOrderItem,
  editPurchaseOrder,
  editPurchaseOrderItem,
  getCategories,
  getColors,
  getFabricTypes,
  getPurchaseOrderDetailedByCode,
  getSupplierFabrics,
  getSuppliers,
  toApiPurchaseOrderStatus,
} from "../api/fetch_api_superadmin";
import OrderFabricPicker from "../components/OrderFabricPicker";
import "../styles/AddOrders.css";
import Select from "../components/Select";

const createEmptyItem = (index = Date.now()) => ({
  item_id: index,
  fabricId: "",
  fabricName: "",
  spec: null,
  rollQty: 0,
  rollLength: 0,
  pricePerRoll: 0,
  receivedRollQty: 0,
});

export default function EditOrders() {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useDialog();
  const { id } = useParams();
  const orderCode = decodeURIComponent(id || "");

  const [suppliers, setSuppliers] = useState([]);
  const [supplierFabrics, setSupplierFabrics] = useState([]);
  const [masters, setMasters] = useState({ type: [], pattern: [], color: [] });
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMasters = async () => {
    const [types, patterns, colors] = await Promise.all([
      getFabricTypes(),
      getCategories(),
      getColors(),
    ]);
    setMasters({ type: types || [], pattern: patterns || [], color: colors || [] });
  };

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const [supplierData, orderData] = await Promise.all([
        getSuppliers(),
        getPurchaseOrderDetailedByCode(orderCode),
        loadMasters(),
      ]);

      setSuppliers(supplierData || []);
      setOrder(orderData);

      if (orderData) {
        setForm({
          id: orderData.id,
          date: orderData.date || "",
          supplierId: orderData.supplierId || "",
          items: orderData.items?.length
            ? orderData.items.map((item, index) => ({
                item_id: item.item_id || Date.now() + index,
                fabricId: item.fabricId || "",
                fabricName: item.name || "",
                spec: item.spec,
                rollQty: Number(item.ordered || 0),
                rollLength: Number(item.rollLength || 0),
                pricePerRoll: Number(item.unitPrice || 0),
                receivedRollQty: Number(item.received || 0),
              }))
            : [createEmptyItem()],
        });
      }
    } catch (error) {
      console.error("โหลดข้อมูลใบสั่งซื้อไม่สำเร็จ:", error);
      await showAlert(error?.response?.data?.message || "โหลดข้อมูลไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [orderCode]);

  const supplierId = form?.supplierId;
  useEffect(() => {
    setSupplierFabrics([]);
    if (!supplierId) return;

    let cancelled = false;
    getSupplierFabrics(supplierId)
      .then((rows) => { if (!cancelled) setSupplierFabrics(rows || []); })
      .catch((err) => console.error("โหลดผ้าของผู้จัดจำหน่ายไม่สำเร็จ:", err));
    return () => { cancelled = true; };
  }, [supplierId]);

  const hasReceived = !!form?.items.some((item) => Number(item.receivedRollQty) > 0);

  const updateForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name !== "supplierId" || value === prev.supplierId) return { ...prev, [name]: value };
      return {
        ...prev,
        supplierId: value,
        items: prev.items.map((item) => ({ ...item, fabricId: "", fabricName: "", spec: null })),
      };
    });
  };

  const updateItemFabric = (itemId, fabric) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.item_id === itemId ? { ...item, ...fabric } : item)),
    }));
  };

  const updateItem = (itemId, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.item_id !== itemId) return item;

        const nextValue =
          ["rollQty", "rollLength", "pricePerRoll", "receivedRollQty"].includes(field)
            ? Math.max(0, Number(value) || 0)
            : value;

        return { ...item, [field]: nextValue };
      }),
    }));
  };

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, createEmptyItem(Date.now() + prev.items.length)],
    }));
  };

  const removeItemRow = (itemId) => {
    setForm((prev) => ({
      ...prev,
      items:
        prev.items.length === 1
          ? prev.items
          : prev.items.filter((item) => item.item_id !== itemId),
    }));
  };

  const totalRolls = useMemo(
    () => (form ? form.items.reduce((sum, item) => sum + Number(item.rollQty || 0), 0) : 0),
    [form]
  );

  const totalLength = useMemo(
    () =>
      form
        ? form.items.reduce(
            (sum, item) => sum + Number(item.rollQty || 0) * Number(item.rollLength || 0),
            0
          )
        : 0,
    [form]
  );

  const totalAmount = useMemo(
    () =>
      form
        ? form.items.reduce(
            (sum, item) => sum + Number(item.rollQty || 0) * Number(item.pricePerRoll || 0),
            0
          )
        : 0,
    [form]
  );

  const handleSave = async () => {
    if (!form || !order) return;

    const nextOrderId = form.id.trim();
    const cleanedItems = form.items
      .map((item, index) => {
        const rollQty = Math.max(0, Number(item.rollQty) || 0);
        const receivedRollQty = Math.max(0, Number(item.receivedRollQty) || 0);

        return {
          item_id: item.item_id || Date.now() + index,
          fabricId: item.fabricId,
          spec: item.spec,
          rollQty,
          rollLength: Math.max(0, Number(item.rollLength) || 0),
          pricePerRoll: Math.max(0, Number(item.pricePerRoll) || 0),
          receivedRollQty,
        };
      })
      .filter((item) => item.fabricId || item.spec);

    if (!nextOrderId) {
      await showAlert("กรุณากรอกเลขที่ใบสั่งซื้อ");
      return;
    }

    if (!form.supplierId) {
      await showAlert("กรุณาเลือกซัพพลายเออร์");
      return;
    }

    if (cleanedItems.length === 0) {
      await showAlert("กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ");
      return;
    }

    const invalidItem = cleanedItems.find(
      (item) => item.rollQty <= 0 || item.rollLength <= 0 || item.pricePerRoll < 0
    );

    if (invalidItem) {
      await showAlert("กรุณากรอกจำนวนม้วน ความยาวต่อม้วน และราคาต่อม้วนให้ถูกต้อง");
      return;
    }

    const underReceived = cleanedItems.find((item) => item.rollQty < item.receivedRollQty);
    if (underReceived) {
      await showAlert(`รับของไปแล้ว ${underReceived.receivedRollQty} ม้วน จำนวนสั่งต้องไม่น้อยกว่านี้`);
      return;
    }

    const fabricKeys = cleanedItems.map((item) =>
      item.fabricId
        ? `f${item.fabricId}`
        : `s${item.spec.type_id}-${item.spec.category_id}-${item.spec.color_id}`
    );
    if (new Set(fabricKeys).size !== fabricKeys.length) {
      await showAlert("มีผ้าซ้ำกันในใบสั่งซื้อ กรุณารวมเป็นรายการเดียว");
      return;
    }

    const totalReceived = cleanedItems.reduce((sum, item) => sum + item.receivedRollQty, 0);
    const apiStatus = toApiPurchaseOrderStatus(
      totalReceived === 0
        ? "รอสินค้า"
        : totalReceived >= totalRolls
          ? "รับครบแล้ว"
          : "รับบางส่วน"
    );

    const confirmed = await showConfirm("ต้องการบันทึกการแก้ไขใบสั่งซื้อนี้ใช่หรือไม่?", {
      title: "ยืนยันการแก้ไข",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });

    if (!confirmed) return;

    try {
      setSaving(true);

      await editPurchaseOrder(order.po_id, {
        po_code: nextOrderId,
        supplier_id: Number(form.supplierId),
        order_date: form.date,
        status: apiStatus,
        total_amount: totalAmount,
      });

      const originalItems = order.items || [];
      const originalIds = new Set(originalItems.map((item) => Number(item.item_id)));
      const nextIds = new Set(
        cleanedItems
          .filter((item) => originalIds.has(Number(item.item_id)))
          .map((item) => Number(item.item_id))
      );

      for (const item of cleanedItems) {
        const payload = {
          po_id: order.po_id,
          ...(item.fabricId
            ? { fabric_id: Number(item.fabricId) }
            : {
                type_id: item.spec.type_id,
                category_id: item.spec.category_id,
                color_id: item.spec.color_id,
                fabric_name: item.spec.name,
                width_cm: item.spec.width_cm,
              }),
          roll_qty: item.rollQty,
          price_per_roll: item.pricePerRoll,
          roll_length: item.rollLength,
        };

        if (originalIds.has(Number(item.item_id))) {
          await editPurchaseOrderItem(item.item_id, payload);
        } else {
          await addPurchaseOrderItem(payload);
        }
      }

      for (const originalItem of originalItems) {
        if (!nextIds.has(Number(originalItem.item_id))) {
          await deletePurchaseOrderItem(originalItem.item_id);
        }
      }

      await showAlert("บันทึกการแก้ไขเรียบร้อยแล้ว");
      navigate(`/orders/detail/${encodeURIComponent(nextOrderId)}`);
    } catch (error) {
      console.error("แก้ไขใบสั่งซื้อไม่สำเร็จ:", error);
      await showAlert(error?.response?.data?.message || "บันทึกการแก้ไขไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        icon: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!loading && (!order || !form)) {
    return (
      <div className="add-orders-page">
        <div className="add-orders-card">
          <div className="add-orders-section-head">
            <h2>ไม่พบใบสั่งซื้อ</h2>
            <p>รายการนี้อาจถูกลบไปแล้ว หรือยังไม่มีข้อมูลให้แก้ไข</p>
          </div>
          <button className="add-orders-back" onClick={() => navigate("/orders")}>
            <FiArrowLeft /> กลับหน้าจัดซื้อ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-orders-page">
      <div className="add-orders-header">
        <div>
          <h1>แก้ไขใบสั่งซื้อ</h1>
          <p>อัปเดตข้อมูลคำสั่งซื้อและรายการผ้าให้ตรงกับข้อมูลจริงในระบบ</p>
        </div>
      </div>

      <div className="add-orders-layout">
        <div className="add-orders-card">
          <div className="add-orders-section-head">
            <div>
              <h2>ข้อมูลใบสั่งซื้อ</h2>
              <p>แก้ไขเลขที่เอกสาร วันที่ และรายการผ้าภายในใบสั่งซื้อได้จากหน้านี้</p>
            </div>
          </div>

          {loading || !form ? (
            <div className="mu-empty">กำลังโหลดข้อมูล...</div>
          ) : (
            <div className="add-orders-form">
              <div className="add-orders-grid two-columns">
                <div className="add-orders-field">
                  <label>เลขที่ใบสั่งซื้อ</label>
                  <input
                    name="id"
                    value={form.id}
                    onChange={updateForm}
                    placeholder="เช่น PO-2026-001"
                  />
                </div>
                <div className="add-orders-field">
                  <label>วันที่สั่ง</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={updateForm}
                    title="เลือกวันที่สร้างใบสั่งซื้อ"
                  />
                </div>
              </div>

              <div className="add-orders-field">
                <label>ซัพพลายเออร์</label>
                <Select
                  name="supplierId"
                  value={form.supplierId}
                  onChange={updateForm}
                  disabled={hasReceived}
                  title={hasReceived ? "ใบสั่งซื้อนี้รับของแล้ว เปลี่ยนผู้จัดจำหน่ายไม่ได้" : undefined}
                >
                  <option value="">เลือกซัพพลายเออร์</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.supplier_id} value={supplier.supplier_id}>
                      {supplier.supplier_name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="add-orders-grid two-columns">
                <div className="add-orders-field">
                  <label>มูลค่ารวม (บาท)</label>
                  <input
                    type="number"
                    min="0"
                    value={totalAmount}
                    readOnly
                    placeholder="ระบบคำนวณให้อัตโนมัติ"
                  />
                </div>
                <div className="add-orders-field">
                  <label>สถานะ</label>
                  <input
                    value={
                      totalRolls === 0
                        ? "รอสินค้า"
                        : form.items.reduce((sum, item) => sum + Number(item.receivedRollQty || 0), 0) >= totalRolls
                          ? "รับครบแล้ว"
                          : form.items.reduce((sum, item) => sum + Number(item.receivedRollQty || 0), 0) > 0
                            ? "รับบางส่วน"
                            : "รอสินค้า"
                    }
                    readOnly
                    placeholder="ระบบคำนวณจากจำนวนที่รับ"
                  />
                </div>
              </div>

              <div className="add-orders-field">
                <div className="add-orders-items-head">
                  <label>รายการผ้าในใบสั่งซื้อ</label>
                  <button type="button" className="add-orders-item-btn" onClick={addItemRow}>
                    <FiPlus size={16} /> เพิ่มรายการ
                  </button>
                </div>
                <p className="add-orders-helper-text">
                  แก้ไขชนิดผ้า จำนวนม้วน ความยาวต่อม้วน และราคาต่อม้วนได้ทันที
                  (รายการที่รับของแล้ว เปลี่ยนผ้าหรือลบไม่ได้)
                </p>

                <div className="add-orders-items-list">
                  <div className="add-orders-items-columns edit-orders-columns">
                    <span className="add-orders-column-label">ผ้าที่สั่งซื้อ</span>
                    <span className="add-orders-column-label">จำนวนม้วน</span>
                    <span className="add-orders-column-label">เมตร/ม้วน</span>
                    <span className="add-orders-column-label">ราคาต่อม้วน</span>
                    <span className="add-orders-column-label">ลบ</span>
                  </div>
                  {form.items.map((item, index) => (
                    <div key={item.item_id} className="add-orders-item-row edit-orders-item-row">
                      <OrderFabricPicker
                        value={item}
                        onChange={(fabric) => updateItemFabric(item.item_id, fabric)}
                        supplierFabrics={supplierFabrics}
                        masters={masters}
                        onReloadMasters={loadMasters}
                        disabled={!form.supplierId}
                        locked={Number(item.receivedRollQty) > 0}
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.rollQty}
                        onChange={(e) => updateItem(item.item_id, "rollQty", e.target.value)}
                        placeholder="เช่น 10"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.rollLength}
                        onChange={(e) => updateItem(item.item_id, "rollLength", e.target.value)}
                        placeholder="เช่น 25"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.pricePerRoll}
                        onChange={(e) => updateItem(item.item_id, "pricePerRoll", e.target.value)}
                        placeholder="เช่น 4500"
                      />
                      <button
                        type="button"
                        className="add-orders-delete-btn"
                        onClick={() => removeItemRow(item.item_id)}
                        disabled={form.items.length === 1 || Number(item.receivedRollQty) > 0}
                        aria-label={`ลบรายการที่ ${index + 1}`}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="add-orders-summary-card">
          <h3>สรุปคำสั่งซื้อ</h3>

          <div className="add-orders-summary-row">
            <span>เลขที่ใบสั่งซื้อ</span>
            <strong>{form?.id || "-"}</strong>
          </div>

          <div className="add-orders-summary-row">
            <span>จำนวนรายการ</span>
            <strong>{form?.items.length || 0} รายการ</strong>
          </div>

          <div className="add-orders-summary-row">
            <span>จำนวนรวม</span>
            <strong>{totalRolls.toLocaleString()} ม้วน</strong>
          </div>

          <div className="add-orders-summary-row">
            <span>ความยาวรวม</span>
            <strong>{totalLength.toLocaleString()} เมตร</strong>
          </div>

          <div className="add-orders-summary-row">
            <span>มูลค่ารวม</span>
            <strong>฿{totalAmount.toLocaleString()}</strong>
          </div>

          <div className="add-orders-actions">
            <button className="add-orders-save" onClick={handleSave} disabled={saving || loading}>
              <FiCheck size={16} /> {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
            <button className="add-orders-cancel" onClick={() => navigate(-1)} disabled={saving}>
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
