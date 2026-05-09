"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
}

// ─── Module-level external store ───────────────────────────────────────────
const _listeners = new Set<() => void>();

let _theme: Theme = (() => {
  if (typeof window === "undefined") return "system";
  try {
    return (localStorage.getItem("theme") as Theme) || "system";
  } catch {
    return "system";
  }
})();

function subscribeTheme(cb: () => void) {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

function getThemeSnapshot(): Theme {
  return _theme;
}

function getThemeServerSnapshot(): Theme {
  return "system";
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function setTheme(t: Theme) {
  _theme = t;
  try {
    localStorage.setItem("theme", t);
  } catch {}
  const resolved: ResolvedTheme = t === "system" ? getSystemTheme() : t;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  _listeners.forEach((cb) => cb());
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useTheme(): ThemeContextValue {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );
  const resolvedTheme: ResolvedTheme =
    theme === "system" ? getSystemTheme() : theme;
  return { theme, resolvedTheme, setTheme };
}

// ─── Provider (no state needed — just passes children through) ──────────────
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
