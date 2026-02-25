import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProviders } from "./providers";
import { useAuthStore } from "../core/auth/auth-store";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { VehiclePage } from "../features/vehicles/pages/VehiclePage";
import { MainLayout } from "../shared/layouts/MainLayout";

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
};

function App() {
  return (
    <AppProviders>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Chào mừng quay trở lại!
                  </h1>
                  <p className="text-gray-500 mt-2 text-sm">
                    Dashboard đang được cập nhật dữ liệu từ hệ thống...
                  </p>
                </div>
              }
            />

            <Route path="/vehicles" element={<VehiclePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}

export default App;
