import type { Location } from '@obtp/shared-types';
import api from '../../api';

/**
 * Location APIs
 */
export const locationApi = {
  /**
   * Autocomplete search
   */
  search(keyword: string) {
    return api.get<Location[]>('/locations/search', {
      params: { q: keyword },
    });
  },

  /**
   * Popular locations (Hero slider)
   */
  getPopular() {
    return api.get<Location[]>('/locations/popular');
  },
};
