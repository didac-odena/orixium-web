const STORAGE_KEY = "orixium.ui.theme"; // "light" | "dark"
const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

function getStoredTheme() {
  // Read theme preference from localStorage, if any.
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (storedValue === THEMES.LIGHT || storedValue === THEMES.DARK) {
      return storedValue;
    }
    return null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  if (typeof window === "undefined") return THEMES.LIGHT;
  if (!window.matchMedia) return THEMES.LIGHT;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? THEMES.DARK
    : THEMES.LIGHT;
}

export function getInitialTheme() {
  return getStoredTheme() || getSystemTheme();
}

export function hasUserThemePreference() {
  return Boolean(getStoredTheme());
}

export function applyTheme(theme) {
  // Apply class + data attribute so CSS can react to theme changes.
  const root = document.documentElement; // <html>
  const body = document.body;
  if (theme === THEMES.DARK) {
    root.classList.add("dark");
    body?.classList.add("dark");
  } else {
    root.classList.remove("dark");
    body?.classList.remove("dark");
  }
  root.dataset.theme = theme;
}

export function setTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
  applyTheme(theme);
  return theme;
}
