"use client";

import * as React from "react";
import { AppSelect } from "@/components/ui/app-select";
import { AppCheckbox } from "@/components/ui/app-checkbox";
import { AppRadioGroup } from "@/components/ui/app-radio-group";
import { AppSwitch } from "@/components/ui/app-switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function SelectionsShowcasePage() {
  const [singleChecked, setSingleChecked] = React.useState(true);
  const [selectedRadio, setSelectedRadio] = React.useState("cloud");
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [telemetryEnabled, setTelemetryEnabled] = React.useState(false);

  // Group Checkbox state
  const [checkboxGroup, setCheckboxGroup] = React.useState({
    read: true,
    write: true,
    admin: false,
  });

  const allSelected = checkboxGroup.read && checkboxGroup.write && checkboxGroup.admin;
  const someSelected =
    (checkboxGroup.read || checkboxGroup.write || checkboxGroup.admin) && !allSelected;

  const toggleAll = () => {
    const next = !allSelected;
    setCheckboxGroup({ read: next, write: next, admin: next });
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Selection Controls
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Accessible dropdowns, single and multi checkboxes, radio groups, and toggle
          switches.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dropdown Selects */}
        <Card>
          <CardHeader>
            <CardTitle>Native Selects</CardTitle>
            <CardDescription>
              Accessible styled select inputs with custom chevron and helper cues
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <AppSelect
              label="Deployment Environment"
              defaultValue="production"
              options={[
                { value: "development", label: "Development (Local)" },
                { value: "staging", label: "Staging (Pre-release)" },
                { value: "production", label: "Production (High-Availability)" },
                { value: "archive", label: "Archived (Cold Storage)", disabled: true },
              ]}
              helperText="Determines security and replication rules."
            />

            <AppSelect
              label="Select with Validation Error"
              placeholder="-- Choose a region --"
              defaultValue=""
              options={[
                { value: "us-east-1", label: "US East (N. Virginia)" },
                { value: "eu-central-1", label: "EU Central (Frankfurt)" },
                { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
              ]}
              errorMessage="You must select a deployment region to continue."
            />

            <AppSelect
              label="Disabled Select"
              disabled
              defaultValue="locked"
              options={[{ value: "locked", label: "Policy Locked Value" }]}
              helperText="Preset by workspace administrator."
            />
          </CardContent>
        </Card>

        {/* Checkbox Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Checkboxes & Indeterminate States</CardTitle>
            <CardDescription>
              Accessible checkbox buttons with title, description, and group handling
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <AppCheckbox
              label="Enable automated health probes"
              description="Performs synthetic HTTP requests every 30 seconds."
              checked={singleChecked}
              onChange={(e) => setSingleChecked(e.target.checked)}
            />

            <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Permissions Group
              </span>
              <AppCheckbox
                label="Select All Permissions"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
              />
              <div className="pl-6 flex flex-col gap-2">
                <AppCheckbox
                  label="Read Artifacts"
                  checked={checkboxGroup.read}
                  onChange={(e) =>
                    setCheckboxGroup({ ...checkboxGroup, read: e.target.checked })
                  }
                />
                <AppCheckbox
                  label="Write Deployments"
                  checked={checkboxGroup.write}
                  onChange={(e) =>
                    setCheckboxGroup({ ...checkboxGroup, write: e.target.checked })
                  }
                />
                <AppCheckbox
                  label="Admin Overrides"
                  checked={checkboxGroup.admin}
                  onChange={(e) =>
                    setCheckboxGroup({ ...checkboxGroup, admin: e.target.checked })
                  }
                />
              </div>
            </div>

            <AppCheckbox
              label="Disabled Checkbox"
              description="This capability cannot be revoked."
              disabled
              checked
            />
          </CardContent>
        </Card>

        {/* Radio Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Radio Groups</CardTitle>
            <CardDescription>
              Keyboard-navigable single choice group inside fieldset/legend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppRadioGroup
              name="hosting-mode"
              label="Infrastructure Topology"
              value={selectedRadio}
              onChange={setSelectedRadio}
              options={[
                {
                  value: "cloud",
                  label: "Managed Cloud Cluster",
                  description: "Fully automated failover and elastic compute.",
                },
                {
                  value: "hybrid",
                  label: "Hybrid Dedicated",
                  description: "Split workloads between on-premises and edge nodes.",
                },
                {
                  value: "airgapped",
                  label: "Air-Gapped On-Premises",
                  description: "Zero external network egress with local HSM.",
                },
                {
                  value: "legacy",
                  label: "Legacy Mainframe (Deprecated)",
                  description: "Read-only fallback mode.",
                  disabled: true,
                },
              ]}
              helperText={`Currently active topology: ${selectedRadio.toUpperCase()}`}
            />
          </CardContent>
        </Card>

        {/* Toggle Switches */}
        <Card>
          <CardHeader>
            <CardTitle>Toggle Switches</CardTitle>
            <CardDescription>
              ARIA switch widgets with smooth transitions and keyboard space/enter
              handling
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 divide-y divide-[var(--border)]">
            <AppSwitch
              label="Real-time Notifications"
              description="Broadcast instantaneous alerts to the header tray."
              checked={notificationsEnabled}
              onChange={setNotificationsEnabled}
            />

            <AppSwitch
              label="Anonymous Telemetry"
              description="Transmit performance tracing metrics to diagnostic collectors."
              checked={telemetryEnabled}
              onChange={setTelemetryEnabled}
            />

            <AppSwitch
              label="Maintenance Mode"
              description="Prevent user authentication during upgrades (disabled by default)."
              disabled
              checked={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
