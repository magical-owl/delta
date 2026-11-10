import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";

describe("Card components", () => {
  it("renders the complete card structure with semantic elements", () => {
    render(
      <Card data-testid="test-card">
        <CardHeader>
          <CardTitle>Architecture Status</CardTitle>
          <CardDescription>All modules verified</CardDescription>
        </CardHeader>
        <CardContent>Content Area</CardContent>
        <CardFooter>Footer Actions</CardFooter>
      </Card>
    );

    expect(screen.getByTestId("test-card")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /architecture status/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/all modules verified/i)).toBeInTheDocument();
    expect(screen.getByText(/content area/i)).toBeInTheDocument();
    expect(screen.getByText(/footer actions/i)).toBeInTheDocument();
  });
});
