import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "./badge";

describe("Badge component", () => {
  it("renders with default styling", () => {
    render(<Badge>Production Ready</Badge>);
    const badge = screen.getByText(/production ready/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-slate-900");
  });

  it("renders success variant", () => {
    render(<Badge variant="success">Active</Badge>);
    const badge = screen.getByText(/active/i);
    expect(badge).toHaveClass("bg-emerald-100");
  });
});
