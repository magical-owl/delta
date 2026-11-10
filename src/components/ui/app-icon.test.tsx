import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AppIcon } from "./app-icon";

describe("AppIcon Component", () => {
  it("renders Font Awesome webfont classes and hides from screen readers by default", () => {
    const { container } = render(<AppIcon name="chart-pie" />);
    const icon = container.querySelector("i");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("fa-solid", "fa-chart-pie");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("applies the requested size class mapping", () => {
    const { container } = render(<AppIcon name="bell" size="lg" />);
    const icon = container.querySelector("i");
    expect(icon).toHaveClass("text-base");
  });

  it("renders accessible screen reader label when srLabel is provided", () => {
    render(<AppIcon name="bell" srLabel="Unread alerts" />);
    const srText = screen.getByText("Unread alerts");
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass("sr-only");
  });
});
