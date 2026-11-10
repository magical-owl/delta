import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AppProgress } from "./app-progress";

describe("AppProgress", () => {
  it("renders a progressbar with correct accessibility attributes", () => {
    render(<AppProgress value={65} max={100} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "65");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders percentage label when showLabel is true", () => {
    render(<AppProgress value={40} max={100} showLabel />);
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("handles indeterminate state when value is null", () => {
    render(<AppProgress value={null} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).not.toHaveAttribute("aria-valuenow");
  });

  it("clamps values between 0 and 100", () => {
    render(<AppProgress value={150} max={100} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "100");
  });
});
