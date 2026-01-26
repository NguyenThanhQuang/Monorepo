export interface CompanyUI {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;

  vehicles: number; // tạm 0 nếu backend chưa có
  trips: number;
  rating: number;
  revenue: number;

  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
}
