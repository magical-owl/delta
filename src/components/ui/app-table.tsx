"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { AppIcon } from "./app-icon";
import { AppCheckbox } from "./app-checkbox";
import { AppInput } from "./app-input";
import { AppButton } from "./app-button";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export type SortDirection = "asc" | "desc" | null;

export interface AppTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  selectedKeys?: (string | number)[];
  onSelectionChange?: (keys: (string | number)[]) => void;
  pageSize?: number;
  className?: string;
}

export function AppTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No records found.",
  searchable = false,
  searchPlaceholder = "Search records...",
  selectable = false,
  selectedKeys: controlledSelectedKeys,
  onSelectionChange,
  pageSize = 10,
  className,
}: AppTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [internalSelectedKeys, setInternalSelectedKeys] = React.useState<
    (string | number)[]
  >([]);

  const selectedKeys =
    controlledSelectedKeys !== undefined ? controlledSelectedKeys : internalSelectedKeys;

  const handleSelectionChange = (keys: (string | number)[]) => {
    if (controlledSelectedKeys === undefined) {
      setInternalSelectedKeys(keys);
    }
    onSelectionChange?.(keys);
  };

  // 1. Search Filter
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery]);

  // 2. Sorting
  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const compare = aVal < bVal ? -1 : 1;
      return sortDirection === "asc" ? compare : -compare;
    });
  }, [filteredData, sortKey, sortDirection]);

  // 3. Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setCurrentPage(1);
    if (sortKey === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Selection handlers
  const allCurrentKeys = paginatedData.map(keyExtractor);
  const isAllCurrentSelected =
    allCurrentKeys.length > 0 && allCurrentKeys.every((k) => selectedKeys.includes(k));
  const isPartiallySelected =
    !isAllCurrentSelected && allCurrentKeys.some((k) => selectedKeys.includes(k));

  const toggleSelectAll = () => {
    if (isAllCurrentSelected) {
      handleSelectionChange(selectedKeys.filter((k) => !allCurrentKeys.includes(k)));
    } else {
      const newKeys = Array.from(new Set([...selectedKeys, ...allCurrentKeys]));
      handleSelectionChange(newKeys);
    }
  };

  const toggleSelectRow = (key: string | number) => {
    if (selectedKeys.includes(key)) {
      handleSelectionChange(selectedKeys.filter((k) => k !== key));
    } else {
      handleSelectionChange([...selectedKeys, key]);
    }
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs overflow-hidden",
        className
      )}
    >
      {/* Table Toolbar */}
      {searchable && (
        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-4">
          <div className="max-w-sm w-full">
            <AppInput
              leftIcon="magnifying-glass"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label={searchPlaceholder}
            />
          </div>
          {selectable && selectedKeys.length > 0 && (
            <span className="text-xs font-medium text-[var(--primary)] bg-[var(--color-selected-bg)] px-2.5 py-1 rounded-md">
              {selectedKeys.length} selected
            </span>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]">
              {selectable && (
                <th scope="col" className="w-12 px-4 py-3 text-center">
                  <AppCheckbox
                    checked={isAllCurrentSelected}
                    indeterminate={isPartiallySelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all rows on current page"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--text-muted)]",
                      col.sortable &&
                        "cursor-pointer select-none hover:text-[var(--foreground)]",
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <AppIcon name="sort-up" />
                            ) : (
                              <AppIcon name="sort-down" />
                            )
                          ) : (
                            <AppIcon name="sort" className="opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={`loading-${i}`} className="animate-pulse">
                  {selectable && (
                    <td className="px-4 py-3.5 text-center">
                      <div className="w-4 h-4 rounded bg-[var(--border)] mx-auto" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 rounded bg-[var(--border)] w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 text-center text-[var(--text-muted)]"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AppIcon name="table" size="lg" className="opacity-40" />
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              paginatedData.map((row, idx) => {
                const key = keyExtractor(row);
                const isSelected = selectedKeys.includes(key);

                return (
                  <tr
                    key={String(key)}
                    className={cn(
                      "transition-colors",
                      isSelected
                        ? "bg-[var(--table-selected)]"
                        : "hover:bg-[var(--table-hover)]"
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3 text-center">
                        <AppCheckbox
                          checked={isSelected}
                          onChange={() => toggleSelectRow(key)}
                          aria-label={`Select row ${String(key)}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-[var(--foreground)]",
                          col.className
                        )}
                      >
                        {col.render
                          ? col.render(row, idx)
                          : (row[col.key] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && sortedData.length > 0 && (
        <div className="p-3.5 border-t border-[var(--border)] bg-[var(--surface)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div>
            Showing{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {Math.min(sortedData.length, (currentPage - 1) * pageSize + 1)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {Math.min(sortedData.length, currentPage * pageSize)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {sortedData.length}
            </span>{" "}
            entries
          </div>

          <div className="flex items-center gap-1.5">
            <AppButton
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
              leftIcon="angle-left"
            >
              Prev
            </AppButton>
            <span className="px-2 text-xs font-medium text-[var(--foreground)]">
              Page {currentPage} of {totalPages}
            </span>
            <AppButton
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
              rightIcon="angle-right"
            >
              Next
            </AppButton>
          </div>
        </div>
      )}
    </div>
  );
}

AppTable.displayName = "AppTable";
