import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { AdminLayout } from "../components/layout/AdminLayout";
import { RevenueDashboard } from "../features/RevenueDashboard/RevenueDashboard";
import { CompanyManagement } from "../features/companies/pages/CompanyManagement";
import { AdminLogin } from "../features/auth/pages/AdminLogin";

function isAuthed() {
  return Boolean(localStorage.getItem("accessToken"));
}

function LoginRoute() {
  const nav = useNavigate();

  return (
    <AdminLogin
      onBack={() => nav(-1)}
      onLoginSuccess={(_adminData) => {
        // AdminLogin itself already saves accessToken.
        nav("/admin/revenue", { replace: true });
      }}
    />
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/admin/revenue" replace />}
        />

        <Route path="/login" element={<LoginRoute />} />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="revenue" replace />} />
          <Route path="revenue" element={<RevenueDashboard />} />
          <Route path="companies" element={<CompanyManagement />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/admin/revenue" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
