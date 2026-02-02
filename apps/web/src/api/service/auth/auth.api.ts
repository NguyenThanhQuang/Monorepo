import axios from 'axios';
import type {
  LoginPayload,
  RegisterPayload,
  LoginResponse,
  ForgotPasswordPayload,
} from '@obtp/shared-types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
  withCredentials: true,
});

/* ================= LOGIN ================= */
export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post('/auth/login', payload);
  return data;
}

/* ================= REGISTER ================= */
export async function registerApi(payload: RegisterPayload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

/* ================= FORGOT PASSWORD ================= */
export async function forgotPasswordApi(payload: ForgotPasswordPayload) {
  const { data } = await api.post('/auth/forgot-password', payload);
  return data;
}
export async function loginAdmin(
  payload: LoginPayload
): Promise<LoginResponse> {
  const { data } = await api.post("/auth/login", payload);
  return data;
}
