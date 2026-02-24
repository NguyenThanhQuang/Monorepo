// src/features/vehicles/hooks/useCompanyVehicles.ts
import { useEffect, useMemo, useState } from "react";
import { companyVehicleApi } from "../services/companyVehicle.api";
import { useAuth } from "../../../../../admin/src/contexts/AuthContext";
import type { Vehicle } from "@obtp/shared-types";
import { VehicleStatus } from "@obtp/shared-types";
import type { VehiclePayload } from "../types/vehicle.types";

export const useCompanyVehicles = () => {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchVehicles = async () => {
    if (!companyId) {
      setError("Không tìm thấy thông tin công ty");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await companyVehicleApi.getVehicles(companyId);
      setVehicles(data || []);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchVehicles();
    }
  }, [companyId]);

  const saveVehicle = async (payload: VehiclePayload, id?: string) => {
    try {
      if (!companyId) {
        setError("Không tìm thấy thông tin công ty");
        return;
      }

      // Đảm bảo có companyId trong payload
      const vehiclePayload = { 
        ...payload, 
        companyId,
        // Đảm bảo các trường bắt buộc có giá trị hợp lệ
        floors: payload.floors || 1,
        seatColumns: payload.seatColumns || 4,
        seatRows: payload.seatRows || 11,
        aislePositions: payload.aislePositions || [2]
      };
      
      if (id) {
        await companyVehicleApi.updateVehicle(id, vehiclePayload);
      } else {
        await companyVehicleApi.createVehicle(vehiclePayload);
      }
      setDialogOpen(false);
      setEditingVehicle(null);
      await fetchVehicles();
    } catch (err: any) {
      setError(err?.message || "Không thể lưu thông tin xe");
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá xe này?')) return;
    
    try {
      await companyVehicleApi.deleteVehicle(id);
      await fetchVehicles();
    } catch (err: any) {
      setError(err?.message || "Không thể xoá xe");
    }
  };

  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === VehicleStatus.ACTIVE).length,
      maintenance: vehicles.filter(v => v.status === VehicleStatus.MAINTENANCE).length,
      totalSeats: vehicles.reduce((sum, v) => sum + (v.totalSeats || 0), 0),
    };
  }, [vehicles]);

  return {
    vehicles,
    stats,
    dialogOpen,
    editingVehicle,
    error,
    loading,
    companyId,
    setDialogOpen,
    setEditingVehicle,
    saveVehicle,
    deleteVehicle,
    fetchVehicles,
  };
};