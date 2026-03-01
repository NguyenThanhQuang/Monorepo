const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "adminUser";

export const authStorage = {
  getToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),

  setToken: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),

  clearToken: () => localStorage.removeItem(ACCESS_TOKEN_KEY),

  getUser: () => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: unknown) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearUser: () => localStorage.removeItem(USER_KEY),

  clearAll: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
