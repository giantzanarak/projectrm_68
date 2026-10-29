import axios from "axios";
import { API_BASE } from "./http";

export const currentUserId = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")?.id ?? null;
  } catch {
    return null;
  }
};

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

export const logLogout = () => {
  const id = currentUserId();
  if (id == null) return;
  axios
    .post(`${API_BASE}/activity_logs/logout`, null, { headers: { "X-User-Id": id } })
    .catch(() => {});
};

export const logAction = (action, module, detail) => {
  if (currentUserId() == null) return;
  axios
    .post(`${API_BASE}/activity_logs/action`, { action, module, detail })
    .catch(() => {});
};

export const getActivityLogs = async (params) => {
  const res = await axios.get(`${API_BASE}/activity_logs`, { params });
  return res.data;
};
