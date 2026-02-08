import { createContext, useContext, useEffect, useState } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  companyId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Load từ localStorage khi reload
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('authUser');

    if (token && userData) {
      setAccessToken(token);
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('authUser', JSON.stringify(userData));

    setAccessToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authUser');

    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
