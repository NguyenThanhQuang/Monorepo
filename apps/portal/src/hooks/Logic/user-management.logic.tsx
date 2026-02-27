import { useEffect, useMemo, useState } from 'react';
import type { AdminUserListItem } from '@obtp/shared-types';

import {  UserRole } from '@obtp/shared-types';
import { UsersApi } from '../../api/service/user/user.api';

export function useUserManagementLogic() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    UsersApi.getAllForAdmin()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery);

      const matchesRole =
        filterRole === 'all' || u.roles.includes(filterRole as UserRole);

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && !u.isBanned) ||
        (filterStatus === 'banned' && u.isBanned);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  const toggleBanUser = async (userId: string, isBanned: boolean) => {
    await UsersApi.updateStatus(userId, !isBanned);
    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, isBanned: !isBanned } : u,
      ),
    );
  };

  return {
    users,
    filteredUsers,
    loading,

    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,

    toggleBanUser,
  };
}
