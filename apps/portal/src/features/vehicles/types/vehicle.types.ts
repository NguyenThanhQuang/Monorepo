import type { VehicleStatus } from "@obtp/shared-types";
export { VehicleStatus } from "@obtp/shared-types";

export interface VehiclePayload {
  companyId: string;
  vehicleNumber: string;
  type: string;
  status: VehicleStatus;
  description?: string;
  floors: number;
  seatColumns: number;
  seatRows: number;
  aislePositions: number[];
}