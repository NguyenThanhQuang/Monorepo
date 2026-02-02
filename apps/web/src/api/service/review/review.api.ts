import type { ReviewDTO } from "@obtp/shared-types";
import api from "../../api";

export const reviewApi = {
  getAllForAdmin: (params?: { companyId?: string }) =>
    api.get<ReviewDTO[]>('/reviews/admin/all', { params }),

  toggleVisibility: (id: string, isVisible: boolean) =>
    api.patch(`/reviews/${id}`, { isVisible }),

  remove: (id: string) =>
    api.delete(`/reviews/${id}`)
  
};export const getMyReviewsApi = () => {
  return api.get('/reviews/my').then(res => res.data);
};