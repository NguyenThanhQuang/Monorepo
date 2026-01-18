export interface ApiResponse<T = void> {
  statusCode: number;
  message: string;
  data: T;
  // Metadata cho pagination nếu cần sau này, optional
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Interface định nghĩa các params cho URL xác thực (được dùng trong UrlBuilderService)
export interface VerificationResultParams {
  success: string; // URL search params luôn là string
  message: string;
  accessToken?: string;
}

// Interface cơ bản cho danh sách kết quả (dùng cho Service sau này)
export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
