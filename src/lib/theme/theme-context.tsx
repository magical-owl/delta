"use client";

import * as React from "react";
import {
  Theme,
  ThemeContextValue,
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
  isValidTheme,
} from "./theme-types";

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(defaultTheme: Theme): Theme {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  // 1. Check existing data-theme on html (set by pre-hydration script)
  const currentAttr = document.documentElement.getAttribute("data-theme");
  if (isValidTheme(currentAttr)) {
    return currentAttr;
  }

  // 2. Safe localStorage access
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidTheme(stored)) {
      return stored;
    }
  } catch {
    // Storage access may throw in restricted environments (e.g. sandbox or private mode)
  }

  return defaultTheme;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    getInitialTheme(defaultTheme)
  );

  // Apply theme to DOM and persist to localStorage
  const applyTheme = React.useCallback((nextTheme: Theme) => {
    if (!isValidTheme(nextTheme)) return;

    setThemeState(nextTheme);

    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", nextTheme);
      document.documentElement.style.colorScheme = nextTheme;

      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // Safe fail if storage is restricted
      }
    }
  }, []);

  // Ensure root DOM attribute is synchronized
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Cross-tab synchronization
  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isValidTheme(event.newValue)) {
        setThemeState(event.newValue);
        document.documentElement.setAttribute("data-theme", event.newValue);
        document.documentElement.style.colorScheme = event.newValue;
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = React.useCallback(() => {
    applyTheme(theme === "light" ? "dark" : "light");
  }, [applyTheme, theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: applyTheme,
      toggleTheme,
      isDark: theme === "dark",
    }),
    [theme, applyTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    return {
      theme: "light",
      isDark: false,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
