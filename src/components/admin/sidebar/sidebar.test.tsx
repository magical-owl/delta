import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "@/components/admin/sidebar/sidebar";
import { SidebarProvider } from "@/hooks/use-sidebar";

// Mock next/navigation — SidebarNavItem uses usePathname
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

function renderWithProvider(ui: React.ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

describe("Sidebar", () => {
  it("renders in expanded state by default and shows nav labels", () => {
    renderWithProvider(<Sidebar />);
    // Nav labels visible when expanded
    expect(screen.getByRole("link", { name: /Overview/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Users/ })).toBeInTheDocument();
  });

  it("toggle button has correct aria-expanded when expanded", () => {
    renderWithProvider(<Sidebar />);
    const toggle = screen.getByRole("button", { name: /Collapse sidebar navigation/ });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("changes aria-expanded after toggling the sidebar", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Sidebar />);

    const toggle = screen.getByRole("button", { name: /Collapse sidebar navigation/ });
    await user.click(toggle);

    // After collapse, the button label changes to "Expand sidebar navigation"
    expect(
      screen.getByRole("button", { name: /Expand sidebar navigation/ })
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("mobile drawer is not visible by default", () => {
    renderWithProvider(<Sidebar />);
    // The dialog is only rendered when isMobileOpen is true
    expect(
      screen.queryByRole("dialog", { name: "Navigation menu" })
    ).not.toBeInTheDocument();
  });
});
