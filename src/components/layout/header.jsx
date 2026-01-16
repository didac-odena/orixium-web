// src/components/layout/header.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth/auth-context.jsx";
import { ThemeToggle } from "../ui/theme-toggle.jsx";
import { Bars3Icon } from "@heroicons/react/24/outline";

const NAV_PUBLIC = [
  { label: "Strategy", to: "/strategy" },
  { label: "Membership", to: "/membership" },
  { label: "Support", to: "/support" },
];

const NAV_APP = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Strategy", to: "/strategy" },
  { label: "Market Explorer", to: "/market-explorer" },
  { label: "Historial", to: "/historial" },
  { label: "Support", to: "/support" },
];

function NavItem(props) {
  const { to, label } = props;

  return (
    <Link to={to} className="text-muted hover:text-accent transition-colors">
      {label}
    </Link>
  );
}

export function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = isAuthenticated ? NAV_APP : NAV_PUBLIC;

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  function handleToggleMenu() {
    setIsMenuOpen(function (open) {
      return !open;
    });
  }

  function handleCloseMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="w-full border-b">
      <div className="px-3 sm:px-6">
        <div className="relative flex h-16 items-center gap-2 sm:gap-4">
          {/* Left: logo + nav (desktop) */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="text-2xl font-semibold text-muted">
              Orixium
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map(function (item) {
                return (
                  <NavItem key={item.to} to={item.to} label={item.label} />
                );
              })}
            </nav>
          </div>

          {/* Center: menu button (mobile) */}
          <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
            <div className="relative">
              <button
                type="button"
                onClick={handleToggleMenu}
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
                className="cursor-pointer rounded-md border p-2 text-ink"
              >
                <Bars3Icon className="h-4 w-4" aria-hidden="true" />
              </button>
              {isMenuOpen ? (
                <div className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-md border bg-bg py-2 shadow-sm">
                  <div className="border-b px-4 pb-2">
                    <ThemeToggle />
                  </div>
                  {navItems.map(function (item) {
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={handleCloseMenu}
                        className="block px-4 py-2 text-sm text-ink hover:bg-slate-200"
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: actions */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="cursor-pointer rounded-md border px-3 py-1 text-sm text-ink hover:border-accent-2 hover:text-accent-2"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="cursor-pointer rounded-md border px-3 py-1 text-sm text-ink hover:border-accent hover:text-accent"
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
