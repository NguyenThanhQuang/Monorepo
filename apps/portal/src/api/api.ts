// src/api/api.ts
import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosResponse,
} from 'axios';

const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
  throw new Error('❌ Missing VITE_API_URL in .env');
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ================= AUTH INTERCEPTOR ================= */
api.interceptors.request.use((config) => {
  // SỬA: Ưu tiên dùng accessToken từ AuthContext
  const accessToken = localStorage.getItem('accessToken');
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('access_token');

  // Ưu tiên theo thứ tự: accessToken -> adminToken -> userToken
  const token = accessToken || adminToken || userToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token being sent:', token.substring(0, 20) + '...'); // Debug log
  } else {
    console.warn('No token found in localStorage');
  }

  return config;
});

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      console.error(
        'API Error:',
        error.response.status,
        error.response.data,
      );
      
      if (error.response.status === 401) {
        console.log('Token expired or invalid - clearing storage');
        localStorage.clear();
        // Có thể redirect về trang login
        // window.location.href = '/login';
      }
    } else {
      console.error('Network Error:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;