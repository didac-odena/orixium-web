import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { toggleTheme } from "../../utils/theme.js";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(function () {
    // Read initial state from the document class.
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function onClick() {
    // Toggle theme and reflect the new DOM state.
    toggleTheme();
    setIsDark(document.documentElement.classList.contains("dark"));
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer p-1 text-ink hover:text-accent"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <MoonIcon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <SunIcon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
