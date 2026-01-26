// src/features/user-management/UserManagement.tsx
import { Search, Ban, CheckCircle, Eye, Mail, Phone } from "lucide-react";
import { useState, useMemo } from "react";
import type { UserRow } from "../../features/user-management/types";
import { useLanguage } from "../../contexts/LanguageContext";

interface Props {
  users: UserRow[];
  loading: boolean;
  error: string | null;
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
}

export function UserManagement({
  users,
  loading,
  error,
  onBan,
  onUnban,
}: Props) {
  const { t, language } = useLanguage();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      return (
        (u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q)) &&
        (role === "all" || u.role === role) &&
        (status === "all" || u.status === status)
      );
    });
  }, [users, search, role, status]);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US").format(v) +
    (language === "vi" ? "đ" : " VND");

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  /* ----- UI giữ nguyên 95% code bạn gửi ----- */
  return (
    <div className="p-6">
      {/* table + filter + buttons */}
      {filteredUsers.map(user => (
        <div key={user.id}>
          {user.name}
          {user.status === "active" ? (
            <button onClick={() => onBan(user.id)}>
              <Ban />
            </button>
          ) : (
            <button onClick={() => onUnban(user.id)}>
              <CheckCircle />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
