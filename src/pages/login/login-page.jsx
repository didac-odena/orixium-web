import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth/auth-context.jsx";

function getNextPath(search) {
  const params = new URLSearchParams(search);
  const next = params.get("next");

  if (!next) return "/app/dashboard";

  // Seguridad básica: solo paths internos
  if (!next.startsWith("/")) return "/app/dashboard";
  if (next.startsWith("//")) return "/app/dashboard";

  return next;
}

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("demo-admin@orixium.test");
  const [password, setPassword] = useState("12345678");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(
    function () {
      // Si ya hay sesión, no tiene sentido quedarse en /login
      if (auth.isInitializing) return;
      if (auth.isAuthenticated) {
        const nextPath = getNextPath(location.search);
        navigate(nextPath, { replace: true });
      }
    },
    [auth.isInitializing, auth.isAuthenticated, location.search, navigate]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await auth.login({ email: email, password: password });
      const nextPath = getNextPath(location.search);
      navigate(nextPath, { replace: true });
    } catch (err) {
      setFormError(err?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Email
            <input
              value={email}
              onChange={function (e) {
                setEmail(e.target.value);
              }}
              autoComplete="email"
            />
          </label>
        </div>

        <div>
          <label>
            Password
            <input
              value={password}
              onChange={function (e) {
                setPassword(e.target.value);
              }}
              type="password"
              autoComplete="current-password"
            />
          </label>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        {formError ? <p>{formError}</p> : null}
      </form>
    </div>
  );
}
