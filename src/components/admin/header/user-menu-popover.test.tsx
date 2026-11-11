import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenuPopover } from "./user-menu-popover";

const mockLogoutAction = vi.fn();

vi.mock("@/app/dashboard/actions/logout.action", () => ({
  logoutAction: () => mockLogoutAction(),
}));

describe("UserMenuPopover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the trigger button with accessible label", () => {
    render(<UserMenuPopover />);
    const trigger = screen.getByRole("button", { name: "Open user menu" });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens menu popover when clicked", async () => {
    const user = userEvent.setup();
    render(<UserMenuPopover />);

    const trigger = screen.getByRole("button", { name: "Open user menu" });
    await user.click(trigger);

    expect(screen.getByRole("menu", { name: "User menu" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Sign Out/ })).toBeInTheDocument();
  });

  it("invokes logoutAction on clicking Sign Out", async () => {
    const user = userEvent.setup();
    render(<UserMenuPopover />);

    const trigger = screen.getByRole("button", { name: "Open user menu" });
    await user.click(trigger);

    const signOutBtn = screen.getByRole("menuitem", { name: /Sign Out/ });
    await user.click(signOutBtn);

    expect(mockLogoutAction).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape key press", async () => {
    const user = userEvent.setup();
    render(<UserMenuPopover />);

    const trigger = screen.getByRole("button", { name: "Open user menu" });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
