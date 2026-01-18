// src/api/stocksApi.js
// *** ตัดการ fetch PHP ออก เปลี่ยนเป็น mock data โครงสร้างสต็อกต่อไซส์ ***

const MOCK_STOCKS = [
  // สมมติเป็นสต็อกสินค้าตามไซส์ (ใช้บนหน้า Products / อื่น ๆ)
  {
    id: 1,
    product_code: "P001",
    size: "S",
    qty: 1,
  },
  {
    id: 2,
    product_code: "P001",
    size: "M",
    qty: 2,
  },
  {
    id: 3,
    product_code: "P001",
    size: "L",
    qty: 2,
  },
  {
    id: 4,
    product_code: "P002",
    size: "M",
    qty: 1,
  },
  {
    id: 5,
    product_code: "P003",
    size: "FREE",
    qty: 4,
  },
  {
    id: 6,
    product_code: "F001",
    size: "FREE",
    qty: 8,
  },
];

export async function fetchStocks() {
  console.log("✅ ใช้ MOCK_STOCKS แทนการเรียก PHP backend");
  await new Promise((res) => setTimeout(res, 200));
  return MOCK_STOCKS;
}