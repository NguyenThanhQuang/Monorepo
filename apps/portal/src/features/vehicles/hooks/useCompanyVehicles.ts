import { useEffect, useMemo, useState } from "react";
import { companyVehicleApi } from "../services/companyVehicle.api";
import { useAuth } from "../../../contexts/AuthContext";
import type { Vehicle } from "@obtp/shared-types";
import type { VehiclePayload } from "../types/vehicle.types";

export const useCompanyVehicles = () => {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    if (!companyId) return;
    try {
      const res = await companyVehicleApi.getVehicles(companyId);
      setVehicles(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Load vehicles failed");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [companyId]);

  const saveVehicle = async (payload: VehiclePayload, id?: string) => {
    try {
      if (id) {
        await companyVehicleApi.updateVehicle(id, payload);
      } else {
        await companyVehicleApi.createVehicle(payload);
      }
      setDialogOpen(false);
      fetchVehicles();
    } catch (err: any) {
      setError(err?.response?.data?.message);
    }
  };

  const deleteVehicle = async (id: string) => {
    await companyVehicleApi.deleteVehicle(id);
    fetchVehicles();
  };

  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === "active").length,
      maintenance: vehicles.filter(v => v.status === "maintenance").length,
      totalSeats: vehicles.reduce((sum, v) => sum + v.totalSeats, 0),
    };
  }, [vehicles]);

  return {
    vehicles,
    stats,
    dialogOpen,
    editingVehicle,
    setDialogOpen,
    setEditingVehicle,
    saveVehicle,
    deleteVehicle,
    error,
    companyId,
  };
};
