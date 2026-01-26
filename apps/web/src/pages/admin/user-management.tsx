import {
  Search,
  Ban,
  CheckCircle,
  Eye,
  Mail,
  Phone,
} from 'lucide-react';
import { useUserManagementLogic } from '../../hooks/Logic/user-management.logic';
import { useLanguage } from '../../contexts/LanguageContext';

export default function UserManagementPage() {
  const { t } = useLanguage();
  const {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    toggleBanUser,
  } = useUserManagementLogic();

  return (
    <div className="p-6">
      {/* Header */}
      <h2>{t('userManagementTitle')}</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
            placeholder={t('searchByNameEmailPhone')}
          />
        </div>

        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">{t('allRoles')}</option>
          <option value="user">{t('userRole')}</option>
          <option value="driver">{t('driverRole')}</option>
          <option value="company_admin">{t('companyAdminRoleLabel')}</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">{t('allStatus')}</option>
          <option value="active">{t('activeLabel')}</option>
          <option value="banned">{t('bannedStatus')}</option>
        </select>
      </div>

      {/* Table */}
      <table className="w-full">
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>
                <Mail className="inline w-4 h-4" /> {user.email}
                <br />
                <Phone className="inline w-4 h-4" /> {user.phone}
              </td>
              <td>{user.roles.join(', ')}</td>
              <td>{user.isBanned ? t('bannedStatus') : t('activeLabel')}</td>
              <td>
                <button>
                  <Eye />
                </button>
                <button
                  onClick={() => toggleBanUser(user.id, user.isBanned)}
                >
                  {user.isBanned ? <CheckCircle /> : <Ban />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
