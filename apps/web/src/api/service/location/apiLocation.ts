import type { Location } from '@obtp/shared-types';
import api from '../../api';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const locationApi = {
  // ✅ FIX Ở ĐÂY
  async search(keyword: string): Promise<Location[]> {
    const res = await api.get<ApiResponse<Location[]>>(
      '/locations/search',
      { params: { q: keyword } }
    );

    return res.data.data;
  },

  async getPopular(): Promise<Location[]> {
    const res = await api.get<ApiResponse<Location[]>>(
      '/locations/popular'
    );

    return res.data.data; // giữ nguyên như bạn yêu cầu
  },
};
