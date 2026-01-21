import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth/auth-context.jsx";
import { LoginForm } from "../../components/auth/login-form.jsx";
import { AUTH_USERS } from "../../mocks/fixtures/auth-users.js";

function getNextPath(search) {
  const params = new URLSearchParams(search);
  const next = params.get("next");

  if (!next) return "/dashboard";

  // Basic safety: only allow internal paths.
  if (!next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//")) return "/dashboard";

  return next;
}

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultUser = AUTH_USERS[0];

  useEffect(
    function () {
      // If there's an active session, skip the login page.
      if (auth.isInitializing) return;
      if (auth.isAuthenticated) {
        const nextPath = getNextPath(location.search);
        navigate(nextPath, { replace: true });
      }
    },
    [auth.isInitializing, auth.isAuthenticated, location.search, navigate]
  );

  async function handleSubmit(values) {
    await auth.login(values);
    const nextPath = getNextPath(location.search);
    navigate(nextPath, { replace: true });
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-sm flex-col justify-center gap-6">
        <div className="space-y-1 text-center">
          <h1>Login</h1>
          <p>Access your account</p>
        </div>

        <LoginForm
          defaultValues={{
            email: defaultUser?.email ?? "",
            password: defaultUser?.password ?? "",
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
