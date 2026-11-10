import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import * as React from "react";
import { ThemeProvider, useTheme } from "./theme-context";
import { THEME_STORAGE_KEY } from "./theme-types";

function TestConsumer() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
    </div>
  );
}

describe("Theme System", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to light theme when localStorage is empty", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme").textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("restores dark theme from localStorage", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("falls back to light when localStorage contains an invalid theme value", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "invalid-theme");

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme").textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("toggles theme from light to dark and updates localStorage", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    const toggleButton = screen.getByText("Toggle");
    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("handles storage write errors gracefully without crashing", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    const toggleButton = screen.getByText("Toggle");
    expect(() => {
      act(() => {
        fireEvent.click(toggleButton);
      });
    }).not.toThrow();

    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
  });

  it("synchronizes theme when a storage event is fired from another tab", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme").textContent).toBe("light");

    act(() => {
      const storageEvent = new StorageEvent("storage", {
        key: THEME_STORAGE_KEY,
        newValue: "dark",
      });
      window.dispatchEvent(storageEvent);
    });

    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
  });
});
