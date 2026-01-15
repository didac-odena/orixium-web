// src/app/theme/theme-provider.jsx
import { useEffect } from "react";
import { applyTheme, getInitialTheme, hasUserThemePreference } from "../../lib/theme.js";

export function ThemeProvider(props) {
  const children = props.children;

  useEffect(function () {
    // 1) aplica theme inicial (stored > system)
    const initial = getInitialTheme();
    applyTheme(initial);

    // 2) si NO hay preferencia guardada, reacciona a cambios del sistema
    if (!window.matchMedia) return;
    if (hasUserThemePreference()) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function onChange() {
      applyTheme(media.matches ? "dark" : "light");
    }

    // addEventListener moderno / fallback antiguo
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return function () {
        media.removeEventListener("change", onChange);
      };
    }

    media.addListener(onChange);
    return function () {
      media.removeListener(onChange);
    };
  }, []);

  return children;
}
