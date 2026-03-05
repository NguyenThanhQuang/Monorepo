import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = this.getBaseURL();

    if (__DEV__) {
      console.log("🌍 API BaseURL:", this.baseURL);
    }

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /* ================= BASE URL ================= */
  private getBaseURL(): string {
    // Priority order:
    // 1) Expo config extra (app.json)
    // 2) EXPO_PUBLIC_* env (EAS/Expo)
    // 3) Reasonable local defaults (dev)
    const extraApi = (Constants.expoConfig as any)?.extra?.API_BASE_URL;
    const envApi = (process as any)?.env?.EXPO_PUBLIC_API_BASE_URL;

    if (extraApi && typeof extraApi === "string") return extraApi;
    if (envApi && typeof envApi === "string") return envApi;

    if (__DEV__) {
      if (Platform.OS === "android") {
        // Android emulator -> host machine
        return "http://10.0.2.2:3001/api/v1";
      }
      // iOS simulator / local dev
      return "http://localhost:3001/api/v1";
    }

    // Production default (override via env/config)
    return "https://your-production-api.com/api/v1";
  }

  /* ================= HELPERS ================= */
  private isAuthRoute(url: string) {
    return url.includes("/auth/login") || url.includes("/auth/register");
  }

  // Backend của bạn trả message đôi khi là string, đôi khi là array [{field,message,...}]
  private formatErrorMessage(data: any, fallback: string) {
    const msg = data?.message;

    // dạng: { message: "..." }
    if (typeof msg === "string") return msg;

    // dạng: { message: [{ field, message, code }] }
    if (Array.isArray(msg)) {
      const lines = msg
        .map((x: any) => x?.message || x?.msg)
        .filter(Boolean);
      if (lines.length) return lines.join("\n");
    }

    return fallback;
  }

  /* ================= INTERCEPTORS ================= */
  private setupInterceptors(): void {
    /* ---------- REQUEST ---------- */
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const token = await AsyncStorage.getItem("accessToken");

          if (token) {
            if (config.headers instanceof AxiosHeaders) {
              config.headers.set("Authorization", `Bearer ${token}`);
            } else {
              (config.headers as any)["Authorization"] = `Bearer ${token}`;
            }
          }
        } catch (error) {
          // Token read error không cần to quá, chỉ log dev
          if (__DEV__) console.log("⚠️ Token read error:", error);
        }

        if (__DEV__) {
          console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    /* ---------- RESPONSE ---------- */
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          console.log(`✅ ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        const status = error.response?.status;
        const url = String(error.config?.url || "");
        const isAuth = this.isAuthRoute(url);

        const data = error.response?.data as any;
        const fallback =
          error.message || "Không thể kết nối. Vui lòng thử lại.";
        const errorMessage = this.formatErrorMessage(data, fallback);

        /**
         * ✅ TẮT LOG “ERROR Login error …”:
         * - Không log auth routes (login/register) vì UI đã show lỗi rồi
         * - Route khác vẫn log khi DEV để debug
         */
        if (__DEV__ && !isAuth) {
          console.log("❌ API ERROR:", {
            status,
            url,
            message: errorMessage,
          });
        }

        /* ======= FIX 401 LOGIN ISSUE ======= */
        // Không tự clear token nếu đang login/register (tránh vòng lặp)
        if (status === 401 && !isAuth) {
          if (__DEV__) console.log("🔑 Token expired → clearing storage");
          await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
        }

        // (Tuỳ chọn) Gắn message đã format vào error để màn hình dùng lại dễ hơn
        (error as any).friendlyMessage = errorMessage;

        return Promise.reject(error);
      }
    );
  }

  /* ================= METHODS ================= */
  async get<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  async delete<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }
}

const apiService = new ApiService();
export default apiService;
