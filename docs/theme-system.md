# Theme System Architecture

## 1. Overview

The application features a zero-dependency, persistent light and dark theming engine with instantaneous synchronization, flash-of-unstyled-theme prevention, and complete cross-tab event mirroring.

### Key Specifications:

- **Storage Key**: `admin-theme`
- **Supported Values**: `"light"` | `"dark"`
- **Default Theme**: `"light"`
- **DOM Integration**: `data-theme` attribute and `color-scheme` style on `<html>`

---

## 2. Preventing Flash of Unstyled Theme (FOUC)

To prevent screen flickering or theme mismatch during hydration, a small synchronous pre-hydration script (`ThemeScript`) executes in `<head>` before the DOM renders:

```tsx
// src/lib/theme/theme-script.tsx
export function ThemeScript({ defaultTheme = "light" }: { defaultTheme?: string }) {
  const scriptContent = `
    (function() {
      try {
        var key = 'admin-theme';
        var stored = localStorage.getItem(key);
        var theme = (stored === 'dark' || stored === 'light') ? stored : '${defaultTheme}';
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
      } catch (e) {
        document.documentElement.setAttribute('data-theme', '${defaultTheme}');
        document.documentElement.style.colorScheme = '${defaultTheme}';
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: scriptContent }} />;
}
```

The root `<html>` element in `src/app/layout.tsx` is marked with `suppressHydrationWarning` to allow the pre-hydration script to set the attribute prior to React hydration.

---

## 3. Theme Provider & Reactive Hook

State is managed by `ThemeProvider` in `src/lib/theme/theme-context.tsx`:

```tsx
import { useTheme } from "@/lib/theme/theme-context";

export function ExampleComponent() {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  return (
    <button onClick={toggleTheme} aria-label="Toggle theme">
      Current: {theme}
    </button>
  );
}
```

### Safety & Resiliency:

- **Private Browsing / Quota Exceeded**: Safe try/catch wrappers prevent crashes when `localStorage` writes fail.
- **Cross-Tab Synchronization**: Listens to the `window.storage` event. If the user changes theme in one tab, all other tabs synchronize immediately without reload.
- **SSR & Test Fallbacks**: If invoked outside a `ThemeProvider` (such as in isolated unit tests), `useTheme()` safely returns default `{ theme: "light", isDark: false }` rather than throwing an exception.

---

## 4. Theme Tokens & CSS Variables

Tokens are declared in `src/app/globals.css` under `[data-theme="light"]` and `[data-theme="dark"]`, and mapped to Tailwind utilities via `@theme`:

| Token                  | Light Value | Dark Value | Purpose                              |
| ---------------------- | ----------- | ---------- | ------------------------------------ |
| `--background`         | `#F4F5F2`   | `#18242F`  | Main app background canvas           |
| `--foreground`         | `#192E32`   | `#E8EFF2`  | High-contrast primary text           |
| `--surface`            | `#FFFFFF`   | `#22323E`  | Standard card and container surface  |
| `--surface-elevated`   | `#FFFFFF`   | `#2A3C49`  | Popovers, dialogs, floating panels   |
| `--surface-muted`      | `#EDF1EE`   | `#2B3B47`  | Table headers, secondary chips       |
| `--text-muted`         | `#566A67`   | `#B6C6CF`  | Captions, metadata, helper text      |
| `--sidebar-bg`         | `#172632`   | `#111D27`  | Deep sidebar background              |
| `--sidebar-foreground` | `#F4F7F6`   | `#E8EFF2`  | Sidebar navigation text              |
| `--sidebar-active`     | `#305B60`   | `#305B60`  | Active navigation item highlight     |
| `--border`             | `#DFE6E2`   | `#415561`  | Dividers, card borders, separators   |
| `--input-bg`           | `#FFFFFF`   | `#1B2B37`  | Input field surface                  |
| `--input-border`       | `#C6D1CD`   | `#647A88`  | Input border outline                 |
| `--primary`            | `#386E69`   | `#79B8AC`  | Accent action color                  |
| `--primary-foreground` | `#FFFFFF`   | `#102B29`  | Text placed on top of primary button |
| `--focus-ring`         | `#4B8881`   | `#9AD6C8`  | Keyboard focus ring                  |
