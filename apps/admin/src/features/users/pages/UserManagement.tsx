import { useState, useMemo } from "react";
import {
  Search,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  RefreshCw,
  Users as UsersIcon,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { UserRole } from "@obtp/shared-types";
import { formatCurrency, formatNumber } from "@obtp/business-logic";
import { useUsers } from "../hooks/useUsers";
import { useLanguage } from "@/contexts/LanguageContext";

export function UserManagement() {
  const { t } = useLanguage();

  const {
    data: users = [],
    isLoading,
    error,
    refetch,
    isRefetching,
    toggleBanStatus,
    isMutating,
  } = useUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone?.includes(q);

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && !user.isBanned) ||
        (filterStatus === "banned" && user.isBanned);

      let matchesRole = true;
      if (filterRole !== "all") {
        if (filterRole === UserRole.USER) {
          matchesRole =
            user.roles.includes(UserRole.USER) && user.roles.length === 1;
        } else {
          matchesRole = user.roles.includes(filterRole as UserRole);
        }
      }

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => !u.isBanned).length,
      banned: users.filter((u) => u.isBanned).length,
    }),
    [users],
  );

  const getRoleLabel = (roles: UserRole[]) => {
    if (roles.includes(UserRole.ADMIN)) return t("systemAdmin");
    if (roles.includes(UserRole.COMPANY_ADMIN))
      return t("companyAdminRoleLabel");
    if (roles.includes(UserRole.STAFF)) return t("staffRole");
    return t("userRole");
  };

  const getRoleBadgeColor = (roles: UserRole[]) => {
    if (roles.includes(UserRole.ADMIN))
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    if (roles.includes(UserRole.COMPANY_ADMIN))
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-red-50/50 rounded-3xl border border-red-100">
        <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
        <p className="text-gray-600 mb-4 font-bold">{t("fetchUsersError")}</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 font-bold uppercase"
        >
          {t("retry")}
        </button>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("userManagement")}
          </h1>
          <p className="text-gray-500 mt-1">{t("userManagementDesc")}</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-2.5 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-600 ${isRefetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm shadow-blue-500/10">
            <UsersIcon />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase">
              {t("total")}
            </p>
            <p className="text-2xl font-black dark:text-white">
              {formatNumber(stats.total)}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shadow-sm shadow-green-500/10">
            <CheckCircle />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase">
              {t("active")}
            </p>
            <p className="text-2xl font-black text-green-600">
              {formatNumber(stats.active)}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm shadow-red-500/10">
            <Ban />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase">
              {t("suspended")}
            </p>
            <p className="text-2xl font-black text-red-600">
              {formatNumber(stats.banned)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder={t("searchUsers")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page
            }}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-600 
                bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            setCurrentPage(1); // Reset page
          }}
          className="h-11 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="all">
            {t("role")}: {t("all")}
          </option>
          <option value={UserRole.USER}>{t("userRole")}</option>
          <option value={UserRole.COMPANY_ADMIN}>
            {t("companyAdminRoleLabel")}
          </option>
          <option value={UserRole.ADMIN}>Super Admin</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1); // Reset page
          }}
          className="h-11 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="all">
            {t("status")}: {t("all")}
          </option>
          <option value="active">{t("active")}</option>
          <option value="banned">{t("suspended")}</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700 shadow-sm">
        {paginatedUsers.length === 0 ? (
          <div className="p-20 text-center text-gray-400 font-black uppercase tracking-widest italic italic">
            {t("noUsersFound")}
          </div>
        ) : (
          paginatedUsers.map((user) => (
            <div
              key={user.id}
              className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-md shadow-blue-500/20">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-gray-900 dark:text-white text-lg">
                      {user.name}
                    </h4>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${getRoleBadgeColor(user.roles)}`}
                    >
                      {getRoleLabel(user.roles)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {user.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden lg:block">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
                    {t("totalSpent")}
                  </p>
                  <p className="font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(user.totalSpent || 0)}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-tighter ${user.isBanned ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-600"}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${user.isBanned ? "bg-red-500" : "bg-green-500"} animate-pulse`}
                  />
                  {user.isBanned ? t("suspended") : t("active")}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      toggleBanStatus({
                        userId: user.id,
                        isBanned: !user.isBanned,
                      })
                    }
                    disabled={isMutating}
                    className={`p-2.5 rounded-xl border transition-all ${
                      user.isBanned
                        ? "text-green-600 border-green-200 hover:bg-green-100 shadow-sm shadow-green-500/10"
                        : "text-red-600 border-red-200 hover:bg-red-100 shadow-sm shadow-red-500/10"
                    } disabled:opacity-50`}
                  >
                    {user.isBanned ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Ban className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        {/* Pagination Controls */}
        {filteredUsers.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}