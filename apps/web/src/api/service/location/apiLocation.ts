import type { Location } from '@obtp/shared-types';
import api from '../../api';

// Định nghĩa interface cho response wrapper
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Location APIs
 */
export const locationApi = {
  /**
   * Autocomplete search
   */
  search(keyword: string) {
    return api.get<ApiResponse<Location[]>>('/locations/search', {
      params: { q: keyword },
    });
  },

  /**
   * Popular locations (Hero slider)
   */
  getPopular() {
    return api.get<ApiResponse<Location[]>>('/locations/popular');
  },
};