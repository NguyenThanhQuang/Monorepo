import type { Company, CompanyStatsResponse } from '@obtp/shared-types';
import api from '../../api';

export const companyApi = {
  getAllWithStats(): Promise<CompanyStatsResponse[]> {
    return api.get('/companies');
  },

  updateStatus(id: string, status: 'active' | 'suspended') {
    return api.patch(`/companies/${id}`, { status });
  },
   getMyCompany(): Promise<Company> {
    return api.get('/companies/my-company').then(res => res.data);
  },
};
