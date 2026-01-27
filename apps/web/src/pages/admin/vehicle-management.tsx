import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { VehicleStatus } from '@obtp/shared-types';
import { useVehicleManagementLogic } from '../../hooks/Logic/vehicle-management.logic';
import { useLanguage } from '../../contexts/LanguageContext';

export default function VehicleManagementPage() {
  const { t } = useLanguage();
  const {
    filteredVehicles,
    stats,
    searchQuery,
    setSearchQuery,
    setEditingVehicle,
    setShowAddModal,
    deleteVehicle,
  } = useVehicleManagementLogic();

  const statusConfig = {
    [VehicleStatus.ACTIVE]: { label: t('active'), color: 'bg-green-500' },
    [VehicleStatus.MAINTENANCE]: { label: t('maintenance'), color: 'bg-yellow-500' },
    [VehicleStatus.INACTIVE]: { label: t('inactive'), color: 'bg-red-500' },
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h2>{t('vehicleManagementTitle')}</h2>
        <button onClick={() => setShowAddModal(true)}>
          <Plus /> {t('addNewVehicle')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>{stats.total}</div>
        <div>{stats.active}</div>
        <div>{stats.maintenance}</div>
        <div>{stats.seats}</div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Search />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t('searchVehicle')}
        />
      </div>

      {/* Table */}
      <table className="w-full">
        <tbody>
          {filteredVehicles.map(v => {
            const status = statusConfig[v.status];
            return (
              <tr key={v.id}>
                <td>{v.vehicleNumber}</td>
                <td>{v.type}</td>
                <td>{v.totalSeats}</td> 
                <td>
                  <span className={status.color} /> {status.label}
                </td>
                <td>
                  <button onClick={() => setEditingVehicle(v)}>
                    <Edit2 />
                  </button>
                  <button onClick={() => deleteVehicle(v.id)}>
                    <Trash2 />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
