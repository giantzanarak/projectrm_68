// src/api/productsApi.js
const API_BASE = "http://localhost:8000";

/**
 * ดึงรายการสินค้า
 * อ่านจาก products_get.php แล้ว map ฟิลด์ให้ตรงกับที่หน้า React ใช้
 */
export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products_get.php`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("products_get.php error:", text);
    throw new Error("โหลดข้อมูลผลิตภัณฑ์ไม่สำเร็จ");
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error("JSON parse error:", e);
    throw new Error("โหลดข้อมูลผลิตภัณฑ์ไม่สำเร็จ");
  }

  if (!Array.isArray(data)) {
    console.error("Unexpected data:", data);
    data = [];
  }

  // map column จาก MySQL → โครงสร้างที่หน้า React ใช้
  return data.map((item) => ({
    // PHP alias เป็น id แล้ว ถ้าไม่มีก็ fallback เป็น idProducts
    id: String(item.id ?? item.idProducts ?? ""),
    name: item.name ?? "",
    type: item.category ?? "",            // ประเภท → type
    pattern: item.description ?? "",      // ลาย / รายละเอียด
    width: item.size ?? "",               // ขนาด / ไซส์
    stock: Number(item.stock ?? 0),
    price: Number(item.price ?? 0),
    location: "คลังหลัก",
    status: (item.stock ?? 0) <= 10 ? "ใกล้หมด" : "เพียงพอ",
    image: "/pics/default_fabric.jpg",
  }));
}

/**
 * เพิ่มสินค้าใหม่
 * ใช้กับ AddProductModal
 */
export async function createProduct(product) {
  const payload = {
    category: product.type ?? product.category ?? "",
    name: product.name ?? "",
    size: product.width ?? product.size ?? "",
    price: Number(product.price ?? 0),
    unit: product.unit ?? "ชุด",
    description: product.pattern ?? product.description ?? "",
    fabric_id: product.fabric_id ?? 1,
    stock: Number(product.stock ?? 0),
  };

  const res = await fetch(`${API_BASE}/products_create.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("products_create.php error:", text);
    throw new Error("เพิ่มผลิตภัณฑ์ไม่สำเร็จ");
  }

  // สมมติ PHP คืน { success:true, id: <newId> }
  const data = await res.json().catch(() => ({}));
  return data;
}

/**
 * แก้ไขสินค้า
 */
export async function updateProduct(product) {
  const payload = {
    id: product.id,
    category: product.type ?? product.category ?? "",
    name: product.name ?? "",
    size: product.width ?? product.size ?? "",
    price: Number(product.price ?? 0),
    unit: product.unit ?? "ชุด",
    description: product.pattern ?? product.description ?? "",
    fabric_id: product.fabric_id ?? 1,
    stock: Number(product.stock ?? 0),
  };

  const res = await fetch(`${API_BASE}/products_update.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("products_update.php error:", text);
    throw new Error("แก้ไขผลิตภัณฑ์ไม่สำเร็จ");
  }

  return res.json().catch(() => ({}));
}

/**
 * ลบสินค้า
 */
export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products_delete.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("products_delete.php error:", text);
    throw new Error("ลบผลิตภัณฑ์ไม่สำเร็จ");
  }

  return res.json().catch(() => ({}));
}