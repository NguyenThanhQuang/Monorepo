export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | object | ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}
