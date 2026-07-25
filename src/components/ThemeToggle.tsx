import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "lamha-theme";

function getInitial(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const initial = getInitial();
    setTheme(initial);
    apply(initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)] shadow-sm transition hover:text-[var(--brand)] ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
