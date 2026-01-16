// src/components/ui/theme-toggle.jsx
import { useState } from "react";
import { toggleTheme } from "../../lib/theme.js";

export function ThemeToggle() {
  const [_, force] = useState(0);

  function onClick() {
    toggleTheme();
    force(function (x) {
      return x + 1;
    });
  }

  // sin iconos aún: texto
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-md border px-3 py-1 text-sm text-ink"
    >
      Theme
    </button>
  );
}
