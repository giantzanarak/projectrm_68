export const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3010").replace(/\/+$/, "");
export const IMAGE_BASE = `${API_BASE}/uploads/`;
