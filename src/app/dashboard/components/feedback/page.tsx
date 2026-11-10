"use client";

import * as React from "react";
import { AppAlert } from "@/components/ui/app-alert";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton } from "@/components/ui/app-button";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppPopover } from "@/components/ui/app-popover";
import { AppTooltip } from "@/components/ui/app-tooltip";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function FeedbackShowcasePage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDestructiveDialogOpen, setIsDestructiveDialogOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Feedback & Overlays
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Contextual alerts, badges, focus-trapped dialogs, floating popovers, and
          accessible tooltips.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contextual Alerts */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Alert Banners</CardTitle>
            <CardDescription>
              Status notification banners with Font Awesome icons and optional dismiss
              action
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <AppAlert variant="info" title="System Scheduled Maintenance" dismissible>
              The central database replica will perform automated index vacuuming tonight
              at 02:00 UTC.
            </AppAlert>

            <AppAlert
              variant="success"
              title="Artifact Deployed Successfully"
              dismissible
            >
              Container image delta_web:latest has rolled out across 12 availability zones
              with zero downtime.
            </AppAlert>

            <AppAlert variant="warning" title="High Memory Pressure Detected" dismissible>
              Node worker-04 memory utilization has exceeded 85% for more than 5 minutes.
            </AppAlert>

            <AppAlert
              variant="error"
              title="TLS Certificate Expiration Imminent"
              dismissible
            >
              Wildcard certificate for *.internal.domain expires in 48 hours. Auto-renewal
              has failed.
            </AppAlert>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Status Badges</CardTitle>
            <CardDescription>
              Compact pill tags for metadata and statuses in both themes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <AppBadge variant="default">DEFAULT</AppBadge>
              <AppBadge variant="primary">ACTIVE</AppBadge>
              <AppBadge variant="success">RESOLVED</AppBadge>
              <AppBadge variant="warning">PENDING</AppBadge>
              <AppBadge variant="error">FAILED</AppBadge>
              <AppBadge variant="info">INFO</AppBadge>
              <AppBadge variant="outline">STAGING</AppBadge>
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex flex-wrap gap-2">
              <AppBadge variant="success" leftIcon="circle-check">
                Verified Sign-off
              </AppBadge>
              <AppBadge variant="warning" leftIcon="triangle-exclamation">
                Attention Required
              </AppBadge>
              <AppBadge variant="info" leftIcon="clock">
                Running Build
              </AppBadge>
            </div>
          </CardContent>
        </Card>

        {/* Floating Popovers & Tooltips */}
        <Card>
          <CardHeader>
            <CardTitle>Popovers & Tooltips</CardTitle>
            <CardDescription>
              Positioned floating panels and accessible hover/focus cues
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Interactive Popovers
              </span>
              <div className="flex items-center gap-4">
                <AppPopover
                  trigger={
                    <AppButton variant="outline" size="sm" leftIcon="ellipsis-vertical">
                      Quick Options
                    </AppButton>
                  }
                >
                  <div className="flex flex-col gap-2 w-48">
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase">
                      Actions
                    </p>
                    <button
                      type="button"
                      className="text-left text-sm py-1.5 px-2 rounded hover:bg-[var(--surface-muted)] transition-colors"
                    >
                      Export Telemetry
                    </button>
                    <button
                      type="button"
                      className="text-left text-sm py-1.5 px-2 rounded hover:bg-[var(--surface-muted)] transition-colors"
                    >
                      Audit Trail
                    </button>
                    <button
                      type="button"
                      className="text-left text-sm py-1.5 px-2 rounded text-[var(--color-error)] hover:bg-[var(--surface-muted)] transition-colors"
                    >
                      Sever Connection
                    </button>
                  </div>
                </AppPopover>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Accessible Tooltips
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <AppTooltip
                  content="Tooltips guide users without cluttering layout."
                  position="top"
                >
                  <AppButton variant="secondary" size="sm">
                    Hover (Top)
                  </AppButton>
                </AppTooltip>

                <AppTooltip content="Bottom-aligned tooltip preview." position="bottom">
                  <AppButton variant="secondary" size="sm">
                    Hover (Bottom)
                  </AppButton>
                </AppTooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Dialogs */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Accessible Modal Dialogs</CardTitle>
            <CardDescription>
              Full-screen backdrop, focus trap, Escape key handling, and body scroll
              locking
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <AppButton variant="primary" onClick={() => setIsDialogOpen(true)}>
              Open Standard Dialog
            </AppButton>

            <AppButton
              variant="destructive"
              onClick={() => setIsDestructiveDialogOpen(true)}
            >
              Open Destructive Confirmation
            </AppButton>

            {/* Standard Dialog */}
            <AppDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              title="System Configuration Update"
              description="Review the planned changes before committing them to the live environment."
              footer={
                <>
                  <AppButton variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </AppButton>
                  <AppButton variant="primary" onClick={() => setIsDialogOpen(false)}>
                    Confirm Changes
                  </AppButton>
                </>
              }
            >
              <div className="flex flex-col gap-3 py-2">
                <p className="text-sm text-[var(--foreground)]">
                  Updating this setting will restart the telemetry worker daemon. Active
                  connections will be gracefully drained over 15 seconds.
                </p>
                <div className="p-3 rounded-lg bg-[var(--surface-muted)] text-xs font-mono text-[var(--text-muted)]">
                  worker_drain_timeout = 15s
                  <br />
                  cluster_topology = &quot;multi-region&quot;
                </div>
              </div>
            </AppDialog>

            {/* Destructive Dialog */}
            <AppDialog
              isOpen={isDestructiveDialogOpen}
              onClose={() => setIsDestructiveDialogOpen(false)}
              title="Confirm Fleet Deprovisioning"
              description="This action cannot be undone. All ephemeral instances will be terminated."
              footer={
                <>
                  <AppButton
                    variant="outline"
                    onClick={() => setIsDestructiveDialogOpen(false)}
                  >
                    Abort
                  </AppButton>
                  <AppButton
                    variant="destructive"
                    onClick={() => setIsDestructiveDialogOpen(false)}
                  >
                    Yes, Deprovision Fleet
                  </AppButton>
                </>
              }
            >
              <div className="p-3 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-[var(--color-error)] text-sm">
                Warning: You are about to terminate 8 production workers in us-east-1.
              </div>
            </AppDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
