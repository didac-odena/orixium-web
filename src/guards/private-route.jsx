import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth/auth-context";

export default function PrivateRoute({ children }) {
    const auth = useAuth();
    const location = useLocation();

    if (!auth.isAuthenticated) {
        // Preserve intended URL so login can redirect back.
        const next = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={"/login?next=" + next} replace />;
    }

    return children ?? <Outlet />;
}
