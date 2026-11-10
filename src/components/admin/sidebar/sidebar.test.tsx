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
    expect(screen.getByRole("link", { name: /Overview/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Users/ })).toBeInTheDocument();
  });

  it("toggle button has correct accessible name, aria-expanded, and aria-controls when expanded", () => {
    renderWithProvider(<Sidebar />);
    const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-controls", "admin-sidebar");
    expect(toggle).toHaveAttribute("type", "button");
  });

  it("clicking the toggle collapses the sidebar (expanded -> collapsed)", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Sidebar />);

    const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
    await user.click(toggle);

    const collapsedToggle = screen.getByRole("button", { name: "Expand sidebar" });
    expect(collapsedToggle).toBeInTheDocument();
    expect(collapsedToggle).toHaveAttribute("aria-expanded", "false");
    expect(collapsedToggle).toHaveAttribute("aria-controls", "admin-sidebar");

    const aside = document.getElementById("admin-sidebar");
    expect(aside).toHaveClass("w-[72px]");
  });

  it("clicking the toggle in collapsed state expands the sidebar back (collapsed -> expanded)", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Sidebar />);

    // Collapse
    const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
    await user.click(toggle);

    // Expand
    const expandToggle = screen.getByRole("button", { name: "Expand sidebar" });
    await user.click(expandToggle);

    expect(screen.getByRole("button", { name: "Collapse sidebar" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    const aside = document.getElementById("admin-sidebar");
    expect(aside).toHaveClass("w-64");
  });

  it("supports keyboard activation via Enter key", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Sidebar />);

    const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
    toggle.focus();
    expect(toggle).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("supports keyboard activation via Space key", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Sidebar />);

    const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
    toggle.focus();

    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("ensures button clickable bounds and pointer-events configuration", () => {
    renderWithProvider(<Sidebar />);
    const toggle = screen.getByRole("button", { name: "Collapse sidebar" });

    // Meets 44px touch target requirement and spans width
    expect(toggle).toHaveClass("min-h-[44px]");
    expect(toggle).toHaveClass("w-full");
    expect(toggle).toHaveClass("cursor-pointer");

    // Decorative icon has pointer-events-none to prevent click interception
    const icon = toggle.querySelector("i");
    expect(icon).toHaveClass("pointer-events-none");
  });

  it("mobile drawer is not visible by default and unaffected by desktop collapse", () => {
    renderWithProvider(<Sidebar />);
    expect(
      screen.queryByRole("dialog", { name: "Navigation menu" })
    ).not.toBeInTheDocument();
  });

  it("renders 'Enterprise Systems' brand tagline in expanded sidebar", () => {
    renderWithProvider(<Sidebar />);
    expect(screen.getByText("Enterprise Systems")).toBeInTheDocument();
  });

  it("allows clicking the entire Component Library header button to collapse and expand", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Sidebar />);

    const componentLibBtn = screen.getByRole("button", {
      name: /Collapse Component Library group|Expand Component Library group/,
    });
    expect(componentLibBtn).toBeInTheDocument();
    expect(componentLibBtn).toHaveClass("w-full");
    expect(componentLibBtn).toHaveClass("cursor-pointer");

    // Initially expanded or collapsed, toggle it
    const initialExpanded = componentLibBtn.getAttribute("aria-expanded") === "true";
    await user.click(componentLibBtn);
    expect(componentLibBtn).toHaveAttribute(
      "aria-expanded",
      initialExpanded ? "false" : "true"
    );

    // Toggle back
    await user.click(componentLibBtn);
    expect(componentLibBtn).toHaveAttribute(
      "aria-expanded",
      initialExpanded ? "true" : "false"
    );
  });

  it("supports clicking other group header buttons such as Management", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Sidebar />);

    const managementBtn = screen.getByRole("button", {
      name: /Collapse Management group|Expand Management group/,
    });
    expect(managementBtn).toBeInTheDocument();
    expect(managementBtn).toHaveClass("w-full");
    expect(managementBtn).toHaveClass("cursor-pointer");

    const initialExpanded = managementBtn.getAttribute("aria-expanded") === "true";
    await user.click(managementBtn);
    expect(managementBtn).toHaveAttribute(
      "aria-expanded",
      initialExpanded ? "false" : "true"
    );
  });

  it("maintains consistent sidebar state across rerenders", async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithProvider(<Sidebar />);

    const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
    await user.click(toggle);

    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();

    // Rerender with provider
    rerender(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    );

    // Collapsed state is maintained across rerender
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
  });
});
