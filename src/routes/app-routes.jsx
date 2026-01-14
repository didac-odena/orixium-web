import { Route } from "react-router-dom";
import { AppLayout } from "../layouts/app/index.js";
import { DashboardPage } from "../pages/dashboard/index.js";
import { AuthGuard } from "../app/auth/auth-guard.jsx";

export function AppRoutes() {
  return (
    <Route
      element={
        <AuthGuard>
          <AppLayout />
        </AuthGuard>
      }
    >
      <Route path="/app/dashboard" element={<DashboardPage />} />
    </Route>
  );
}
