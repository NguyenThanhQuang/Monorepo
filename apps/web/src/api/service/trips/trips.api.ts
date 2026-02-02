import type { Trip } from '@obtp/shared-types';
import api from '../../api';

export const TripsApi = {
  getManagementTrips(companyId: string): Promise<Trip[]> {
    return api
      .get('/trips/management/all', {
        params: { companyId },
      })
      .then(res => res.data);
  },
};
