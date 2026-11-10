import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminFooter } from "@/components/admin/admin-footer";

describe("AdminFooter", () => {
  it("displays the current year", () => {
    render(<AdminFooter />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it("displays the default appName from siteConfig", () => {
    render(<AdminFooter />);
    // siteConfig.name is "Admin Workspace"
    expect(screen.getByText(/Admin Workspace/)).toBeInTheDocument();
  });

  it("displays a custom appName when provided", () => {
    render(<AdminFooter appName="My Custom App" />);
    expect(screen.getByText(/My Custom App/)).toBeInTheDocument();
  });

  it("renders a footer element", () => {
    render(<AdminFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
