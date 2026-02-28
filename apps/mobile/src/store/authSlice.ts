import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "../services/common/apiService";

export interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  roles: string[];
  isEmailVerified: boolean;
  accountStatus?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  successMessage: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  status: "idle",
  successMessage: null,
};

/* ===== Helpers ===== */
const normalizePhoneVN = (raw: string) => {
  const trimmed = raw.trim();

  // +84 9xx... -> 09xx...
  if (trimmed.startsWith("+")) {
    const digits = trimmed.replace(/\D/g, "");
    if (digits.startsWith("84")) return "0" + digits.slice(2);
    return digits;
  }

  // bỏ ký tự không phải số
  let digits = trimmed.replace(/\D/g, "");

  // 84xxxxxxxxx -> 0xxxxxxxxx
  if (digits.startsWith("84")) digits = "0" + digits.slice(2);

  return digits;
};

/**
 * Backend có thể trả:
 *  - { message: "..." }
 *  - { message: [{ field, message, code }] }
 *  - hoặc string/khác
 */
const formatBackendMessage = (respData: any): string | null => {
  const msg = respData?.message;

  if (!msg) return null;
  if (typeof msg === "string") return msg;

  if (Array.isArray(msg)) {
    const lines = msg.map((x: any) => x?.message).filter(Boolean);
    if (lines.length) return lines.join("\n");
  }

  return null;
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { identifier: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const identifierRaw = credentials.identifier.trim();
      const identifier = identifierRaw.includes("@")
        ? identifierRaw.toLowerCase()
        : normalizePhoneVN(identifierRaw);

      if (__DEV__) {
        console.log("Attempting login with:", { identifier, password: "***" });
      }

      const response = await apiService.post("/auth/login", {
        identifier,
        password: credentials.password,
      });

      if (__DEV__) {
        // Debug info: log headers and a short preview of data to help debugging
        console.log("Login raw response headers:", response.headers);
        const preview =
          typeof response.data === "string"
            ? response.data.slice(0, 300)
            : response.data;
        console.log("Login response preview:", preview);
      }

      // Ensure server returned JSON (axios usually parses JSON to object)
      if (
        typeof response.data === "string" &&
        response.data.includes("<html")
      ) {
        return rejectWithValue(
          "Server trả về trang HTML (kiểm tra API_BASE_URL).",
        );
      }

      const d: any = response.data;
      const payload = d?.data ?? d; // nếu server bọc data thì lấy data, không thì lấy thẳng

      const accessToken = payload?.accessToken as string | undefined;
      const user = payload?.user as User | undefined;

      if (!accessToken) {
        return rejectWithValue("Đăng nhập thất bại: server không trả token.");
      }

      // Store token and user data (only if defined)
      await AsyncStorage.setItem("accessToken", accessToken);
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
      } else if (__DEV__) {
        console.log("Login: token present but user missing from response");
      }

      return { user: user as User, token: accessToken };
    } catch (error: any) {
      /**
       * ✅ QUAN TRỌNG:
       * Không dùng console.error("Login error...") nữa vì RN/Metro sẽ hiện như bar lỗi ở dưới.
       * Nếu cần debug, chỉ log dev và dùng console.log.
       */
      if (__DEV__) {
        console.log(
          "Login error (debug):",
          error?.response?.data || error?.message || error,
        );
      }

      // Network Error
      if (error?.message === "Network Error") {
        return rejectWithValue(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend.",
        );
      }

      const resp = error?.response?.data;

      // HTML fallback
      if (typeof resp === "string" && resp.includes("<html")) {
        return rejectWithValue(
          "Server trả về trang HTML (kiểm tra API_BASE_URL).",
        );
      }

      // Format message: string hoặc array
      const formatted = formatBackendMessage(resp);

      return rejectWithValue(formatted || "Đăng nhập thất bại");
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    userData: {
      email: string;
      password: string;
      confirmPassword: string;
      name: string;
      phone: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.post("/auth/register", {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        phone: userData.phone.trim(),
        password: userData.password,
        confirmPassword: userData.confirmPassword, // ✅ thêm
      });
      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.log(
          "Registration error (debug):",
          error?.response?.status,
          error?.response?.data,
        );
      }
      const formatted = formatBackendMessage(error?.response?.data);
      return rejectWithValue(formatted || "Đăng ký thất bại");
    }
  },
);


export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    passwordData: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    },
    { rejectWithValue },
  ) => {
    try {
      // ✅ Backend: PATCH /users/me/change-password
      // Payload: { currentPassword, newPassword, confirmNewPassword }
      const response = await apiService.patch(
        "/users/me/change-password",
        passwordData,
      );
      return response.data;
    } catch (error: any) {
      if (__DEV__)
        console.log(
          "Change password error (debug):",
          error?.response?.data || error?.message,
        );
      const formatted = formatBackendMessage(error?.response?.data);
      return rejectWithValue(formatted || "Thay đổi mật khẩu thất bại");
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiService.post("/auth/forgot-password", {
        email,
      });
      return response.data;
    } catch (error: any) {
      if (__DEV__)
        console.log(
          "Forgot password error (debug):",
          error?.response?.data || error?.message,
        );
      const formatted = formatBackendMessage(error?.response?.data);
      return rejectWithValue(
        formatted || "Gửi email khôi phục mật khẩu thất bại",
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    payload: { token: string; newPassword: string; confirmNewPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.post("/auth/reset-password", {
        token: payload.token,
        newPassword: payload.newPassword,
        confirmNewPassword: payload.confirmNewPassword,
      });
      return response.data; // { message: 'Mật khẩu đã được đặt lại thành công.' } (tuỳ backend)
    } catch (error: any) {
      if (__DEV__) {
        console.log(
          "Reset password error (debug):",
          error?.response?.data || error?.message || error,
        );
      }

      if (error?.message === "Network Error") {
        return rejectWithValue(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend.",
        );
      }

      const resp = error?.response?.data;

      // HTML fallback
      if (typeof resp === "string" && resp.includes("<html")) {
        return rejectWithValue(
          "Server trả về trang HTML (kiểm tra API_BASE_URL).",
        );
      }

      const formatted = formatBackendMessage(resp);
      return rejectWithValue(formatted || "Đặt lại mật khẩu thất bại");
    }
  },
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        if (__DEV__) {
          console.log(
            "ℹ️ No saved authentication token found - user needs to login",
          );
        }
        return rejectWithValue("No token found");
      }

      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        if (__DEV__)
          console.log("ℹ️ No saved user data found - clearing token");
        await AsyncStorage.removeItem("accessToken");
        return rejectWithValue("No user data found");
      }

      const user = JSON.parse(userData);

      // Verify token with backend (only if we have connectivity)
      try {
        // ✅ Backend: GET /users/me
        const response = await apiService.get("/users/me");
        const verifiedUser = (response.data as any)?.data ?? (response.data as any);
        if (__DEV__) console.log("✅ User authentication verified");
        return { token, user: verifiedUser };
      } catch (apiError: any) {
        // If API is unreachable, use cached user data
        if (apiError?.message === "Network Error") {
          if (__DEV__)
            console.log("⚠️ API unreachable, using cached user data");
          return { token, user };
        }
        throw apiError;
      }
    } catch (error: any) {
      if (__DEV__) console.log("❌ Load user error (debug):", error?.message);
      // Clear invalid data
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("user");
      return rejectWithValue("Failed to load user");
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("user");
    return true;
  } catch (error) {
    if (__DEV__) console.log("Logout error (debug):", error);
    return false;
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuthStatus: (state) => {
      state.status = "idle";
      state.successMessage = null;
    },
    clearAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.status = "idle";
      state.successMessage = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      // Only update if user data actually changed
      if (JSON.stringify(state.user) !== JSON.stringify(action.payload)) {
        state.user = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
          state.status = "succeeded";
        },
      )
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Đăng nhập thất bại";
        state.status = "failed";
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Đăng ký thất bại";
      });

    // Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
        state.successMessage = "Mật khẩu đã được thay đổi thành công!";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.successMessage = null;
      });

    // Reset Password (qua token)
    builder
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resetPassword.fulfilled, (state, action: any) => {
        state.status = "succeeded";
        state.error = null;

        // backend thường trả { message: "..." }
        const msg =
          (action.payload?.message as string | undefined) ||
          "Đặt lại mật khẩu thành công!";
        state.successMessage = msg;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Đặt lại mật khẩu thất bại";
        state.successMessage = null;
      });

    // Load user
    builder
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        loadUser.fulfilled,
        (state, action: PayloadAction<{ token: string; user: User }>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        },
      )
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.status = "idle";
      state.successMessage = null;
    });
  },
});

export const { clearError, setUser, clearAuthStatus, clearAuthState } =
  authSlice.actions;
export default authSlice.reducer;
