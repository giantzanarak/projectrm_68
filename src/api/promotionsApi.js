// src/api/promotionsApi.js

const API_BASE = "http://localhost:8000";

// แปลงจากข้อมูลที่ PHP ส่งมา → รูปแบบที่หน้า JSX ใช้
function mapFromServer(row) {
  return {
    id: Number(row.id),
    title: row.code ?? "",
    desc: row.details ?? "",
    discount: Number(row.per_item ?? 0),
    start: row.start ?? "",
    end: row.end ?? "",
    status: row.status ?? "เปิดใช้งาน",
  };
}

// =========================
//  ดึงโปรโมชั่นทั้งหมด
// =========================
export async function fetchPromotions() {
  const res = await fetch(`${API_BASE}/promotions_get.php`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("โหลดโปรโมชั่นไม่สำเร็จ");
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.map(mapFromServer);
}

// =========================
//  เพิ่มโปรโมชั่นใหม่
// =========================
export async function createPromotion(payload) {
  const body = {
    details: payload.desc || "",
    code: payload.title || "",
    per_item: payload.discount || 0,
    start: payload.start || "",
    end: payload.end || "",
    status: payload.status || "เปิดใช้งาน",
  };

  const res = await fetch(`${API_BASE}/promotions_create.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("เพิ่มโปรโมชั่นไม่สำเร็จ");
  }

  const data = await res.json();
  return mapFromServer(data);
}

// =========================
//  แก้ไขโปรโมชั่น
// =========================
export async function updatePromotion(payload) {
  const body = {
    id: payload.id,
    details: payload.desc || "",
    code: payload.title || "",
    per_item: payload.discount || 0,
    start: payload.start || "",
    end: payload.end || "",
    status: payload.status || "เปิดใช้งาน",
  };

  const res = await fetch(`${API_BASE}/promotions_update.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("แก้ไขโปรโมชั่นไม่สำเร็จ");
  }

  const data = await res.json();
  return mapFromServer(data);
}

// =========================
//  ลบโปรโมชั่น  (แก้ตรงนี้สำคัญสุด)
// =========================
export async function deletePromotion(id) {
  // ใช้ FormData เพื่อให้ PHP เห็นเป็น $_POST['id']
  const formData = new FormData();
  formData.append("id", String(id));

  const res = await fetch(`${API_BASE}/promotions_delete.php`, {
    method: "POST",
    body: formData,        // **ไม่มี headers Content-Type** ให้ browser จัดการเอง
  });

  if (!res.ok) {
    throw new Error("ลบโปรโมชั่นไม่สำเร็จ");
  }

  // จะ return true เฉย ๆ ก็พอ หน้า JSX ใช้แค่ลบออกจาก state
  return true;
}