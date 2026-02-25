// src/app/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.roles?.includes("company_admin")) {
    return <Navigate to="/login" replace />;
  }

  return <CompanyLayout>{children}</CompanyLayout>;
};

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

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <AppContent />
          </LocalizationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;