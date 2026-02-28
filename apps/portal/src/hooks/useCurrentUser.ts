import type { AuthUserResponse } from "@obtp/shared-types";

export function useCurrentUser(): AuthUserResponse | null {
  try {
    const userStr = localStorage.getItem("authUser");
    if (!userStr) return null;
    return JSON.parse(userStr) as AuthUserResponse;
  } catch {
    return null;
  }
}
