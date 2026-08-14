import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "palimpsest-theme";

function getInitialTheme() {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
  }
  return "dark";
}

/**
 * Labeled Day/Night pill switch. Flips the `data-theme` attribute on <html>
 * between "dark" (night mood, default) and "light" (day mood). Persisted to
 * localStorage; index.html applies the saved value before first paint so
 * there's no flash of the wrong theme.
 */
export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable — theme just won't persist across visits
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const isLight = theme === "light";

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Switch to night mood" : "Switch to day mood"}
      title={isLight ? "Switch to night mood" : "Switch to day mood"}
      aria-pressed={isLight}
      className={`group relative inline-flex items-center gap-2 rounded-full border border-ink-line bg-ink-soft pl-1 pr-3 py-1 transition-all duration-300 hover:border-scan ${className}`}
    >
      <span
        className={`relative flex items-center justify-center w-6 h-6 rounded-full bg-ink border transition-colors duration-300 ${
          isLight ? "border-bronze-bright" : "border-scan/60"
        } group-hover:border-scan`}
      >
        <Sun
          className={`w-3.5 h-3.5 absolute text-bronze-bright transition-all duration-300 ${
            isLight ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-90"
          }`}
        />
        <Moon
          className={`w-3.5 h-3.5 absolute text-scan transition-all duration-300 ${
            isLight ? "opacity-0 scale-50 -rotate-90" : "opacity-100 scale-100 rotate-0"
          }`}
        />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim w-8 text-left">
        {isLight ? "Day" : "Night"}
      </span>
    </button>
  );
}
