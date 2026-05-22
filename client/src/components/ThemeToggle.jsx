import { Moon, Sun } from "lucide-react";
import { useAuth } from "../store/auth";

export function ThemeToggle() {
  const { theme, setTheme } = useAuth();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
