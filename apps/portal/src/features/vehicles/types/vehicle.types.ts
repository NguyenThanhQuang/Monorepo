export type VehicleStatus = "active" | "maintenance" | "inactive";

export interface VehiclePayload {
  vehicleNumber: string;
  type: string;
  totalSeats: number;
  status?: VehicleStatus;
  companyId: string;
}