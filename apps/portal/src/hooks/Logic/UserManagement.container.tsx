import { useEffect, useMemo, useState } from "react";
import {  UserRole, type UserRow } from "@obtp/shared-types";
import { UserManagementView } from "../../pages/admin/UserManagement";
export declare enum UserAccountStatus {
    ACTIVE = "active",
    BANNED = "banned",
    UNVERIFIED = "unverified"
}
export function UserManagementContainer() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"all" | UserRole>("all");
  const [status, setStatus] = useState<"all" | UserAccountStatus>("all");

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // TODO: replace bằng API thật
        const data: UserRow[] = [];
        setUsers(data);
      } catch (e) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /* ================= FILTER ================= */
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();

    return users.filter(u => {
      const matchSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q);

      const matchRole = role === "all" || u.role === role;
      const matchStatus = status === "all" || u.status === status;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, role, status]);

  /* ================= ACTIONS ================= */
  const handleBan = (id: string) => {
    // TODO: call API
    setUsers(prev =>
      prev.map(u =>
        u.id === id ? { ...u, status: UserAccountStatus.BANNED } : u
      )
    );
  };

  const handleUnban = (id: string) => {
    // TODO: call API
    setUsers(prev =>
      prev.map(u =>
        u.id === id ? { ...u, status: UserAccountStatus.ACTIVE } : u
      )
    );
  };

  return (
    <UserManagementView
      users={filteredUsers}
      loading={loading}
      error={error}
      search={search}
      role={role}
      status={status}
      onSearchChange={setSearch}
      onRoleChange={setRole}
      onStatusChange={setStatus}
      onBan={handleBan}
      onUnban={handleUnban}
      totalUsers={users.length}
      totalActive={users.filter(u => u.status === UserAccountStatus.ACTIVE).length}
      totalBanned={users.filter(u => u.status === UserAccountStatus.BANNED).length}
      totalTrips={users.reduce((s, u) => s + u.totalTrips, 0)}
    />
  );
}
