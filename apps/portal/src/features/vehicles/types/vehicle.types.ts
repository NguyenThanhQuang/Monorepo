export type VehicleStatus = "active" | "maintenance" | "inactive";

export interface Vehicle {
  _id: string;
  companyId: string;
  licensePlate: string;
  vehicleType: string;
  brand: string;
  seatCount: number;
  manufactureYear: number;
  lastMaintenanceDate?: string;
  status: VehicleStatus;
}

export interface VehiclePayload {
  licensePlate: string;
  vehicleType: string;
  brand: string;
  seatCount: number;
  manufactureYear: number;
  lastMaintenanceDate?: string;
  status?: VehicleStatus;
}
