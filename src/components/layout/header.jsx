import { Link } from "react-router-dom";
import { useAuth } from "../../app/auth/auth-context.jsx";
import { ThemeToggle } from "../ui/theme-toggle.jsx";

const NAV_PUBLIC = [
  { label: "Home", to: "/" },
  { label: "Pricing", to: "/pricing" },
  { label: "Support", to: "/support" },
];

const NAV_APP = [
  { label: "Dashboard", to: "/app/dashboard" },
  { label: "Portfolio", to: "/app/portfolio" },
];

function NavLink(props) {
  const { to, children } = props;

  return (
    <Link
      to={to}
      className="text-sm text-muted hover:text-ink transition-colors"
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { isAuthenticated, logout } = useAuth();

  const navItems = isAuthenticated ? NAV_APP : NAV_PUBLIC;

  return (
    <header className="w-full border-b border-border bg-bg">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="text-lg font-semibold text-ink">
              Orixium
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-6">
              {navItems.map(function (item) {
                return (
                  <NavLink key={item.to} to={item.to}>
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-2"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-2"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
