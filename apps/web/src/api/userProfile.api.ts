import type {
  UserProfileResponse,
  UpdateUserPayload,
  ChangePasswordPayload,
} from '@obtp/shared-types';
import api from './api';

/**
 * GET /users/me
 * Lấy thông tin user đang đăng nhập
 */
export async function getMyProfile(): Promise<UserProfileResponse> {
  const res = await api.get('/users/me');
  return res.data;
}

/**
 * PATCH /users/me
 * Cập nhật thông tin cá nhân (name, phone)
 */
export async function updateMyProfile(
  payload: UpdateUserPayload,
): Promise<UserProfileResponse> {
  const res = await api.patch('/users/me', payload);
  return res.data;
}

/**
 * PATCH /users/me/change-password
 * Đổi mật khẩu
 */
export async function changeMyPassword(
  payload: ChangePasswordPayload,
): Promise<{ message: string }> {
  const res = await api.patch(
    '/users/me/change-password',
    payload,
  );
  return res.data;
}
