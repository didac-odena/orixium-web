import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth/auth-context.jsx";

export function AppLayout() {
  const auth = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await auth.logout();
      navigate("/", { replace: true });
    } catch (e) {
      console.error("[AppLayout] logout failed", e);
    }
  }

  return (
    <div style={{ border: "1px solid #000" }}>
      <header style={{ borderBottom: "1px solid #000" }}>
        App Header{" "}
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main style={{ borderBottom: "1px solid #000" }}>
        <Outlet />
      </main>

      <footer>App Footer</footer>
    </div>
  );
}
