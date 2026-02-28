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
  // Public List
  getAllPublic: (query: ReviewQuery) => {
    return http.get<Review[]>("/reviews", { params: query });
  },

  // Auth User tạo Review
  create: (payload: CreateReviewPayload) => {
    return http.post<Review>("/reviews", payload);
  },

  // Guest tạo Review (verify qua Phone)
  createAsGuest: (payload: CreateGuestReviewPayload) => {
    return http.post<Review>("/reviews/guest", payload);
  },

  // User chỉnh sửa review của mình
  updateMyReview: (id: string, payload: UpdateUserReviewPayload) => {
    return http.patch<Review>(`/reviews/${id}/my-review`, payload);
  },

  // Lấy reviews của user hiện tại
  getMyReviews: () => {
    return http.get<Review[]>("/reviews/my");
  },

  // --- ADMIN ---
  getAllAdmin: (params?: { companyId?: string }) => {
    return http.get<ReviewDTO[]>("/reviews/admin/all", { params });
  },

  toggleVisibility: (id: string, isVisible: boolean) => {
    return http.patch<{ message: string }>(`/reviews/${id}`, { isVisible });
  },

  delete: (id: string) => {
    return http.delete<void>(`/reviews/${id}`);
  },
};