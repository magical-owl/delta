"use client";

import * as React from "react";
import { AppTable, type Column } from "@/components/ui/app-table";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton } from "@/components/ui/app-button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface MicroserviceItem {
  id: string;
  name: string;
  region: string;
  status: "healthy" | "warning" | "critical" | "offline";
  latencyMs: number;
  uptime: string;
  version: string;
  [key: string]: unknown;
}

const mockMicroservices: MicroserviceItem[] = [
  {
    id: "srv-001",
    name: "auth-gateway",
    region: "us-east-1",
    status: "healthy",
    latencyMs: 14,
    uptime: "99.99%",
    version: "v2.4.1",
  },
  {
    id: "srv-002",
    name: "billing-worker",
    region: "us-east-1",
    status: "healthy",
    latencyMs: 38,
    uptime: "99.95%",
    version: "v1.12.0",
  },
  {
    id: "srv-003",
    name: "ingestion-pipeline",
    region: "eu-central-1",
    status: "warning",
    latencyMs: 142,
    uptime: "98.50%",
    version: "v3.0.1-rc",
  },
  {
    id: "srv-004",
    name: "notification-broker",
    region: "ap-southeast-1",
    status: "healthy",
    latencyMs: 22,
    uptime: "99.98%",
    version: "v1.8.4",
  },
  {
    id: "srv-005",
    name: "search-indexer",
    region: "us-west-2",
    status: "healthy",
    latencyMs: 65,
    uptime: "99.90%",
    version: "v2.1.0",
  },
  {
    id: "srv-006",
    name: "analytics-aggregator",
    region: "eu-west-1",
    status: "critical",
    latencyMs: 512,
    uptime: "94.20%",
    version: "v0.9.8",
  },
  {
    id: "srv-007",
    name: "database-proxy",
    region: "us-east-1",
    status: "healthy",
    latencyMs: 8,
    uptime: "99.999%",
    version: "v4.0.0",
  },
  {
    id: "srv-008",
    name: "storage-sync",
    region: "ap-northeast-1",
    status: "offline",
    latencyMs: 0,
    uptime: "0.00%",
    version: "v1.0.4",
  },
  {
    id: "srv-009",
    name: "audit-logger",
    region: "eu-central-1",
    status: "healthy",
    latencyMs: 29,
    uptime: "99.99%",
    version: "v1.5.2",
  },
  {
    id: "srv-010",
    name: "metrics-collector",
    region: "us-east-2",
    status: "healthy",
    latencyMs: 19,
    uptime: "99.92%",
    version: "v2.0.3",
  },
  {
    id: "srv-011",
    name: "session-store",
    region: "us-west-1",
    status: "healthy",
    latencyMs: 11,
    uptime: "99.97%",
    version: "v3.1.2",
  },
  {
    id: "srv-012",
    name: "webhook-dispatcher",
    region: "eu-west-2",
    status: "warning",
    latencyMs: 180,
    uptime: "97.80%",
    version: "v1.3.0",
  },
];

export default function TablesShowcasePage() {
  const [selectedKeys, setSelectedKeys] = React.useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEmpty, setIsEmpty] = React.useState(false);

  const columns: Column<MicroserviceItem>[] = [
    {
      key: "name",
      header: "Service Identifier",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--foreground)]">{row.name}</span>
          <span className="text-xs text-[var(--text-muted)] font-mono">{row.id}</span>
        </div>
      ),
    },
    {
      key: "region",
      header: "Region",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-muted)]">{row.region}</span>
      ),
    },
    {
      key: "status",
      header: "Operational Health",
      sortable: true,
      render: (row) => {
        switch (row.status) {
          case "healthy":
            return <AppBadge variant="success">HEALTHY</AppBadge>;
          case "warning":
            return <AppBadge variant="warning">DEGRADED</AppBadge>;
          case "critical":
            return <AppBadge variant="error">CRITICAL</AppBadge>;
          case "offline":
            return <AppBadge variant="default">OFFLINE</AppBadge>;
        }
      },
    },
    {
      key: "latencyMs",
      header: "Latency",
      sortable: true,
      render: (row) => (
        <span
          className={
            row.latencyMs > 200
              ? "text-[var(--color-error)] font-medium"
              : row.latencyMs > 100
                ? "text-[var(--color-warning)] font-medium"
                : "text-[var(--foreground)]"
          }
        >
          {row.latencyMs > 0 ? `${row.latencyMs} ms` : "—"}
        </span>
      ),
    },
    {
      key: "uptime",
      header: "Uptime SLA",
      sortable: true,
    },
    {
      key: "version",
      header: "Version",
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-xs font-mono bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
          {row.version}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Data Tables
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Sortable, filterable, paginated data table with multi-row selection and
            responsive overflow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AppButton variant="outline" size="sm" onClick={() => setIsLoading(!isLoading)}>
            {isLoading ? "Stop Loading" : "Simulate Loading"}
          </AppButton>
          <AppButton variant="outline" size="sm" onClick={() => setIsEmpty(!isEmpty)}>
            {isEmpty ? "Restore Records" : "Simulate Empty"}
          </AppButton>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Microservice Fleet Telemetry</CardTitle>
          <CardDescription>
            Showing 12 services with client-side sorting, live query search, pagination
            (5/page), and batch selection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppTable
            data={isEmpty ? [] : mockMicroservices}
            columns={columns}
            keyExtractor={(item) => item.id}
            searchable
            searchPlaceholder="Filter services by name, region, or status..."
            selectable
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            pageSize={5}
            isLoading={isLoading}
            emptyMessage="No microservices matched your search criteria."
          />
        </CardContent>
      </Card>
    </div>
  );
}
