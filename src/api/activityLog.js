import axios from "axios";
import { API_BASE } from "./http";

/* อ่าน id ผู้ใช้ที่ล็อกอินอยู่ (Login.jsx เก็บไว้ใน localStorage "user") */
export const currentUserId = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")?.id ?? null;
  } catch {
    return null;
  }
};

/* แนบ header X-User-Id ไปกับทุกคำขอ axios ที่ยิงไป backend ของเรา
   server ใช้ค่านี้บันทึกว่า "ใคร" เป็นคนทำรายการใน activity_logs
   (เรียกครั้งเดียวตอนเปิดแอปใน main.jsx) */
/* แนบเฉพาะคำขอที่ไป backend ของเรา (ไม่แนบไปเว็บภายนอก เช่น แผนที่) */
const isOurApi = (url) => url === API_BASE || url.startsWith(`${API_BASE}/`);

export const setupActivityHeader = () => {
  axios.interceptors.request.use((config) => {
    const id = currentUserId();
    if (id != null && isOurApi(String(config.url || ""))) {
      config.headers["X-User-Id"] = id;
    }
    return config;
  });
};

/* แจ้ง server ว่าออกจากระบบ ต้องเรียก "ก่อน" ลบข้อมูลผู้ใช้ออกจาก localStorage
   ใส่ header เองตรง ๆ เพราะ interceptor ทำงานทีหลัง ตอนนั้นข้อมูลอาจถูกลบไปแล้ว */
export const logLogout = () => {
  const id = currentUserId();
  if (id == null) return;
  axios
    .post(`${API_BASE}/activity_logs/logout`, null, { headers: { "X-User-Id": id } })
    .catch(() => {});
};

/* บันทึกการกระทำที่เกิดฝั่งหน้าเว็บอย่างเดียว (server มองไม่เห็น) เช่น สั่งพิมพ์
   ตัวอย่าง: logAction("print", "sales", "พิมพ์ใบเสร็จ บิล B0012") */
export const logAction = (action, module, detail) => {
  if (currentUserId() == null) return;
  axios
    .post(`${API_BASE}/activity_logs/action`, { action, module, detail })
    .catch(() => {});
};

/* ดึงรายการ log สำหรับหน้า "บันทึก" */
export const getActivityLogs = async (params) => {
  const res = await axios.get(`${API_BASE}/activity_logs`, { params });
  return res.data;
};
