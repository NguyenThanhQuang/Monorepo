export type ReviewStatus = 'published' | 'hidden';

export interface ReviewDTO {
  _id: string;
  displayName: string;
  companyName?: string;
  routeName?: string;
  rating: number;
  comment: string;
  createdAt: string;
  tripDate?: string;
  isVisible: boolean;
  likeCount?: number;
}

export interface ReviewUI {
  id: string;
  userName: string;
  companyName: string;
  route: string;
  rating: number;
  comment: string;
  date: string;
  tripDate?: string;
  status: ReviewStatus;
  likes: number;
}