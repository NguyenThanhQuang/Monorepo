import {
  CreateGuestReviewPayload,
  CreateReviewPayload,
  Review,
  ReviewDTO,
  ReviewQuery,
  UpdateUserReviewPayload,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const reviewsApi = {
  getAllPublic: (query: ReviewQuery) => {
    return http.get<Review[]>("/reviews", { params: query });
  },

  create: (payload: CreateReviewPayload) => {
    return http.post<Review>("/reviews", payload);
  },

  createAsGuest: (payload: CreateGuestReviewPayload) => {
    return http.post<Review>("/reviews/guest", payload);
  },

  updateMyReview: (id: string, payload: UpdateUserReviewPayload) => {
    return http.patch<Review>(`/reviews/${id}/my-review`, payload);
  },

  getMyReviews: () => {
    return http.get<Review[]>("/reviews/my");
  },

  getAllAdmin: (params?: { companyId?: string }) => {
    return http.get<ReviewDTO[]>("/reviews/admin/all", { params });
  },

  toggleVisibility: (id: string, isVisible: boolean) => {
    return http.patch<{ message: string }>(`/reviews/${id}`, { isVisible });
  },

  delete: (id: string) => {
    return http.delete<void>(`/reviews/${id}`);
  },

  getCompanyReviews: (params?: ReviewQuery) => {
    return http.get<Review[]>("/reviews/company", { params });
  },
};