import axios from "axios";
import { useAuthStore } from "./auth/auth-store";

// Lấy base URL từ biến môi trường hoặc fallback
const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api/v1";

export const portalClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Gắn token từ Zustand
portalClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Tự động logout nếu 401
portalClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login"; // Force redirect về login
    }
    return Promise.reject(error);
  },
);
