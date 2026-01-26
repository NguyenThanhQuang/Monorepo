import { useEffect, useMemo, useState } from 'react';
import type { Vehicle } from '@obtp/shared-types';
import { VehicleStatus } from '@obtp/shared-types';
import { VehiclesApi } from '../../api/service/services/vehicles.api';

export function useVehicleManagementLogic() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    setLoading(true);
    VehiclesApi.getAll()
      .then(setVehicles)
      .finally(() => setLoading(false));
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v =>
      v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [vehicles, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === VehicleStatus.ACTIVE).length,
      maintenance: vehicles.filter(v => v.status === VehicleStatus.MAINTENANCE).length,
      seats: vehicles.reduce((sum, v) => sum + v.totalSeats, 0),
    };
  }, [vehicles]);

  const deleteVehicle = async (id: string) => {
    await VehiclesApi.remove(id);
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  return {
    loading,

    vehicles,
    filteredVehicles,
    stats,

    searchQuery,
    setSearchQuery,

    showAddModal,
    setShowAddModal,

    editingVehicle,
    setEditingVehicle,

    deleteVehicle,
  };
}
