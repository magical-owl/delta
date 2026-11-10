import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminHeader } from "@/components/admin/admin-header";
import { SidebarProvider } from "@/hooks/use-sidebar";

// Mock next/navigation — AdminHeader uses useSidebar (via SidebarProvider), not pathname
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

/** Wrap component in SidebarProvider for useSidebar context */
function renderWithSidebar(ui: React.ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

describe("AdminHeader", () => {
  it("displays the title prop", () => {
    renderWithSidebar(<AdminHeader title="Overview" />);
    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
  });

  it("displays the subtitle when provided", () => {
    renderWithSidebar(<AdminHeader title="Overview" subtitle="System telemetry" />);
    expect(screen.getByText("System telemetry")).toBeInTheDocument();
  });

  it("does not render a subtitle element when omitted", () => {
    renderWithSidebar(<AdminHeader title="Overview" />);
    expect(screen.queryByText(/telemetry/)).not.toBeInTheDocument();
  });

  it("renders the mobile menu button with accessible label", () => {
    renderWithSidebar(<AdminHeader title="Overview" />);
    expect(
      screen.getByRole("button", { name: "Open navigation menu" })
    ).toBeInTheDocument();
  });

  it("notification button has an accessible aria-label", () => {
    renderWithSidebar(<AdminHeader title="Overview" />);
    expect(
      screen.getByRole("button", { name: "Open notifications" })
    ).toBeInTheDocument();
  });

  it("opens the notifications popover on click", async () => {
    const user = userEvent.setup();
    renderWithSidebar(<AdminHeader title="Overview" />);

    const notifButton = screen.getByRole("button", { name: "Open notifications" });
    await user.click(notifButton);

    expect(screen.getByRole("dialog", { name: "Notifications" })).toBeInTheDocument();
  });

  it("closes the notifications popover via the close button", async () => {
    const user = userEvent.setup();
    renderWithSidebar(<AdminHeader title="Overview" />);

    await user.click(screen.getByRole("button", { name: "Open notifications" }));
    expect(screen.getByRole("dialog", { name: "Notifications" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close notifications" }));
    expect(
      screen.queryByRole("dialog", { name: "Notifications" })
    ).not.toBeInTheDocument();
  });

  it("closes notifications popover on Escape key press", async () => {
    const user = userEvent.setup();
    renderWithSidebar(<AdminHeader title="Overview" />);

    await user.click(screen.getByRole("button", { name: "Open notifications" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
