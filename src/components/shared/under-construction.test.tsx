import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UnderConstruction } from "@/components/shared/under-construction";

describe("UnderConstruction", () => {
  it("renders the default title and description", () => {
    render(<UnderConstruction />);
    expect(
      screen.getByRole("heading", { name: "Under Construction" })
    ).toBeInTheDocument();
    expect(screen.getByText(/This section is being built out/)).toBeInTheDocument();
  });

  it("renders a custom title and description", () => {
    render(
      <UnderConstruction
        title="User Management"
        description="Coming soon — user directory."
      />
    );
    expect(screen.getByRole("heading", { name: "User Management" })).toBeInTheDocument();
    expect(screen.getByText("Coming soon — user directory.")).toBeInTheDocument();
  });

  it("renders a return link when returnHref is provided", () => {
    render(<UnderConstruction returnHref="/dashboard" returnLabel="Back to Dashboard" />);
    const link = screen.getByRole("link", { name: /Back to Dashboard/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("does not render a return link when returnHref is omitted", () => {
    render(<UnderConstruction />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("uses the default returnLabel when not specified", () => {
    render(<UnderConstruction returnHref="/dashboard" />);
    expect(screen.getByRole("link", { name: /Return to Overview/ })).toBeInTheDocument();
  });
});
