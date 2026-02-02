import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../../contexts/theme/theme-context";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const handleToggle = () => {
        toggleTheme();
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
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
