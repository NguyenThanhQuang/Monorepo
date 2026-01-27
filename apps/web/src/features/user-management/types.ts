import { UserAccountStatus, UserRole } from "@obtp/shared-types";

export type UserRoleUI = UserRole | "driver";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalTrips: number;
  totalSpent: number;
  status: UserAccountStatus;
  role: UserRoleUI;
}
