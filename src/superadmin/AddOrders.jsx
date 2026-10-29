import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiCheck, FiPlus, FiPlusCircle, FiTrash2 } from "react-icons/fi";
import { useDialog } from "../context/DialogContext";
import {
  addPurchaseOrder,
  addPurchaseOrderItem,
  deletePurchaseOrder,
  getCategories,
  getColors,
  getFabricTypes,
  getPurchaseOrdersDetailed,
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
});

const formatDateInput = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const withSupplier = (form, supplierId) =>
  supplierId === form.supplierId
    ? form
    : {
        ...form,
        supplierId,
        items: form.items.map((item) => ({ ...item, fabricId: "", fabricName: "", spec: null })),
      };

export default function AddOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert, showConfirm } = useDialog();
  const fallbackDate = location.state?.defaultDate || formatDateInput();

  const [suppliers, setSuppliers] = useState([]);
  const [supplierFabrics, setSupplierFabrics] = useState([]);
  const [masters, setMasters] = useState({ type: [], pattern: [], color: [] });
  const [existingOrders, setExistingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() => {
    const draft = location.state?.draftForm;
    const newSupplierId = location.state?.newSupplierId;
    const base = draft || {
      id: location.state?.nextOrderId || "",
      date: fallbackDate,
      supplierId: "",
      items: [createEmptyItem()],
    };
    return newSupplierId ? withSupplier(base, String(newSupplierId)) : base;
  });

  const goAddSupplier = () => {
    navigate("/Supplier/add", {
      state: {
        returnTo: "/orders/add",
        returnState: { ...location.state, newSupplierId: undefined, draftForm: form },
      },
    });
  };

  const loadMasters = async () => {
    const [types, patterns, colors] = await Promise.all([
      getFabricTypes(),
      getCategories(),
      getColors(),
    ]);
    setMasters({ type: types || [], pattern: patterns || [], color: colors || [] });
  };

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setLoading(true);
        const [supplierData, orderData] = await Promise.all([
          getSuppliers(),
          getPurchaseOrdersDetailed(),
          loadMasters(),
        ]);

        setSuppliers(supplierData || []);
        setExistingOrders(orderData || []);
      } catch (error) {
        console.error("โหลดข้อมูลสำหรับสร้างใบสั่งซื้อไม่สำเร็จ:", error);
        await showAlert(error?.response?.data?.message || "โหลดข้อมูลไม่สำเร็จ", {
          title: "เกิดข้อผิดพลาด",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDependencies();
  }, []);

  useEffect(() => {
    setSupplierFabrics([]);
    if (!form.supplierId) return;

    let cancelled = false;
    getSupplierFabrics(form.supplierId)
      .then((rows) => { if (!cancelled) setSupplierFabrics(rows || []); })
      .catch((err) => console.error("โหลดผ้าของผู้จัดจำหน่ายไม่สำเร็จ:", err));
    return () => { cancelled = true; };
  }, [form.supplierId]);

  const updateForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => (name === "supplierId" ? withSupplier(prev, value) : { ...prev, [name]: value }));
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
      items: prev.items.map((item) =>
        item.item_id !== itemId
          ? item
          : {
              ...item,
              [field]:
                ["rollQty", "rollLength", "pricePerRoll"].includes(field)
                  ? Math.max(0, Number(value) || 0)
                  : value,
            }
      ),
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
    () => form.items.reduce((sum, item) => sum + Number(item.rollQty || 0), 0),
    [form.items]
  );

  const totalLength = useMemo(
    () =>
      form.items.reduce(
        (sum, item) => sum + Number(item.rollQty || 0) * Number(item.rollLength || 0),
        0
      ),
    [form.items]
  );

  const totalAmount = useMemo(
    () =>
      form.items.reduce(
        (sum, item) => sum + Number(item.rollQty || 0) * Number(item.pricePerRoll || 0),
        0
      ),
    [form.items]
  );

  const handleSave = async () => {
    const orderId = form.id.trim();
    const cleanedItems = form.items
      .map((item, index) => {
        const rollQty = Math.max(0, Number(item.rollQty) || 0);

        return {
          item_id: item.item_id || Date.now() + index,
          fabricId: item.fabricId,
          spec: item.spec,
          rollQty,
          rollLength: Math.max(0, Number(item.rollLength) || 0),
          pricePerRoll: Math.max(0, Number(item.pricePerRoll) || 0),
        };
      })
      .filter((item) => item.fabricId || item.spec);

    if (!orderId) {
      await showAlert("กรุณากรอกเลขที่ใบสั่งซื้อ");
      return;
    }

    if (!form.supplierId) {
      await showAlert("กรุณาเลือกผู้จัดจำหน่าย");
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

    const fabricKeys = cleanedItems.map((item) =>
      item.fabricId
        ? `f${item.fabricId}`
        : `s${item.spec.type_id}-${item.spec.category_id}-${item.spec.color_id}`
    );
    if (new Set(fabricKeys).size !== fabricKeys.length) {
      await showAlert("มีผ้าซ้ำกันในใบสั่งซื้อ กรุณารวมเป็นรายการเดียว");
      return;
    }

    const hasDuplicate = existingOrders.some(
      (order) => String(order.id || "").trim().toLowerCase() === orderId.toLowerCase()
    );

    if (hasDuplicate) {
      await showAlert("เลขที่ใบสั่งซื้อนี้มีอยู่แล้ว");
      return;
    }

    const apiStatus = toApiPurchaseOrderStatus("รอสินค้า");

    const confirmed = await showConfirm("ต้องการบันทึกใบสั่งซื้อนี้ใช่หรือไม่?", {
      title: "ยืนยันการบันทึก",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });

    if (!confirmed) return;

    let createdPoId = null;

    try {
      setSaving(true);

      const createdOrder = await addPurchaseOrder({
        po_code: orderId,
        supplier_id: Number(form.supplierId),
        order_date: form.date,
        status: apiStatus,
        total_amount: totalAmount,
      });

      createdPoId = createdOrder.po_id;

      for (const item of cleanedItems) {
        await addPurchaseOrderItem({
          po_id: createdPoId,
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
          received_roll_qty: 0,
        });
      }

      await showAlert("บันทึกใบสั่งซื้อเรียบร้อยแล้ว");
      navigate("/orders");
    } catch (error) {
      console.error("บันทึกใบสั่งซื้อไม่สำเร็จ:", error);

      if (createdPoId) {
        try {
          await deletePurchaseOrder(createdPoId);
        } catch (rollbackError) {
          console.error("rollback purchase order ไม่สำเร็จ:", rollbackError);
        }
      }

      await showAlert(error?.response?.data?.message || "บันทึกใบสั่งซื้อไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        icon: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-orders-page">
      <div className="add-orders-header">
        <div>
          <h1>เพิ่มใบสั่งซื้อ</h1>
          <p>บันทึกใบสั่งซื้อ พร้อมรายการผ้าแต่ละชนิดในคำสั่งซื้อ</p>
        </div>
      </div>

      <div className="add-orders-layout">
        <div className="add-orders-card">
          <div className="add-orders-section-head">
            <div>
              <h2>ข้อมูลใบสั่งซื้อ</h2>
              <p>เลือกผู้จัดจำหน่าย กรอกเลขที่เอกสาร และเพิ่มรายการผ้าให้ครบก่อนบันทึก</p>
            </div>
          </div>

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
              <div className="add-orders-label-row">
                <label>ผู้จัดจำหน่าย</label>
                <button type="button" className="add-orders-text-action" onClick={goAddSupplier}>
                  <FiPlusCircle /> เพิ่มใหม่
                </button>
              </div>
              <Select name="supplierId" value={form.supplierId} onChange={updateForm}>
                <option value="">เลือกผู้จัดจำหน่าย</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>
                    {supplier.supplier_name}
                  </option>
                ))}
              </Select>
            </div>

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
              <div className="add-orders-items-head">
                <label>รายการผ้าในใบสั่งซื้อ</label>
                <button type="button" className="add-orders-item-btn" onClick={addItemRow}>
                  <FiPlus size={16} /> เพิ่มรายการ
                </button>
              </div>

              <div className="add-orders-items-list">
                <div className="add-orders-items-columns create-orders-columns">
                  <span className="add-orders-column-label">ผ้าที่สั่งซื้อ</span>
                  <span className="add-orders-column-label">จำนวนม้วน</span>
                  <span className="add-orders-column-label">เมตร/ม้วน</span>
                  <span className="add-orders-column-label">ราคาต่อม้วน</span>
                  <span className="add-orders-column-label">ลบ</span>
                </div>
                {form.items.map((item, index) => (
                  <div key={item.item_id} className="add-orders-item-row create-orders-item-row">
                    <OrderFabricPicker
                      value={item}
                      onChange={(fabric) => updateItemFabric(item.item_id, fabric)}
                      supplierFabrics={supplierFabrics}
                      masters={masters}
                      onReloadMasters={loadMasters}
                      disabled={loading || !form.supplierId}
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
                      disabled={form.items.length === 1}
                      aria-label={`ลบรายการที่ ${index + 1}`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="add-orders-summary-card">
          <h3>สรุปคำสั่งซื้อ</h3>

          <div className="add-orders-summary-row">
            <span>เลขที่ใบสั่งซื้อ</span>
            <strong>{form.id || "-"}</strong>
          </div>

          <div className="add-orders-summary-row">
            <span>จำนวนรายการ</span>
            <strong>{form.items.length} รายการ</strong>
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
            <strong>{totalAmount.toLocaleString()} บาท</strong>
          </div>

          <div className="add-orders-actions">
            <button className="add-orders-save" onClick={handleSave} disabled={saving || loading}>
              <FiCheck size={16} /> {saving ? "กำลังบันทึก..." : "บันทึกใบสั่งซื้อ"}
            </button>
            <button className="add-orders-cancel" onClick={() => navigate("/orders")} disabled={saving}>
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
