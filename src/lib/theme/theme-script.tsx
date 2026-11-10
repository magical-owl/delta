import * as React from "react";
import { THEME_STORAGE_KEY } from "./theme-types";

/**
 * Pre-hydration script to set data-theme and colorScheme on <html> before first paint.
 * Prevents wrong-theme flash and respects user preferences.
 */
export function ThemeScript() {
  const code = `
    (function() {
      try {
        var key = "${THEME_STORAGE_KEY}";
        var stored = localStorage.getItem(key);
        var theme = (stored === "dark" || stored === "light") ? stored : "light";
        document.documentElement.setAttribute("data-theme", theme);
        document.documentElement.style.colorScheme = theme;
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "light");
        document.documentElement.style.colorScheme = "light";
      }
    })();
  `.trim();

  return (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{ __html: code }}
      suppressHydrationWarning
    />
  );
}
