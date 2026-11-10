import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AppAvatar } from "./app-avatar";

describe("AppAvatar", () => {
  it("renders image when src is provided", () => {
    render(<AppAvatar src="/avatar.png" alt="Jane Doe" />);
    const img = screen.getByRole("img", { name: "Jane Doe" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/avatar.png");
  });

  it("renders initials fallback when src is absent", () => {
    render(<AppAvatar fallback="JD" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders icon fallback when both src and fallback are absent", () => {
    const { container } = render(<AppAvatar />);
    const icon = container.querySelector("i.fa-user");
    expect(icon).toBeInTheDocument();
  });

  it("renders status indicator dot with accessible status role and label", () => {
    render(<AppAvatar fallback="AB" status="online" />);
    const statusDot = screen.getByRole("status");
    expect(statusDot).toBeInTheDocument();
    expect(statusDot).toHaveAttribute("aria-label", "Status: online");
  });
});
