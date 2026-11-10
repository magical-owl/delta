"use client";

import * as React from "react";
import { AppDateInput } from "@/components/ui/app-date-input";
import { AppAlert } from "@/components/ui/app-alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function DatesShowcasePage() {
  const [startDate, setStartDate] = React.useState("2026-11-01");
  const [endDate, setEndDate] = React.useState("2026-11-15");

  const isInvalidRange = Boolean(startDate && endDate && endDate < startDate);

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Date & Time Pickers
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Timezone-safe native date inputs, datetime-local controls, bounds constraints,
          and range validation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Date Pickers */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Date Controls</CardTitle>
            <CardDescription>
              Native date picker with Font Awesome calendar icon
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <AppDateInput
              label="Audit Start Date"
              defaultValue="2026-11-10"
              helperText="ISO-8601 date format (YYYY-MM-DD)."
            />

            <AppDateInput
              label="Release Timestamp"
              type="datetime-local"
              defaultValue="2026-11-10T14:30"
              helperText="Includes exact local hour and minute schedule."
            />

            <AppDateInput
              label="Fiscal Year Min/Max Bounds"
              type="date"
              min="2026-01-01"
              max="2026-12-31"
              defaultValue="2026-06-15"
              helperText="Constrained to calendar year 2026."
            />
          </CardContent>
        </Card>

        {/* States & Bounds */}
        <Card>
          <CardHeader>
            <CardTitle>Input States & Policies</CardTitle>
            <CardDescription>Disabled states and error indicators</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <AppDateInput
              label="Locked Genesis Timestamp"
              disabled
              defaultValue="2024-01-01"
              helperText="Fixed system initialization timestamp."
            />

            <AppDateInput
              label="Date with Error Message"
              defaultValue="2020-05-12"
              errorMessage="Date cannot precede the project inception date."
            />
          </CardContent>
        </Card>

        {/* Date Range Validation */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Interactive Date Range Validation</CardTitle>
            <CardDescription>
              Cross-validates start date against end date to enforce logical sequence
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {isInvalidRange && (
              <AppAlert variant="error" title="Invalid Date Range">
                The conclusion date cannot precede the inception date. Please adjust your
                range.
              </AppAlert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AppDateInput
                label="Inception Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                helperText="Initial day of the reporting period."
              />

              <AppDateInput
                label="Conclusion Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                errorMessage={
                  isInvalidRange ? "End date must be on or after start date." : undefined
                }
                helperText="Final day of the reporting period."
              />
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-muted)] flex items-center justify-between">
              <span>Selected Period:</span>
              <span className="font-mono font-semibold text-[var(--foreground)]">
                {startDate} → {endDate} {isInvalidRange ? "(INVALID)" : "(VALID)"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
