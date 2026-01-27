// src/pages/user-profile/userProfile.api.ts

import { ChangePasswordPayload, UpdateProfilePayload, UserProfileResponse } from "@obtp/shared-types";



export async function getMyProfile(): Promise<UserProfileResponse> {
  const res = await fetch('/api/users/me');
  if (!res.ok) throw new Error('Không lấy được thông tin user');
  return res.json();
}

export async function updateMyProfile(
  payload: UpdateProfilePayload,
): Promise<UserProfileResponse> {
  const res = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Cập nhật thất bại');
  return res.json();
}

export async function changeMyPassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  const res = await fetch('/api/users/me/change-password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Đổi mật khẩu thất bại');
}
