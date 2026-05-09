"use client";

import { Moon, Sun } from "lucide-react";
import { setTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

// Gunakan CSS dark:hidden/dark:block supaya tidak ada hydration mismatch.
// Server dan client render dua ikon sekaligus; visibility dikontrol class Tailwind.
export function ThemeToggle({ className }: { className?: string }) {
  function handleToggle() {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
      aria-label="Ganti tema"
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="h-4 w-4 hidden dark:block" />
    </button>
  );
}
