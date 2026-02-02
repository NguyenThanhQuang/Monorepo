import type { Location } from '@obtp/shared-types';
import api from '../../api';

export const locationApi = {
  search(keyword: string): Promise<Location[]> {
    return api.get('/locations/search', {
      params: { q: keyword },
    });
  },

  getPopular(): Promise<Location[]> {
    return api.get('/locations/popular');
  },
};
