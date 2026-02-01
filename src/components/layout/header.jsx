import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/auth/auth-context";
import { HeaderDropdown, ThemeToggle } from "../ui";
import NotificationsMenu from "./notifications-menu";
import { Bars3Icon, ChartPieIcon, PowerIcon } from "@heroicons/react/24/outline";

const NAV_PUBLIC = [
  { label: "Membership", to: "/membership" },
  { label: "Support", to: "/support" },
];

const NAV_APP = [
  { label: "Dashboard", to: "/dashboard" },
  {
    label: "Trading",
    children: [
      { label: "New Trade", to: "/new-trade" },
      { label: "Current Trades", to: "/current-trades" },
    ],
  },
  { label: "Market Explorer", to: "/market-explorer" },
  { label: "Historial", to: "/historial" },
  { label: "Support", to: "/support" },
];

function NavItem({ to, label, children, onSelect }) {
  if (children && children.length) {
    return (
      <HeaderDropdown
        label={label}
        wrapperClassName="h-16 flex items-center"
        buttonClassName="cursor-pointer h-16 flex items-center text-muted hover:text-accent transition-colors"
      >
        {children.map((child) => {
          return (
            <Link
              key={child.to}
              to={child.to}
              onClick={onSelect}
              className="flex px-4 py-2 whitespace-nowrap text-ink hover:text-accent"
            >
              {child.label}
            </Link>
          );
        })}
      </HeaderDropdown>
    );
  }

  return (
    <Link
      to={to}
      onClick={onSelect}
      className="h-16 flex items-center text-muted hover:text-accent transition-colors"
    >
      {label}
    </Link>
  );
}

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userLabel = user?.name || user?.email || "Account";

  // Public vs authenticated navigation sets.
  const navItems = isAuthenticated ? NAV_APP : NAV_PUBLIC;

  async function handleLogout() {
    await logout();
  }

  function handleToggleMenu() {
    // Mobile menu toggle.
    setIsMenuOpen((open) => {
      return !open;
    });
  }

  function handleCloseMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="w-full border-b border-border-strong">
      <div className="px-3 sm:px-6">
        <div className="relative flex h-16 items-center gap-2 sm:gap-4">
          {/* Left: logo + nav (desktop) */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="text-2xl font-semibold">
              <span className="inline-flex items-center gap-2">
                <img
                  src="/src/assets/brand/orixium-logo-mark-colored.svg"
                  alt="Orixium"
                  className="h-10 w-auto dark:hidden"
                />
                <img
                  src="/src/assets/brand/orixium-logo-mark-colored-dark.svg"
                  alt="Orixium"
                  className="hidden h-10 w-auto dark:block"
                />
                Orixium
              </span>
            </Link>

            <nav className="hidden h-16 items-center gap-6 md:flex">
              {navItems.map((item) => {
                return (
                  <NavItem
                    key={item.to || item.label}
                    to={item.to}
                    label={item.label}
                    children={item.children}
                  />
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
                <div className="absolute left-1/2 top-full z-1000 mt-0 w-56 -translate-x-1/2 rounded-md border border-border bg-bg py-2 shadow-sm">
                  {navItems.map((item) => {
                    if (item.children && item.children.length) {
                      return (
                        <div key={item.label} className="px-4 py-2">
                          <div className="text-xs uppercase text-muted">{item.label}</div>
                          <div className="mt-1 space-y-1">
                            {item.children.map((child) => {
                              return (
                                <Link
                                  key={child.to}
                                  to={child.to}
                                  onClick={handleCloseMenu}
                                  className="block text-sm text-ink hover:text-accent"
                                >
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

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
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                <NotificationsMenu isActive={isAuthenticated} />
                <Link
                  to="/portfolio"
                  className="cursor-pointer rounded-md p-1 text-ink hover:text-accent"
                  aria-label="Portfolio"
                >
                  {/* TODO
                                    <ChartPieIcon
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    /> */}
                </Link>
                <HeaderDropdown
                  label={userLabel}
                  align="right"
                  wrapperClassName="h-16 flex items-center"
                  buttonClassName="cursor-pointer h-16 flex items-center px-1 text-sm text-ink hover:text-accent"
                >
                  <div className="flex items-center justify-between px-4 py-2 text-ink">
                    <span>Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link to="/settings" className="block px-4 py-2 text-ink hover:text-accent">
                    Settings
                  </Link>
                </HeaderDropdown>
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
