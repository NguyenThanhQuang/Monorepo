// src/features/system-dashboard/types.ts
export interface SystemDashboardStats {
  totalCompanies: number;
  totalUsers: number;
  totalTrips: number;
  totalRevenue: number;
}

export interface CompanyRow {
  id: string;
  name: string;
  vehicles: number;
  trips: number;
  revenue: string;
  status: 'active' | 'pending' | 'suspended';
  rating: number;
}
