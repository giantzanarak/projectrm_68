// src/api/fabricApi.js

const BASE_URL = "http://localhost:8000";

export async function fetchFabrics() {
  const res = await fetch(`${BASE_URL}/get_fabrics.php`);

  if (!res.ok) {
    throw new Error("ไม่สามารถโหลดข้อมูล Fabric ได้");
  }

  const data = await res.json();
  console.log("fabrics from API:", data);

  // map key จาก PHP -> ชื่อ field ที่ React ใช้
  return data.map((row) => ({
    id: Number(row.id ?? row.idFabric ?? 0),
    name: row.name ?? row.name_f ?? "",
    width_cm: Number(row.width_cm ?? 0),

    // 👇 สำคัญ: ให้เรียกชื่อตรงกับ JSON ที่ส่งมา
    weight_gm: row.weight_gm ?? "",
    thickness_mm: row.thickness_mm ?? "",

    status: row.status ?? row.status_f ?? "พร้อมใช้",
  }));
}