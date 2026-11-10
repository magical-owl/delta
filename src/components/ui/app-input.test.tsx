import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { AppInput } from "./app-input";

describe("AppInput", () => {
  it("renders with label and helper text", () => {
    render(
      <AppInput
        label="Username"
        placeholder="Enter username"
        helperText="Alphanumeric only"
      />
    );

    expect(screen.getByLabelText("Username")).toBeDefined();
    expect(screen.getByText("Alphanumeric only")).toBeDefined();
    expect(screen.getByPlaceholderText("Enter username")).toBeDefined();
  });

  it("renders error message and marks aria-invalid", () => {
    render(<AppInput label="Email" errorMessage="Email address is required" />);

    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toContain("Email address is required");
  });

  it("toggles password visibility between password and text types", () => {
    render(
      <AppInput
        label="Password"
        type="password"
        showPasswordToggle
        defaultValue="secret123"
      />
    );

    const input = screen.getByLabelText("Password");
    expect(input.getAttribute("type")).toBe("password");

    const toggleBtn = screen.getByLabelText("Show password");
    fireEvent.click(toggleBtn);

    expect(input.getAttribute("type")).toBe("text");
    expect(screen.getByLabelText("Hide password")).toBeDefined();

    fireEvent.click(screen.getByLabelText("Hide password"));
    expect(input.getAttribute("type")).toBe("password");
  });
});
