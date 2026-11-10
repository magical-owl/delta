import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Alert, AlertTitle, AlertDescription } from "./alert";

describe("Alert component", () => {
  it("renders with role=alert and displays title and message", () => {
    render(
      <Alert variant="success">
        <AlertTitle>Validation Succeeded</AlertTitle>
        <AlertDescription>Your domain submission was received.</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass("border-emerald-500/50");
    expect(screen.getByText(/validation succeeded/i)).toBeInTheDocument();
    expect(screen.getByText(/domain submission was received/i)).toBeInTheDocument();
  });
});
