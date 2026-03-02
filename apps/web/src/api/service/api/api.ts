// src/api/service/trips/trips.api.ts
import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosResponse,
} from 'axios';

/* ================= BASE URL ================= */

const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
  throw new Error('❌ Missing VITE_API_URL in .env');
}

/* ================= AXIOS INSTANCE ================= */

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('access_token');
  const token = adminToken || userToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
        localStorage.clear();
        window.location.href = '/login';
      }

      if (error.response.status === 500) {
        console.error('Server Error Details:', {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          data: error.config?.data,
          responseData: error.response.data
        });
      }
    } else {
      console.error('Network Error:', error.message);
    }

    return Promise.reject(error);
  },
);

/* ================= VALIDATION FUNCTIONS ================= */



export default api;