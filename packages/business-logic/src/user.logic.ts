import { SanitizedUserResponse, User } from "@obtp/shared-types";
// Hàm lodash.omit type-safe tự viết hoặc dùng thủ công
// Logic: Chuyển DB Entity (Full fields) -> API Response (Safe fields)

export function sanitizeUser(user: Partial<User> | any): SanitizedUserResponse {
  const obj = typeof user.toObject === "function" ? user.toObject() : user;
  const idStr = obj._id ? obj._id.toString() : obj.id || "";
  const companyIdStr = obj.companyId ? obj.companyId.toString() : undefined;

  return {
    id: idStr,
    _id: idStr,
    email: obj.email,
    name: obj.name,
    phone: obj.phone,
    roles: obj.roles || [],
    companyId: companyIdStr,
    isEmailVerified: !!obj.isEmailVerified,
    isBanned: !!obj.isBanned,
    lastLoginDate: obj.lastLoginDate,
  };
}

/**
 * Logic kiểm tra xem một User có được phép truy cập resource của TargetUser không
 * Logic này tách ra để reuse trong Guard hoặc Service
 */
export function canAccessUserProfile(
  currentUserId: string,
  currentUserRoles: string[],
  targetUserId: string,
): boolean {
  if (currentUserRoles.includes("admin")) return true; // Hardcoded string check or import enum logic if needed inside logic pkg
  return currentUserId === targetUserId;
}
