// src/api/fabricTypesApi.js
import { BASE_URL } from "./config";

export async function fetchFabricTypes() {
  const res = await fetch(`${BASE_URL}/get_fabric_types.php`);
  if (!res.ok) {
    throw new Error("โหลดประเภทผ้าไม่สำเร็จ");
  }
  const data = await res.json();
  console.log("fabric types from API:", data);
  return Array.isArray(data) ? data : [];
}