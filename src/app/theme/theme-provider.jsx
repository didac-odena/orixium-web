import { useEffect } from "react";
import { applyTheme, getInitialTheme, hasUserThemePreference } from "../../utils/theme.js";

export function ThemeProvider(props) {
  const children = props.children;

  useEffect(function () {
    // Apply initial theme (stored preference wins over system).
    const initial = getInitialTheme();
    applyTheme(initial);

    // If the user hasn't picked a theme, follow OS preference changes.
    if (!window.matchMedia) return;
    if (hasUserThemePreference()) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function onChange() {
      applyTheme(media.matches ? "dark" : "light");
    }

    // Support modern and legacy matchMedia listeners.
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

  // ThemeProvider only wires behavior; it doesn't render UI.
  return children;
}
