// src/api/productsApi.js
// *** ตัดการ fetch PHP ออก เปลี่ยนเป็น mock data ฝั่ง frontend ล้วน ๆ ***

// ข้อมูลสินค้าให้สอดคล้องกับโปรเจคร้านผ้าทอ / ชุดไทย
const MOCK_PRODUCTS = [
  {
    id: 1,
    code: "P001",
    name: "ชุดไทยจักรพรรดิ",
    category: "ชุดไทยให้เช่า",
    base_price: 4500,
    stock_total: 5,
    status: "active",
  },
  {
    id: 2,
    code: "P002",
    name: "ชุดไทยบรมพิมาน",
    category: "ชุดไทยให้เช่า",
    base_price: 5200,
    stock_total: 3,
    status: "active",
  },
  {
    id: 3,
    code: "P003",
    name: "ชุดไทยอมรินทร์",
    category: "ชุดไทยให้เช่า",
    base_price: 4800,
    stock_total: 4,
    status: "active",
  },
  {
    id: 4,
    code: "F001",
    name: "ผ้าซิ่นมัดหมี่สีครามทอง",
    category: "ผ้าซิ่นสำเร็จรูป",
    base_price: 3500,
    stock_total: 8,
    status: "active",
  },
];

// ให้หน้า Products ใช้ฟังก์ชันนี้เหมือนเดิม
export async function fetchProducts() {
  console.log("✅ ใช้ MOCK_PRODUCTS แทนการเรียก PHP backend");
  // จำลองดีเลย์นิดนึง (ไม่บังคับ)
  await new Promise((res) => setTimeout(res, 200));
  return MOCK_PRODUCTS;
}