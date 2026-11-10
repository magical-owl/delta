import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { AppTable, type Column } from "./app-table";

interface TestRow {
  id: string;
  name: string;
  score: number;
  [key: string]: unknown;
}

const mockData: TestRow[] = [
  { id: "1", name: "Alpha", score: 90 },
  { id: "2", name: "Bravo", score: 75 },
  { id: "3", name: "Charlie", score: 85 },
];

const mockColumns: Column<TestRow>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "score", header: "Score", sortable: true },
];

describe("AppTable", () => {
  it("renders table headers and data rows", () => {
    render(
      <AppTable data={mockData} columns={mockColumns} keyExtractor={(row) => row.id} />
    );

    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Score")).toBeDefined();
    expect(screen.getByText("Alpha")).toBeDefined();
    expect(screen.getByText("Bravo")).toBeDefined();
    expect(screen.getByText("Charlie")).toBeDefined();
  });

  it("filters rows when search query is typed", () => {
    render(
      <AppTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(row) => row.id}
        searchable
        searchPlaceholder="Search records..."
      />
    );

    const searchInput = screen.getByPlaceholderText("Search records...");
    fireEvent.change(searchInput, { target: { value: "Bravo" } });

    expect(screen.queryByText("Alpha")).toBeNull();
    expect(screen.getByText("Bravo")).toBeDefined();
    expect(screen.queryByText("Charlie")).toBeNull();
  });

  it("sorts rows when sortable header is clicked", () => {
    render(
      <AppTable data={mockData} columns={mockColumns} keyExtractor={(row) => row.id} />
    );

    const nameHeader = screen.getByText("Name");
    // Click once for asc
    fireEvent.click(nameHeader);
    let cells = screen.getAllByRole("cell");
    expect(cells[0].textContent).toBe("Alpha");

    // Click again for desc
    fireEvent.click(nameHeader);
    cells = screen.getAllByRole("cell");
    expect(cells[0].textContent).toBe("Charlie");
  });

  it("handles multi-row selection", () => {
    const handleSelection = vi.fn();
    render(
      <AppTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(row) => row.id}
        selectable
        onSelectionChange={handleSelection}
      />
    );

    const row1Checkbox = screen.getByLabelText("Select row 1");
    fireEvent.click(row1Checkbox);

    expect(handleSelection).toHaveBeenCalledWith(["1"]);
  });

  it("renders empty message when no records are present", () => {
    render(
      <AppTable
        data={[]}
        columns={mockColumns}
        keyExtractor={(row) => row.id}
        emptyMessage="Custom empty notice"
      />
    );

    expect(screen.getByText("Custom empty notice")).toBeDefined();
  });
});
