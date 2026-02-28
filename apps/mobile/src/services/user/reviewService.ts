import apiService from "../common/apiService";

const unwrap = (resData: any) => resData?.data ?? resData;

export type DriverReviewStats = {
  avgRating: number;
  count: number;
  breakdown?: Record<string, number>;
};

export type DriverReviewItem = {
  _id: string;
  displayName: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  tripId?: any;
  bookingId?: any;
};

class ReviewService {
  async createDriverReview(payload: {
    bookingId: string;
    rating: number;
    comment?: string;
    isAnonymous?: boolean;
  }) {
    const res = await apiService.post<any>("/reviews/driver", payload);
    return unwrap(res.data);
  }

  async getDriverReviews(driverId: string, opts?: { limit?: number; skip?: number }) {
    const res = await apiService.get<any>("/reviews/driver", {
      params: { driverId, ...(opts || {}) },
    });
    return unwrap(res.data);
  }

  async getMyDriverReviews(opts?: { limit?: number; skip?: number }) {
    const res = await apiService.get<any>("/reviews/driver/me", {
      params: { ...(opts || {}) },
    });
    return unwrap(res.data);
  }
}

export const reviewService = new ReviewService();
