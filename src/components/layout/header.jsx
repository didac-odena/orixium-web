import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/auth/auth-context";
import { HeaderDropdown, ThemeToggle } from "../ui";
import NotificationsMenu from "./notifications-menu";
import { Bars3Icon, PowerIcon } from "@heroicons/react/24/outline";
import logoMarkLight from "../../assets/brand/orixium-logo-mark-colored.svg";
import logoMarkDark from "../../assets/brand/orixium-logo-mark-colored-dark.svg";

const NAV_PUBLIC = [];

const NAV_APP = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Market Explorer", to: "/market-explorer" },
  { label: "New Trade", to: "/new-trade" },
  { label: "Current Trades", to: "/current-trades" },

  { label: "Historial", to: "/historial" },
  { label: "Support", to: "/support" },
];

function NavItem({ to, label, children, onSelect }) {
  if (children && children.length) {
    return (
      <HeaderDropdown
        label={label}
        wrapperClassName="h-16 bg-bg z-15 flex items-center"
        buttonClassName="cursor-pointer z-15 bg-bg h-15 p-2 flex items-center text-muted hover:text-accent transition-colors"
      >
        {children.map((child) => {
          return (
            <Link
              key={child.to}
              to={child.to}
              onClick={onSelect}
              className="flex px-4 z-50 bg-bg py-2 whitespace-nowrap text-ink hover:text-accent"
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
      className="h-16 flex items-center p-2 text-muted hover:text-accent transition-colors"
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
    <header className="w-full z-15 border-b bg-bg border-border-strong">
      <div className="px-3 sm:px-6">
        <div className="relative flex h-16 items-center  gap-2 sm:gap-4">
          {/* Left: logo + nav (desktop) */}
          <div className="flex items-center h-15 gap-3 sm:gap-6">
            <Link to="/" className="text-2xl font-semibold">
              <span className="inline-flex p-2 items-center gap-2">
                <img
                  src={logoMarkLight}
                  alt="Orixium"
                  className="h-10 w-auto dark:hidden"
                />
                <img
                  src={logoMarkDark}
                  alt="Orixium"
                  className="hidden h-10 w-auto dark:block"
                />
                Orixium
              </span>
            </Link>

            <nav className="hidden h-16 items-center gap-2 md:flex">
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

          {/* Mobile menu button */}
          <div className="ml-auto md:hidden">
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
                <div className="absolute right-0 top-full z-1000 mt-2 w-64 rounded-md border border-border bg-surface-2 py-2 shadow-sm">
                  <div className="px-4 pb-2 text-xs uppercase text-muted">
                    Navigation
                  </div>
                  <div className="space-y-1 px-2">
                    {navItems.map((item) => {
                      if (item.children && item.children.length) {
                        return (
                          <div key={item.label} className="px-2 py-2">
                            <div className="text-xs uppercase text-muted">{item.label}</div>
                            <div className="mt-1 space-y-1">
                              {item.children.map((child) => {
                                return (
                                  <Link
                                    key={child.to}
                                    to={child.to}
                                    onClick={handleCloseMenu}
                                    className="block rounded px-2 py-1 text-sm text-ink hover:bg-surface"
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
                          className="block rounded px-2 py-1 text-sm text-ink hover:bg-surface"
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="my-2 border-t border-border" />

                  {isAuthenticated ? (
                    <div className="space-y-2 px-4 pb-2">
                      <div className="text-xs uppercase text-muted">Account</div>
                      <div className="flex items-center justify-between rounded border border-border bg-bg px-2 py-2">
                        <span className="text-sm text-ink">Theme</span>
                        <ThemeToggle />
                      </div>
                      <div className="flex items-center justify-between rounded border border-border bg-bg px-2 py-2">
                        <span className="text-sm text-ink">Notifications</span>
                        <NotificationsMenu isActive={isAuthenticated} isCompact={true} />
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-between rounded border border-border bg-bg px-2 py-2 text-sm text-ink hover:border-danger hover:text-danger"
                      >
                        Logout
                        <PowerIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 pb-2">
                      <Link
                        to="/login"
                        onClick={handleCloseMenu}
                        className="block rounded border border-border bg-bg px-3 py-2 text-center text-sm text-ink hover:border-accent hover:text-accent"
                      >
                        Login
                      </Link>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: actions */}
          <div className="ml-auto hidden items-center gap-2 sm:gap-1 md:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                <NotificationsMenu isActive={isAuthenticated} />
                <ThemeToggle />
                <HeaderDropdown
                  label={userLabel}
                  align="right"
                  wrapperClassName="h-16 flex items-center"
                  buttonClassName="cursor-pointer h-16 flex items-center px-1 text-sm text-ink hover:text-accent"
                ></HeaderDropdown>
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
