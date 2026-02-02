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
      if (error.response.status === 401) {
        localStorage.clear();
      }
      console.error(
        'API Error:',
        error.response.status,
        error.response.data,
      );
    } else {
      console.error('Network Error:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
