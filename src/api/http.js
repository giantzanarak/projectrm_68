/* URL ของ backend อ่านจาก .env (VITE_API_URL) — ตอน deploy ตั้งค่านี้ใน Cloudflare Pages */
export const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3010").replace(/\/+$/, "");
export const IMAGE_BASE = `${API_BASE}/uploads/`;
