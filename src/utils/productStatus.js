export const STATUS_CUTTING = "กำลังตัด";

export const SALE_STATUSES = ["พร้อมขาย", STATUS_CUTTING, "ไม่พร้อมขาย", "ขายหมด"];

export const SOURCE_LABELS = {
  made: "ร้านตัดเอง",
  resale: "รับมาขาย",
};

export function saleStatusOf(status, stockQty) {
  if (status === STATUS_CUTTING) return STATUS_CUTTING;
  if (stockQty !== null && stockQty !== undefined && Number(stockQty) <= 0) return "ขายหมด";
  return status === "ไม่พร้อมขาย" ? "ไม่พร้อมขาย" : "พร้อมขาย";
}
