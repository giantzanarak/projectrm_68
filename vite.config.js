import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // กำหนดพอร์ตที่ต้องการ
    hmr: true, // เปิดใช้งาน HMR (Hot Module Replacement)
  },
});
