import { createContext, useContext, useEffect, useState } from "react";
import {
  applyTheme,
  getInitialTheme,
  hasUserThemePreference,
  setTheme as persistTheme,
} from "../../utils/theme.js";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme());

  const applyCurrentTheme = () => {
    applyTheme(theme);
  };

  useEffect(applyCurrentTheme, [theme]);

  const handleSystemPreference = () => {
    if (!window.matchMedia) return undefined;
    if (hasUserThemePreference()) return undefined;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const nextTheme = media.matches ? "dark" : "light";
      applyTheme(nextTheme);
      setThemeState(nextTheme);
    };

    media.addEventListener("change", handleChange);
    return () => {
      media.removeEventListener("change", handleChange);
    };
  };

  useEffect(handleSystemPreference, []);

  const setTheme = (nextTheme) => {
    const resolvedTheme = persistTheme(nextTheme);
    setThemeState(resolvedTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return ctx;
};
