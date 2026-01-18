// src/api/fabricApi.js
// *** ตัดการ fetch PHP ออก เปลี่ยนเป็น mock data สำหรับผ้าผืน ***

const MOCK_FABRICS = [
  {
    id: 1,
    code: "FAB001",
    name: "ผ้าไหมลายดอก สีฟ้า",
    type: "ผ้าไหม",
    width_cm: 100,
    price_per_m: 850,
    stock_m: 120,
  },
  {
    id: 2,
    code: "FAB002",
    name: "ผ้าย้อมครามลายขาว",
    type: "ผ้าฝ้ายย้อมคราม",
    width_cm: 90,
    price_per_m: 450,
    stock_m: 80,
  },
  {
    id: 3,
    code: "FAB003",
    name: "ผ้าขิดโบราณ สีแดงทอง",
    type: "ผ้าขิด",
    width_cm: 100,
    price_per_m: 650,
    stock_m: 60,
  },
];

export async function fetchFabrics() {
  console.log("✅ ใช้ MOCK_FABRICS แทนการเรียก PHP backend");
  await new Promise((res) => setTimeout(res, 200));
  return MOCK_FABRICS;
}