// src/app/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
<<<<<<< HEAD
import { AppProviders } from "./providers";
import { useAuthStore } from "../core/auth/auth-store";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { VehiclePage } from "../features/vehicles/pages/VehiclePage";
import { MainLayout } from "../shared/layouts/MainLayout";
import { TripPage } from "../features/trips/pages/TripPage";
=======
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi";
import { AuthProvider, useAuth } from "../../../admin/src/contexts/AuthContext";
import { LanguageProvider } from "../../../admin/src/contexts/LanguageContext";
import LoginPage from "../components/layout/LoginPage";
import { CompanyDashboard } from "../features/dashboard/pages/CompanyDashboard";
import CompanyVehiclesPage from "../features/vehicles/pages/CompanyVehiclesPage";
import { RouteManagement } from "../features/trips/pages/RouteManagement";
import { ThemeProvider } from "./providers";
import AddTripContainer from "../features/trips/add-trip/AddTripContainer";
import { CompanyLayout } from "../features/dashboard/pages/CompanyLayout";
import { CompanyReviewsPage } from "../features/review/page/CompanyReviewsPage";
<<<<<<< Updated upstream
=======
>>>>>>> 32feb224b957b859f238162e10394d2e6005c761
>>>>>>> Stashed changes

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
};

<<<<<<< HEAD
=======
function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/company/dashboard"
          element={
            <ProtectedRoute>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/vehicles"
          element={
            <ProtectedRoute>
              <CompanyVehiclesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/trips"
          element={
            <ProtectedRoute>
              <RouteManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/trips/add"
          element={
            <ProtectedRoute>
              <AddTripContainer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/trips/edit/:tripId"
          element={
            <ProtectedRoute>
              <AddTripContainer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/reviews"
          element={
            <ProtectedRoute>
              <CompanyReviewsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

>>>>>>> 32feb224b957b859f238162e10394d2e6005c761
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
            <Route path="/trips" element={<TripPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}

export default App;