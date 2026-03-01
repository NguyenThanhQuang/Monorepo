import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

export function RequireAuth({ children }: { children: ReactNode }) {
  const token = getAccessToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
function getAccessToken() {
  throw new Error("Function not implemented.");
}
