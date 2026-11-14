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
    groupTitle: "Automations (n8n)",
    icon: "bolt",
    items: [
      {
        title: "Hub Overview",
        href: "/dashboard/automations",
        icon: "layer-group",
        description: "Browse all n8n automations grouped by complexity tier.",
        badge: "Tiers",
      },
      {
        title: "Webhook Tester",
        href: "/dashboard/automations/webhooks",
        icon: "arrows-rotate",
        description: "Basic: Direct outbound & inbound webhook testing console.",
        badge: "Basic",
      },
      {
        title: "User Onboarding",
        href: "/dashboard/automations/onboarding",
        icon: "users",
        description: "Basic: Welcome email dispatch and Slack team announcement.",
        badge: "Basic",
      },
      {
        title: "Inquiry Triage",
        href: "/dashboard/automations/inquiries",
        icon: "envelope",
        description: "Intermediate: AI lead scoring, team routing, and SLA tracking.",
        badge: "Interm.",
      },
      {
        title: "Audit Archival",
        href: "/dashboard/automations/compliance",
        icon: "box-archive",
        description: "Intermediate: Scheduled compliance exports to S3 / Cloud Storage.",
        badge: "Interm.",
      },
      {
        title: "Security Escalation",
        href: "/dashboard/automations/security",
        icon: "shield-halved",
        description: "Advanced: Real-time threat detection, PagerDuty, and IP ban.",
        badge: "Adv.",
      },
      {
        title: "AI Orchestrator",
        href: "/dashboard/automations/ai-tasks",
        icon: "sliders",
        description: "Advanced: Multi-agent LLM analysis and bi-directional callback.",
        badge: "Adv.",
      },
      {
        title: "Video Radar",
        href: "/dashboard/automations/video-radar",
        icon: "video",
        description:
          "Advanced: Trending video outlier analysis, AI scripts, and render JSON.",
        badge: "Adv.",
      },
    ],
  },
  {
    groupTitle: "Component Library",
    icon: "cube",
    items: [
      {
        title: "Overview",
        href: "/dashboard/components",
        icon: "layer-group",
        description: "Showcase index and reusable component directory.",
      },
      {
        title: "Inputs & Forms",
        href: "/dashboard/components/inputs",
        icon: "font",
        description: "Text, email, password toggle, search, textarea, validation.",
      },
      {
        title: "Selections",
        href: "/dashboard/components/selections",
        icon: "list-check",
        description: "Native selects, checkboxes, radio groups, and switches.",
      },
      {
        title: "Dates & Time",
        href: "/dashboard/components/dates",
        icon: "calendar-days",
        description: "Native date pickers, min/max bounds, date ranges.",
      },
      {
        title: "Data Tables",
        href: "/dashboard/components/tables",
        icon: "table",
        description: "Sortable, searchable, selectable, and paginated tables.",
      },
      {
        title: "Feedback & Overlays",
        href: "/dashboard/components/feedback",
        icon: "bell",
        description: "Alerts, badges, dialogs, popovers, and tooltips.",
      },
      {
        title: "UI Playground",
        href: "/dashboard/playground",
        icon: "sliders",
        description: "Interactive component workbench and prop configurator.",
      },
    ],
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
  "/dashboard/automations": {
    title: "n8n Automation Hub",
    subtitle: "Enterprise workflow automations grouped by complexity tier",
  },
  "/dashboard/automations/webhooks": {
    title: "Webhook Tester Console",
    subtitle: "Basic Tier: Outbound and inbound webhook testing and dispatch logs",
  },
  "/dashboard/automations/onboarding": {
    title: "User Onboarding & Welcome Flow",
    subtitle: "Basic Tier: Automated account invitation emails and Slack greetings",
  },
  "/dashboard/automations/inquiries": {
    title: "Inquiry Triage Pipeline",
    subtitle: "Intermediate Tier: AI classification, team routing, and SLA tracking",
  },
  "/dashboard/automations/compliance": {
    title: "Compliance & Audit Archival",
    subtitle: "Intermediate Tier: Scheduled audit trail compression and cloud archival",
  },
  "/dashboard/automations/security": {
    title: "Security Alert Escalation",
    subtitle:
      "Advanced Tier: Automated threat detection, PagerDuty on-call, and IP quarantine",
  },
  "/dashboard/automations/ai-tasks": {
    title: "AI Multi-Agent Task Orchestrator",
    subtitle:
      "Advanced Tier: LLM reasoning loops, external tool calling, and structured synthesis",
  },
  "/dashboard/automations/video-radar": {
    title: "Trending Video Radar & Script Generator",
    subtitle:
      "Advanced Tier: Outlier trend analysis, hook extraction, AI scriptwriting, and video render payloads",
  },
  "/dashboard/components": {
    title: "Component Library",
    subtitle: "Interactive UI primitives, form controls, and feedback systems",
  },
  "/dashboard/components/inputs": {
    title: "Input Controls & Forms",
    subtitle: "Accessible text, email, password visibility, search, and validation",
  },
  "/dashboard/components/selections": {
    title: "Selection Controls",
    subtitle: "Dropdown selects, grouped checkboxes, radio groups, and switches",
  },
  "/dashboard/components/dates": {
    title: "Date & Time Pickers",
    subtitle: "Native date pickers, min/max constraints, and range validation",
  },
  "/dashboard/components/tables": {
    title: "Data Tables",
    subtitle: "Sortable headers, query filtering, pagination, and multi-row selection",
  },
  "/dashboard/components/feedback": {
    title: "Feedback & Overlays",
    subtitle: "Contextual alerts, status badges, modal dialogs, popovers, and tooltips",
  },
  "/dashboard/playground": {
    title: "UI Playground",
    subtitle: "Interactive component workbench, live prop tweaking, and code generation",
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
