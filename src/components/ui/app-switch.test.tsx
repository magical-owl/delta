import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { AppSwitch } from "./app-switch";

describe("AppSwitch", () => {
  it("renders switch with label and toggles on click", () => {
    const handleChange = vi.fn();
    render(
      <AppSwitch label="Enable alerts" defaultChecked={false} onChange={handleChange} />
    );

    const toggle = screen.getByRole("switch");
    expect(toggle.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("handles keyboard Enter and Space navigation", () => {
    const handleChange = vi.fn();
    render(
      <AppSwitch label="Keyboard switch" defaultChecked={false} onChange={handleChange} />
    );

    const toggle = screen.getByRole("switch");

    fireEvent.keyDown(toggle, { key: " " });
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(handleChange).toHaveBeenCalledWith(true);

    fireEvent.keyDown(toggle, { key: "Enter" });
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("does not toggle when disabled", () => {
    const handleChange = vi.fn();
    render(
      <AppSwitch
        label="Disabled switch"
        disabled
        defaultChecked={false}
        onChange={handleChange}
      />
    );

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeDisabled();

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    expect(handleChange).not.toHaveBeenCalled();
  });
});
