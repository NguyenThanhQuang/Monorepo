import type { Vehicle } from '@obtp/shared-types';
import api from '../../api';

export const VehiclesApi = {
  getAll(companyId?: string): Promise<Vehicle[]> {
    return api
      .get('/vehicles', {
        params: companyId ? { companyId } : undefined,
      })
      .then(res => res.data);
  },

  create(payload: any) {
    return api.post('/vehicles', payload).then(res => res.data);
  },

  update(id: string, payload: any) {
    return api.patch(`/vehicles/${id}`, payload).then(res => res.data);
  },

  remove(id: string) {
    return api.delete(`/vehicles/${id}`).then(res => res.data);
  },
};
