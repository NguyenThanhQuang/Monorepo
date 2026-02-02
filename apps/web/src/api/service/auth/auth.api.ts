import axios from 'axios';
import type {
  LoginPayload,
  RegisterPayload,
  LoginResponse,
  ForgotPasswordPayload,
  ApiResponse,
} from '@obtp/shared-types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
  withCredentials: true,
});

/* ================= LOGIN ================= */
export const loginApi = (payload: {
  identifier: string;
  password: string;
}) => {
  return api.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    payload,
  );
};
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
