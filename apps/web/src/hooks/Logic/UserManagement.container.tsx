// src/features/user-management/UserManagement.container.tsx
import { useEffect, useMemo, useState } from "react";
import type { SanitizedUserResponse } from "@obtp/shared-types";
import type { UserRow } from "../../features/user-management/types";
import { usersApi } from "../../api/service/user/user.api";
import { UserManagement } from "../../pages/admin/UserManagement";

export function UserManagementContainer() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await usersApi.getAllForAdmin();
        if (!mounted) return;

        setUsers(data.map(mapUserToRow));
      } catch {
        if (mounted) setError("Không thể tải danh sách người dùng");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const banUser = async (userId: string) => {
    const updated = await usersApi.updateStatus(userId, { isBanned: true });
    setUsers(prev =>
      prev.map(u => (u.id === userId ? mapUserToRow(updated) : u)),
    );
  };

  const unbanUser = async (userId: string) => {
    const updated = await usersApi.updateStatus(userId, { isBanned: false });
    setUsers(prev =>
      prev.map(u => (u.id === userId ? mapUserToRow(updated) : u)),
    );
  };

  return (
    <UserManagement
      users={users}
      loading={loading}
      error={error}
      onBan={banUser}
      onUnban={unbanUser}
    />
  );
}

/* ---------------- helpers ---------------- */

function mapUserToRow(user: SanitizedUserResponse): UserRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    joinDate: new Date(user.createdAt).toLocaleDateString("vi-VN"),
    totalTrips: user.totalTrips ?? 0,
    totalSpent: user.totalSpent ?? 0,
    status: user.isBanned ? "banned" : "active",
    role: mapRole(user.roles),
  };
}

function mapRole(roles: string[]): "user" | "driver" | "company-admin" {
  if (roles.includes("COMPANY_ADMIN")) return "company-admin";
  if (roles.includes("DRIVER")) return "driver";
  return "user";
}
