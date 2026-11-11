import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarLogout } from "./sidebar-logout";

const mockLogoutAction = vi.fn();

vi.mock("@/app/dashboard/actions/logout.action", () => ({
  logoutAction: () => mockLogoutAction(),
}));

describe("SidebarLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with label when expanded", () => {
    render(<SidebarLogout isCollapsed={false} />);
    const button = screen.getByRole("button", { name: "Sign out" });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  it("renders with title attribute when collapsed", () => {
    render(<SidebarLogout isCollapsed={true} />);
    const button = screen.getByRole("button", { name: "Sign out" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("title", "Sign out");
    expect(screen.queryByText("Sign Out")).not.toBeInTheDocument();
  });

  it("calls logoutAction when clicked", async () => {
    const user = userEvent.setup();
    render(<SidebarLogout isCollapsed={false} />);

    const button = screen.getByRole("button", { name: "Sign out" });
    await user.click(button);

    expect(mockLogoutAction).toHaveBeenCalledTimes(1);
  });
});
