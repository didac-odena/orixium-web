// src/components/layout/header.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth/auth-context.jsx";
import { ThemeToggle } from "../ui/theme-toggle.jsx";

const NAV_PUBLIC = [
  { label: "Strategy", to: "/strategy" },
  { label: "Membership", to: "/membership" },
  { label: "Support", to: "/support" },
];

const NAV_APP = [
  { label: "Dashboard", to: "/app/dashboard" },
  { label: "Strategy", to: "/app/strategy" },
  { label: "Market Explorer", to: "/app/market-explorer" },
  { label: "Historial", to: "/app/historial" },
  { label: "Support", to: "/support" },
];

function NavItem(props) {
  const { to, label } = props;

  return (
    <Link to={to} className="text-muted hover:text-ink transition-colors">
      {label}
    </Link>
  );
}

export function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = isAuthenticated ? NAV_APP : NAV_PUBLIC;

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="w-full border-b">
      <div className="px-6">
        <div className=" flex h-16 items-center justify-between">
          {/* Left: logo + nav */}
          <div className="flex items-center gap-15">
            <Link to="/" className="text-2xl font-semibold text-ink">
              Orixium
            </Link>

            <nav className="flex items-center gap-6">
              {navItems.map(function (item) {
                return (
                  <NavItem key={item.to} to={item.to} label={item.label} />
                );
              })}
            </nav>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="cursor-pointer rounded-md border px-3 py-1 text-sm text-ink"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="cursor-pointer rounded-md border px-3 py-1 text-sm text-ink"
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
