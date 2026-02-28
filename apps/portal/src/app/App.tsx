import { Suspense, lazy } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { queryClient } from "@/lib/query-client";
import { ThemeProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
);
const VehiclesPage = lazy(
  () => import("@/features/vehicles/pages/VehiclesPage"),
);
const TripsPage = lazy(() => import("@/features/trips/pages/TripsPage"));
const DriversPage = lazy(() => import("@/features/drivers/pages/DriversPage"));
const BookingsPage = lazy(
  () => import("@/features/bookings/pages/BookingsPage"),
);
const TripFormWizard = lazy(() =>
  import("@/features/trips/components/wizard/TripFormWizard").then(
    (module) => ({ default: module.TripFormWizard }),
  ),
);
const SettingsPage = lazy(
  () => import("@/features/settings/pages/SettingsPage"),
);

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <BrowserRouter>
          {/* Suspense bọc toàn bộ Routes để hiển thị Loader khi Lazy load */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* PUBLIC */}
              <Route path="/login" element={<LoginPage />} />

              {/* PROTECTED */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route
                    path="/company/dashboard"
                    element={<DashboardPage />}
                  />
                  <Route path="/company/vehicles" element={<VehiclesPage />} />

                  {/* Trips Group */}
                  <Route path="/company/trips" element={<TripsPage />} />
                  <Route
                    path="/company/trips/add"
                    element={<TripFormWizard />}
                  />
                  <Route
                    path="/company/trips/edit/:id"
                    element={<TripFormWizard />}
                  />

                  <Route path="/company/drivers" element={<DriversPage />} />
                  <Route path="/company/bookings" element={<BookingsPage />} />
                  <Route path="/company/settings" element={<SettingsPage />} />

                  {/* Default Redirect */}
                  <Route
                    path="/"
                    element={<Navigate to="/company/dashboard" replace />}
                  />
                </Route>
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>

        {/* Global Components */}
        <Toaster position="top-right" />
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
