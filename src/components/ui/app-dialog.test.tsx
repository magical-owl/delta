import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { AppDialog } from "./app-dialog";

describe("AppDialog", () => {
  it("does not render when isOpen is false", () => {
    render(
      <AppDialog isOpen={false} onClose={vi.fn()} title="Test Dialog">
        Dialog Content
      </AppDialog>
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders when isOpen is true and displays title and content", () => {
    render(
      <AppDialog isOpen={true} onClose={vi.fn()} title="Test Dialog">
        Dialog Content
      </AppDialog>
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Test Dialog")).toBeDefined();
    expect(screen.getByText("Dialog Content")).toBeDefined();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <AppDialog isOpen={true} onClose={handleClose} title="Test Dialog">
        Dialog Content
      </AppDialog>
    );

    const closeBtn = screen.getByLabelText("Close dialog");
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <AppDialog isOpen={true} onClose={handleClose} title="Test Dialog">
        Dialog Content
      </AppDialog>
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
