// src/components/layout/header.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth/auth-context.jsx";
import { ThemeToggle } from "../ui/theme-toggle.jsx";
import { Bars3Icon, PowerIcon } from "@heroicons/react/24/outline";

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
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userLabel = user?.name || user?.email || "Account";

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
    <header className="w-full border-b ">
      <div className="px-3 sm:px-6">
        <div className="relative flex h-16 items-center gap-2 sm:gap-4">
          {/* Left: logo + nav (desktop) */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="text-2xl font-semibold">
              <span className="inline-flex items-center gap-2">
                <img
                  src="/src/assets/brand/orixium-logo-mark-colored.svg"
                  alt="Orixium"
                  className="h-7 w-auto dark:hidden"
                />
                <img
                  src="/src/assets/brand/orixium-logo-mark-colored-dark.svg"
                  alt="Orixium"
                  className="hidden h-7 w-auto dark:block"
                />
                Orixium
              </span>
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
                className="cursor-pointer rounded-md p-2 text-ink hover:text-accent"
              >
                <Bars3Icon className="h-4 w-4" aria-hidden="true" />
              </button>
              {isMenuOpen ? (
                <div className="absolute left-1/2 top-full z-10 mt-0 w-56 -translate-x-1/2 rounded-md border bg-bg py-2 shadow-sm">
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
          <div className="ml-auto flex items-center gap-2 sm:gap-1">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                <div className="relative group">
                  <button
                    type="button"
                    className="cursor-pointer px-1 py-1 text-sm text-ink hover:text-accent"
                    aria-haspopup="menu"
                  >
                    {userLabel}
                  </button>
                  <div className="absolute right-0 top-full z-10 mt-0 hidden rounded-md border bg-bg py-2 text-sm shadow-sm group-hover:block group-focus-within:block">
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-ink hover:text-accent"
                    >
                      Settings
                    </Link>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="cursor-pointer rounded-md p-1 text-ink hover:text-danger"
                  aria-label="Logout"
                >
                  <PowerIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="cursor-pointer rounded-md px-3 py-1 text-sm text-ink hover:text-accent"
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
