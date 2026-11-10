import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AppDrawer } from "./app-drawer";

describe("AppDrawer", () => {
  it("does not render when isOpen is false", () => {
    render(
      <AppDrawer isOpen={false} onClose={() => {}}>
        <p>Drawer Content</p>
      </AppDrawer>
    );
    expect(screen.queryByText("Drawer Content")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true with dialog role and title", () => {
    render(
      <AppDrawer
        isOpen={true}
        onClose={() => {}}
        title="Settings Drawer"
        description="Configure your preferences"
      >
        <p>Drawer Content</p>
      </AppDrawer>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Settings Drawer")).toBeInTheDocument();
    expect(screen.getByText("Configure your preferences")).toBeInTheDocument();
    expect(screen.getByText("Drawer Content")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AppDrawer isOpen={true} onClose={handleClose} title="Panel">
        <p>Content</p>
      </AppDrawer>
    );

    const closeButton = screen.getByRole("button", { name: /close panel/i });
    await user.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AppDrawer isOpen={true} onClose={handleClose} title="Panel">
        <p>Content</p>
      </AppDrawer>
    );

    await user.keyboard("{Escape}");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
