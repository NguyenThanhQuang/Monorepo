import { useEffect, useMemo, useState } from "react";
import { companyVehicleApi } from "../services/companyVehicle.api";
import { useAuth } from "../../../contexts/AuthContext"; // Sử dụng AuthContext
import type { Vehicle } from "@obtp/shared-types";
import type { VehiclePayload } from "../types/vehicle.types";

export const useCompanyVehicles = () => {
  const { user } = useAuth(); // Lấy user từ context
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
      const vehiclePayload = { ...payload, companyId };
      
      if (id) {
        await companyVehicleApi.updateVehicle(id, vehiclePayload);
      } else {
        await companyVehicleApi.createVehicle(vehiclePayload);
      }
      setDialogOpen(false);
      fetchVehicles();
    } catch (err: any) {
      setError(err?.message || "Không thể lưu thông tin xe");
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá xe này?')) return;
    
    try {
      await companyVehicleApi.deleteVehicle(id);
      fetchVehicles();
    } catch (err: any) {
      setError(err?.message || "Không thể xoá xe");
    }
  };

  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === "active").length,
      maintenance: vehicles.filter(v => v.status === "maintenance").length,
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