import type { AuthUserResponse } from "@obtp/shared-types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: AuthUserResponse | null;
  isAuthenticated: boolean;
  accessToken: string | null;

  login: (user: AuthUserResponse, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,

      login: (user, token) => {
        localStorage.setItem("accessToken", token);

        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem("accessToken");

        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "obtp-portal-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
