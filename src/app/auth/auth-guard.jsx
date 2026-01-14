import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth-context.jsx";

export function AuthGuard(props) {
  const children = props.children;

  const auth = useAuth();
  const location = useLocation();

  if (auth.isInitializing) {
    return <div>Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={"/login?next=" + next} replace />;
  }

  return children;
}