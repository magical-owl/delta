import { IconName } from "@/components/ui/app-icon";

export interface NavItemConfig {
  title: string;
  href: string;
  icon: IconName;
  exactMatch?: boolean;
  description?: string;
  badge?: string;
}

export interface NavGroupConfig {
  groupTitle: string;
  icon: IconName;
  items: NavItemConfig[];
}

export type NavEntry = NavItemConfig | NavGroupConfig;

export function isNavGroup(entry: NavEntry): entry is NavGroupConfig {
  return "items" in entry && Array.isArray(entry.items);
}

export const adminNavigation: NavEntry[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: "chart-pie",
    exactMatch: true,
    description: "Operational overview, core metrics, and workspace status.",
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: "users",
    description: "User directory, provisioning, and access permissions.",
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: "folder",
    description: "Project management, initiatives, and resource allocation.",
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: "chart-line",
    description: "Performance telemetries, operational charts, and logs.",
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: "file-lines",
    description: "Compliance exports, audit logs, and scheduled reports.",
  },
  {
    groupTitle: "Management",
    icon: "users-gear",
    items: [
      {
        title: "Teams",
        href: "/dashboard/management/teams",
        icon: "building",
        description: "Organizational team hierarchies and collaboration squads.",
      },
      {
        title: "Roles",
        href: "/dashboard/management/roles",
        icon: "user-shield",
        description: "Role-based access control, scopes, and security policies.",
      },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: "gear",
    description: "Workspace configuration, integration tokens, and system defaults.",
  },
];

/**
 * Fast lookup map matching pathname to page title and metadata
 */
export const routeTitleMap: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Overview",
    subtitle: "Real-time system telemetry and operational workspace status",
  },
  "/dashboard/users": {
    title: "User Management",
    subtitle: "Directory, accounts, and identity provisioning",
  },
  "/dashboard/projects": {
    title: "Projects",
    subtitle: "Active workspace initiatives and milestones",
  },
  "/dashboard/analytics": {
    title: "Analytics & Telemetry",
    subtitle: "System usage metrics, request throughput, and latency tracking",
  },
  "/dashboard/reports": {
    title: "Reports & Audits",
    subtitle: "Compliance certificates, audit trails, and export logs",
  },
  "/dashboard/management/teams": {
    title: "Teams",
    subtitle: "Department structures, squad allocation, and membership",
  },
  "/dashboard/management/roles": {
    title: "Roles & Permissions",
    subtitle: "Granular access policies and RBAC security assignments",
  },
  "/dashboard/settings": {
    title: "Workspace Settings",
    subtitle: "Global configurations, environment thresholds, and webhooks",
  },
};
