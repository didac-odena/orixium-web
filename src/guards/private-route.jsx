import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth/auth-context.jsx";

export function PrivateRoute({ children }) {

  const auth = useAuth();
  const location = useLocation();

  if (auth.isInitializing) {
    // Wait for auth bootstrap before deciding on redirect.
    return <div>Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    // Preserve intended URL so login can redirect back.
    console.log("REDIRECTING TO LOGIN")
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={"/login?next=" + next} replace />;
  }

  return children ?? <Outlet />;
}
