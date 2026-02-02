import axios from 'axios';
import type {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
} from 'axios';

/* =========================
   ENV
========================= */

// Vite
const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
  throw new Error('❌ Missing VITE_API_URL in .env');
}

/* =========================
   AXIOS INSTANCE
========================= */

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        localStorage.removeItem('access_token');
        // window.location.href = '/login';
      }

      console.error('API Error:', status, error.response.data);
    } else {
      console.error('Network Error:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
