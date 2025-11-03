"use client";

import { useTheme } from "@/providers/theme";
import { combineClass } from "@/utils/combineClass";

export default function ThemeToggleButton({
  className,
}: {
  className?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      onClick={toggleTheme}
      className={combineClass(
        "flex size-10 items-center justify-center border-l-2 border-l-black text-lg text-neutral-800 transition-colors hover:bg-9gray focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-9blueDark dark:border-l-9gray dark:text-9gray dark:hover:bg-9darkPanel",
        className,
      )}
      data-state={isDark ? "on" : "off"}
    >
      <span role="img" aria-hidden="true">
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
