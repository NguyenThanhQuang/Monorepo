import api from '../../api';

export interface DashboardStatsResponse {
  totalTrips: number;
  activeVehicles: number;
  todayPassengers: number;
  revenue: number;
}

export interface DashboardTripResponse {
  id: string;
  routeName: string;
  departureDate: string;
  departureTime: string;
  vehicleNumber: string;
  bookedSeats: number;
  totalSeats: number;
  status: 'running' | 'aboutToDepart' | 'completed' | 'cancelled';
}

export const CompanyDashboardApi = {
  getStats(): Promise<DashboardStatsResponse> {
    return api.get('/admin/dashboard/stats').then(res => res.data);
  },

  getTrips(): Promise<DashboardTripResponse[]> {
    return api.get('/admin/dashboard/trips').then(res => res.data);
  },
};
