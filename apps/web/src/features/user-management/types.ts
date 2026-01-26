// src/features/user-management/types.ts
export type UserStatus = 'active' | 'banned';

export type UserRoleUI = 'user' | 'driver' | 'company-admin';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalTrips: number;
  totalSpent: number;
  status: UserStatus;
  role: UserRoleUI;
}
