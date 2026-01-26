// src/features/admin-auth/types.ts
import type { UserRole } from "@obtp/shared-types";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: UserRole[];
    companyId?: string;
  };
}
