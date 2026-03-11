import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const fullUrl = `${config.baseURL || ""}${url}`;

    // ✅ admin api: /admin/...
    const isAdminApi = url.startsWith("/admin") || fullUrl.includes("/admin");

    const token = isAdminApi
      ? localStorage.getItem("admin_token")
      : localStorage.getItem("token");

    if (!config.headers) config.headers = {};

    // ✅ สำคัญมาก: ต้องเป็น backtick
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;