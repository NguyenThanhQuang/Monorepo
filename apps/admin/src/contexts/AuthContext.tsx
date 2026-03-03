import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SanitizedUserResponse } from "@obtp/shared-types";
import { authStorage } from "@/core/auth/storage";

type AuthUser = SanitizedUserResponse | null;

interface AuthContextType {
  user: AuthUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (token: string, userData: SanitizedUserResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = () => {
      const token = authStorage.getToken();
      const storedUser = authStorage.getUser();

      if (token && storedUser) {
        setUser(storedUser as SanitizedUserResponse);
        setAccessToken(token);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: SanitizedUserResponse) => {
    authStorage.setToken(token);
    authStorage.setUser(userData);
    setUser(userData);
    setAccessToken(token);
  };

  const logout = () => {
    authStorage.clearAll();
    setUser(null);
    setAccessToken(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};