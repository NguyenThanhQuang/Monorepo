export function getCurrentUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!localStorage.getItem('token');
}

export function isAdmin(user: any) {
  return user?.roles?.includes('admin') || user?.roles?.includes('company_admin');
}
