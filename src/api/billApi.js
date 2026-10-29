import axios from "axios";
import { getUsers } from "./fetch_api_superadmin";
import { phoneDigits } from "../utils/phone";

import { API_BASE as API, IMAGE_BASE } from "./http";
export const IMAGE_URL = IMAGE_BASE;

const PAYMENT_METHODS = [
  { id_payment: 1, Payment_type: "เงินสด" },
  { id_payment: 2, Payment_type: "โอนผ่านธนาคาร/QR" },
];

export const toInt = (v) => Math.round(Number(v) || 0);

export const baht = (v) => `฿${toInt(v).toLocaleString("th-TH")}`;

export async function getProducts() {
  const res = await axios.get(`${API}/api/products`);
  return (res.data || []).map((p) => ({
    id: p.id,
    name: p.name,
    price: toInt(p.price),
    cost: toInt(p.cost),
    image: p.image || "",
    category: p.category || "",
    pattern: p.pattern || "",
    lotCode: p.lot_code || "",
    status: p.status || "พร้อมขาย",
    size: p.size || "",
    sizeRanges: p.size_ranges || [],
    stockQty: Number(p.stock_qty) || 0,
  }));
}

export async function getPayments() {
  return PAYMENT_METHODS;
}

export async function getEmployees() {
  const users = await getUsers();
  return (users || []).map((u) => ({
    idEmployee: u.id,
    Emp_first_name: u.name,
    Emp_last_name: "",
  }));
}

export async function getPromotions() {
  const res = await axios.get(`${API}/promotion`);
  return (res.data || []).filter((p) =>
    p.is_usable !== undefined ? p.is_usable : Number(p.is_active) === 1
  );
}

export async function getBills() {
  const res = await axios.get(`${API}/bill`);
  return res.data || [];
}

export function nextBillNo(bills) {
  const today = new Date();
  const prefix = `BILL-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const maxSeq = (bills || []).reduce((max, b) => {
    const match = String(b.Bill_details || "").match(new RegExp(`${prefix}-(\\d+)`));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}-${String(maxSeq + 1).padStart(3, "0")}`;
}

export async function createBill({
  billNo, userId, customerName, customerPhone,
  paymentId, employeeId, promotionId,
  totalAmount, discountAmount, notes, items,
}) {
  const billRes = await axios.post(`${API}/bill`, {
    Bill_details: billNo,
    User_link: userId,
    customer_name: customerName || null,
    customer_phone: phoneDigits(customerPhone) || null,
    Payment_idPayment: paymentId,
    totalAmount,
    discount_amount: discountAmount || 0,
    notes,
  });

  const idBill = billRes.data.idBill;
  const savedBillNo = billRes.data.Bill_details || billNo;

  const results = await Promise.allSettled(
    (items || []).map((it) =>
      axios.post(`${API}/Detailbill`, {
        Bill_idBill: idBill,
        Employee_idEmployee: employeeId,
        Products_idProducts: it.id,
        Promotion_idPromotion: promotionId || null,
        quantity: it.qty,
        unit_price: it.price,
        discount_amount: it.lineDiscount || 0,
      })
    )
  );

  return {
    idBill,
    billNo: savedBillNo,
    savedItems: results.filter((r) => r.status === "fulfilled").map((r) => r.value.data),
    failedItems: results.filter((r) => r.status === "rejected"),
  };
}

export async function getBillDetails() {
  const res = await axios.get(`${API}/Detailbill`);
  return res.data || [];
}

export async function cancelBill(idBill) {
  const res = await axios.put(`${API}/bill/delete/${idBill}`);
  return res.data;
}
