import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Input } from "./input";

describe("Input component", () => {
  it("renders with placeholder and handles user typing", async () => {
    render(<Input placeholder="Enter email" />);
    const input = screen.getByPlaceholderText(/enter email/i);
    expect(input).toBeInTheDocument();

    await userEvent.type(input, "developer@delta.local");
    expect(input).toHaveValue("developer@delta.local");
  });

  it("applies error styling and aria-invalid when error is true", () => {
    render(<Input error aria-label="email-input" />);
    const input = screen.getByLabelText(/email-input/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("border-rose-500");
  });
});
