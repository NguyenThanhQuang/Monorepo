import type { CompanyStatsResponse } from '@obtp/shared-types';
import type { CompanyUI } from '../../features/companyManagement/types';
import { mapCompanyStatusToUI } from './mapCompanyStatusToUI';

export function mapCompanyStatsToUI(
  api: CompanyStatsResponse
): CompanyUI {
  return {
    id: api.id,
    name: api.name,
    email: api.email,
    phone: api.phone,
    address: api.address ?? '',

    vehicles: 0, // backend chưa có
    trips: api.totalTrips,
    rating: api.averageRating ?? 0,
    revenue: api.totalRevenue ?? 0,

    status: mapCompanyStatusToUI(api.status),
    joinDate: new Date(api.createdAt).toLocaleDateString('vi-VN'),
  };
}
