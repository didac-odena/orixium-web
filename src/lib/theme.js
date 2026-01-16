// src/lib/theme.js

const STORAGE_KEY = "orixium.ui.theme"; // "light" | "dark"
const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

function getStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === THEMES.LIGHT || value === THEMES.DARK) return value;
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

export function toggleTheme() {
  const current = document.documentElement.classList.contains("dark")
    ? THEMES.DARK
    : THEMES.LIGHT;

  const next = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
  return setTheme(next);
}
