export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "admin-theme";

export const DEFAULT_THEME: Theme = "light";

export function isValidTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}
