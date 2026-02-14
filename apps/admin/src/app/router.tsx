import { Route } from "lucide-react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { RevenueDashboard } from "../features/RevenueDashboard/RevenueDashboard";

// Định nghĩa React Router (Lazy loading pages)
<Route path="/admin" element={<AdminLayout />}>
   <Route path="revenue" element={<RevenueDashboard />} />
</Route>