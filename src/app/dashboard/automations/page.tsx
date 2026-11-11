"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeading } from "@/components/shared/page-heading";
import { ContentCard } from "@/components/shared/content-card";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon, type IconName } from "@/components/ui/app-icon";

type ComplexityTier = "all" | "basic" | "intermediate" | "advanced";

interface AutomationItem {
  id: string;
  tier: "basic" | "intermediate" | "advanced";
  tierLabel: string;
  badgeVariant: "info" | "primary" | "destructive";
  title: string;
  summary: string;
  href: string;
  icon: IconName;
  nodeCount: string;
  workflowNodes: string[];
  features: string[];
}

const AUTOMATION_CATALOG: AutomationItem[] = [
  // Basic Tier (2 items)
  {
    id: "wh-tester",
    tier: "basic",
    tierLabel: "Basic (Tier 1)",
    badgeVariant: "info",
    title: "Webhook Tester & Health Ping",
    summary:
      "Direct outbound & inbound ping-pong console. Ideal for verifying that your n8n webhook listener is online, calculating roundtrip latency, and inspecting headers.",
    href: "/dashboard/automations/webhooks",
    icon: "arrows-rotate",
    nodeCount: "2–3 Nodes",
    workflowNodes: ["Webhook Trigger", "Format Payload", "Respond 200 OK"],
    features: [
      "One-click 'Send Test Webhook' to n8n",
      "Roundtrip latency tracking in milliseconds",
      "Direct response body payload inspection",
      "Live dispatch log with HTTP status codes",
    ],
  },
  {
    id: "user-onboarding",
    tier: "basic",
    tierLabel: "Basic (Tier 1)",
    badgeVariant: "info",
    title: "User Onboarding & Welcome Flow",
    summary:
      "Fires when a new team member is invited or activates an account. Dispatches user metadata to n8n to send a branded welcome email and broadcast an announcement in Slack.",
    href: "/dashboard/automations/onboarding",
    icon: "users",
    nodeCount: "3–4 Nodes",
    workflowNodes: [
      "User Event Webhook",
      "Template Formatter",
      "SendGrid / SMTP",
      "Slack #welcome",
    ],
    features: [
      "Triggers on user provisioning or invitation acceptance",
      "Includes user role, publicId, and workspace metadata",
      "Dispatches customizable welcome email templates",
      "Posts automated celebration card in Slack/Teams",
    ],
  },

  // Intermediate Tier (2 items)
  {
    id: "inquiry-triage",
    tier: "intermediate",
    tierLabel: "Intermediate (Tier 2)",
    badgeVariant: "primary",
    title: "Inquiry & Lead Triage Pipeline",
    summary:
      "Captures public landing page inquiries, evaluates business urgency and technical category, scores priority (P1/P2/P3), and routes leads to dedicated squads with SLA enforcement.",
    href: "/dashboard/automations/inquiries",
    icon: "envelope",
    nodeCount: "4–6 Nodes",
    workflowNodes: [
      "Inquiry Ingest",
      "AI Classification",
      "Priority Switch",
      "Slack Squad Router",
      "CRM Sync",
    ],
    features: [
      "Direct connection to homepage inquiry form",
      "Rule-based & AI-assisted priority scoring (P1/P2/P3)",
      "Dynamic SLA assignment (2h vs 8h vs 24h)",
      "Multi-channel routing to SecOps, Architecture, or Support",
    ],
  },
  {
    id: "compliance-archival",
    tier: "intermediate",
    tierLabel: "Intermediate (Tier 2)",
    badgeVariant: "primary",
    title: "Compliance & Audit Archival",
    summary:
      "Scheduled or webhook-driven compliance workflow. Pulls raw audit events from PostgreSQL, generates signed hash digests, and compresses archives for cloud storage.",
    href: "/dashboard/automations/compliance",
    icon: "box-archive",
    nodeCount: "4–5 Nodes",
    workflowNodes: [
      "Schedule / Webhook",
      "Query audit_events",
      "Compute SHA-256",
      "S3 / Cloud Storage",
      "Emit Certificate",
    ],
    features: [
      "Automates SOC2 / ISO27001 retention requirements",
      "Cryptographic integrity verification of audit trails",
      "Exports compressed JSON/CSV records to cloud bucket",
      "Generates verification receipt back to Delta dashboard",
    ],
  },

  // Advanced Tier (2 items)
  {
    id: "secops-escalation",
    tier: "advanced",
    tierLabel: "Advanced (Tier 3)",
    badgeVariant: "destructive",
    title: "Security Threat Escalation & Auto-Ban",
    summary:
      "Real-time SecOps automation monitoring the audit stream for brute-force attacks, disabled account probes, or privilege escalation. Immediately pages on-call via PagerDuty and triggers IP containment.",
    href: "/dashboard/automations/security",
    icon: "shield-halved",
    nodeCount: "6–8 Nodes",
    workflowNodes: [
      "Security Webhook",
      "Threat Evaluator",
      "PagerDuty Alert",
      "Redis IP Quarantine",
      "SecOps Ticket",
    ],
    features: [
      "Instant triggers on auth.login_denied & role mutations",
      "Generates incident tracking tickets (SEC-XXXX)",
      "High-severity PagerDuty / Discord emergency alarms",
      "Bi-directional IP quarantine callback into Redis rate limiter",
    ],
  },
  {
    id: "ai-orchestrator",
    tier: "advanced",
    tierLabel: "Advanced (Tier 3)",
    badgeVariant: "destructive",
    title: "AI Multi-Agent Task Orchestrator",
    summary:
      "Autonomous workflow delegating complex engineering queries or reports to n8n's AI agent nodes (OpenAI, Gemini, Anthropic), combining web searches, code analysis, and structured report synthesis.",
    href: "/dashboard/automations/ai-tasks",
    icon: "sliders",
    nodeCount: "8+ Nodes",
    workflowNodes: [
      "Task Webhook",
      "AI Agent Reasoner",
      "Tool Calling (Web/DB)",
      "Synthesis Node",
      "Delta Callback",
    ],
    features: [
      "Bi-directional async processing with progress webhooks",
      "Multi-agent reasoning loops with tool-calling capabilities",
      "Integrates with vector databases and search engines",
      "Streams structured markdown analysis back to dashboard",
    ],
  },
];

export default function AutomationsOverviewPage() {
  const [selectedTier, setSelectedTier] = React.useState<ComplexityTier>("all");

  const filteredItems = React.useMemo(() => {
    if (selectedTier === "all") return AUTOMATION_CATALOG;
    return AUTOMATION_CATALOG.filter((item) => item.tier === selectedTier);
  }, [selectedTier]);

  return (
    <div className="space-y-8">
      <PageHeading
        title="n8n Automation Catalog"
        subtitle="Explore ready-to-run webhook automations designed for the Delta platform, categorized by architectural complexity."
      >
        <AppBadge variant="info" leftIcon="bolt">
          6 Active Workflows
        </AppBadge>
      </PageHeading>

      {/* Tier Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setSelectedTier("basic")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            selectedTier === "basic"
              ? "border-[var(--color-info)] bg-[var(--color-info-bg)]/30 ring-2 ring-[var(--color-info)]/30"
              : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-info)]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <AppBadge variant="info">Tier 1: Basic</AppBadge>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              2 Workflows
            </span>
          </div>
          <div className="text-sm font-semibold text-[var(--foreground)] mb-1">
            Simple Ingest & Broadcast
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Single-event triggers, straightforward payload formatting, and instant
            notification dispatches (Slack, Email).
          </p>
        </div>

        <div
          onClick={() => setSelectedTier("intermediate")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            selectedTier === "intermediate"
              ? "border-[var(--primary)] bg-[var(--color-selected-bg)]/30 ring-2 ring-[var(--primary)]/30"
              : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <AppBadge variant="primary">Tier 2: Intermediate</AppBadge>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              2 Workflows
            </span>
          </div>
          <div className="text-sm font-semibold text-[var(--foreground)] mb-1">
            Routing & Business Logic
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Condition-based branching, AI classification, priority matrix scoring, and
            compliance record archival.
          </p>
        </div>

        <div
          onClick={() => setSelectedTier("advanced")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            selectedTier === "advanced"
              ? "border-[var(--color-error)] bg-[var(--color-error-bg)]/30 ring-2 ring-[var(--color-error)]/30"
              : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-error)]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <AppBadge variant="destructive">Tier 3: Advanced</AppBadge>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              2 Workflows
            </span>
          </div>
          <div className="text-sm font-semibold text-[var(--foreground)] mb-1">
            SecOps & AI Orchestration
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Emergency threat escalations, bi-directional remediation callbacks, and
            autonomous multi-agent tool execution.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
        <button
          type="button"
          onClick={() => setSelectedTier("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            selectedTier === "all"
              ? "bg-[var(--primary)] text-white shadow-xs"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
          }`}
        >
          All Automations (6)
        </button>
        <button
          type="button"
          onClick={() => setSelectedTier("basic")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            selectedTier === "basic"
              ? "bg-[var(--primary)] text-white shadow-xs"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
          }`}
        >
          Basic Tier (2)
        </button>
        <button
          type="button"
          onClick={() => setSelectedTier("intermediate")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            selectedTier === "intermediate"
              ? "bg-[var(--primary)] text-white shadow-xs"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
          }`}
        >
          Intermediate Tier (2)
        </button>
        <button
          type="button"
          onClick={() => setSelectedTier("advanced")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            selectedTier === "advanced"
              ? "bg-[var(--primary)] text-white shadow-xs"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
          }`}
        >
          Advanced Tier (2)
        </button>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <ContentCard
            key={item.id}
            className="flex flex-col justify-between transition-all hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                    <AppIcon name={item.icon} size="md" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      {item.nodeCount}
                    </span>
                    <h3 className="text-base font-semibold text-[var(--foreground)] leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>
                <AppBadge variant={item.badgeVariant}>{item.tierLabel}</AppBadge>
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                {item.summary}
              </p>

              {/* Workflow Pipeline Chips */}
              <div className="mb-4 rounded-lg bg-[var(--surface-muted)] p-2.5 border border-[var(--border)]">
                <div className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <AppIcon name="bolt" size="xs" />
                  <span>n8n Pipeline</span>
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[11px]">
                  {item.workflowNodes.map((node, i) => (
                    <span key={node} className="inline-flex items-center gap-1">
                      <span className="rounded bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--foreground)] border border-[var(--border)] shadow-2xs">
                        {node}
                      </span>
                      {i < item.workflowNodes.length - 1 && (
                        <AppIcon
                          name="chevron-right"
                          size="xs"
                          className="text-[var(--text-muted)]"
                        />
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <ul className="space-y-1 text-[11px] text-[var(--text-muted)] mb-5">
                {item.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-1.5">
                    <AppIcon
                      name="circle-check"
                      size="xs"
                      className="text-[var(--color-success)] mt-0.5 shrink-0"
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-[var(--border)]/70">
              <Link href={item.href} className="w-full">
                <AppButton
                  variant="outline"
                  size="sm"
                  className="w-full justify-center gap-1.5"
                >
                  <span>Open Console</span>
                  <AppIcon name="arrow-right" size="xs" />
                </AppButton>
              </Link>
            </div>
          </ContentCard>
        ))}
      </div>
    </div>
  );
}
