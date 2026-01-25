import { ApiErrorResponse, ApiResponse } from "@obtp/shared-types";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * [STRICT TYPING]
 * Định nghĩa Interface cục bộ để TS hiểu import.meta.env của Vite
 * mà không cần phụ thuộc vào thư viện vite client types ở đây.
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export class HttpClient {
  private instance: AxiosInstance;
  private static _instance: HttpClient;

  private constructor() {
    this.instance = axios.create({
      baseURL: this.getApiBaseUrl(),
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    this.initializeRequestInterceptor();
    this.initializeResponseInterceptor();
  }

  // --- HELPER ĐỂ LẤY BASE URL AN TOÀN ---
  private getApiBaseUrl(): string {
    // 1. Kiểm tra môi trường Vite (Browser/Client)
    // Chúng ta dùng 'in' operator để kiểm tra property existence an toàn
    // Sau đó ép kiểu (cast) về unknown rồi về Interface đã định nghĩa phía trên (Type Safe)
    if (typeof import.meta !== "undefined" && "env" in import.meta) {
      const meta = import.meta as unknown as ImportMeta;
      if (meta.env.VITE_API_BASE_URL) {
        return meta.env.VITE_API_BASE_URL;
      }
    }

    // 2. Kiểm tra môi trường Node.js (process.env)
    // TypeScript sẽ không báo lỗi process nữa nếu đã cài @types/node
    // Runtime check: đảm bảo 'process' tồn tại trước khi truy cập để tránh crash trên browser cũ không có polyfill
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.API_BASE_URL
    ) {
      return process.env.API_BASE_URL;
    }

    // 3. Fallback mặc định local
    return "http://localhost:3000/api/v1";
  }

  public static getInstance(): HttpClient {
    if (!HttpClient._instance) {
      HttpClient._instance = new HttpClient();
    }
    return HttpClient._instance;
  }

  private initializeRequestInterceptor() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("accessToken");
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error: unknown) => Promise.reject(error),
    );
  }

  private initializeResponseInterceptor() {
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        return response.data && response.data.data !== undefined
          ? response.data.data
          : response.data;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      },
    );
  }

  private handleError(error: AxiosError) {
    if (error.response && error.response.data) {
      const apiError = error.response.data as ApiErrorResponse;
      return {
        message: apiError.message || "Lỗi không xác định từ hệ thống",
        statusCode: apiError.statusCode || error.response.status,
        originalError: error,
      };
    }
    return {
      message: error.message || "Lỗi kết nối mạng",
      statusCode: 500,
      originalError: error,
    };
  }

  // --- GENERIC METHODS ---

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config) as Promise<T>;
  }

  public post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.post(url, data, config) as Promise<T>;
  }

  public patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.patch(url, data, config) as Promise<T>;
  }

  public put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.put(url, data, config) as Promise<T>;
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config) as Promise<T>;
  }
}

export const http = HttpClient.getInstance();
