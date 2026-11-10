"use client";

import * as React from "react";
import {
  AppButton,
  AppBadge,
  AppAlert,
  AppInput,
  AppProgress,
  AppAvatar,
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
  AppTabsContent,
  AppAccordion,
  AppAccordionItem,
  AppAccordionTrigger,
  AppAccordionContent,
  AppDrawer,
  AppSwitch,
  AppSelect,
  AppIcon,
  type IconName,
} from "@/components/ui";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type PlaygroundComponent =
  | "button"
  | "badge"
  | "alert"
  | "input"
  | "progress"
  | "avatar"
  | "tabs"
  | "accordion"
  | "drawer";

export default function UIPlaygroundPage() {
  const [selectedComponent, setSelectedComponent] =
    React.useState<PlaygroundComponent>("button");
  const [copied, setCopied] = React.useState(false);

  // Button Playground State
  const [btnVariant, setBtnVariant] = React.useState<
    "primary" | "secondary" | "outline" | "destructive" | "ghost"
  >("primary");
  const [btnSize, setBtnSize] = React.useState<"sm" | "md" | "lg">("md");
  const [btnText, setBtnText] = React.useState("Execute Deployment");
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [btnDisabled, setBtnDisabled] = React.useState(false);
  const [btnIcon, setBtnIcon] = React.useState<IconName | "">("gear");

  // Badge Playground State
  const [badgeVariant, setBadgeVariant] = React.useState<
    "default" | "primary" | "success" | "warning" | "error" | "info" | "outline"
  >("primary");
  const [badgeText, setBadgeText] = React.useState("ACTIVE FLEET");
  const [badgeIcon, setBadgeIcon] = React.useState<IconName | "">("circle-check");

  // Alert Playground State
  const [alertVariant, setAlertVariant] = React.useState<
    "info" | "success" | "warning" | "error" | "default"
  >("info");
  const [alertTitle, setAlertTitle] = React.useState("Automated Failover Initiated");
  const [alertMessage, setAlertMessage] = React.useState(
    "Primary database replica transitioned smoothly to us-west-2 cluster."
  );
  const [alertDismissible, setAlertDismissible] = React.useState(true);

  // Input Playground State
  const [inputLabel, setInputLabel] = React.useState("Cluster Subnet CIDR");
  const [inputPlaceholder, setInputPlaceholder] = React.useState("10.0.0.0/16");
  const [inputHelper, setInputHelper] = React.useState(
    "Must be a valid IPv4 RFC-1918 range."
  );
  const [inputError, setInputError] = React.useState("");
  const [inputDisabled, setInputDisabled] = React.useState(false);
  const [inputRequired, setInputRequired] = React.useState(true);

  // Progress Playground State
  const [progressVal, setProgressVal] = React.useState(68);
  const [progressVariant, setProgressVariant] = React.useState<
    "primary" | "success" | "warning" | "error"
  >("primary");
  const [progressSize, setProgressSize] = React.useState<"sm" | "md" | "lg">("md");
  const [progressShowLabel, setProgressShowLabel] = React.useState(true);
  const [progressIndeterminate, setProgressIndeterminate] = React.useState(false);

  // Avatar Playground State
  const [avatarSize, setAvatarSize] = React.useState<"xs" | "sm" | "md" | "lg" | "xl">(
    "lg"
  );
  const [avatarStatus, setAvatarStatus] = React.useState<
    "online" | "offline" | "busy" | "away"
  >("online");
  const [avatarFallback, setAvatarFallback] = React.useState("EL");

  // Drawer Playground State
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [drawerPosition, setDrawerPosition] = React.useState<"right" | "left">("right");

  // Generated Code Generator
  const generatedCode = React.useMemo(() => {
    switch (selectedComponent) {
      case "button":
        return `<AppButton\n  variant="${btnVariant}"\n  size="${btnSize}"${
          btnLoading ? "\n  isLoading" : ""
        }${btnDisabled ? "\n  disabled" : ""}${
          btnIcon ? `\n  leftIcon="${btnIcon}"` : ""
        }\n>\n  ${btnText}\n</AppButton>`;

      case "badge":
        return `<AppBadge\n  variant="${badgeVariant}"${
          badgeIcon ? `\n  leftIcon="${badgeIcon}"` : ""
        }\n>\n  ${badgeText}\n</AppBadge>`;

      case "alert":
        return `<AppAlert\n  variant="${alertVariant}"\n  title="${alertTitle}"${
          alertDismissible ? "\n  dismissible" : ""
        }\n>\n  ${alertMessage}\n</AppAlert>`;

      case "input":
        return `<AppInput\n  label="${inputLabel}"\n  placeholder="${inputPlaceholder}"\n  helperText="${inputHelper}"${
          inputError ? `\n  errorMessage="${inputError}"` : ""
        }${inputRequired ? "\n  required" : ""}${
          inputDisabled ? "\n  disabled" : ""
        }\n/>`;

      case "progress":
        return `<AppProgress\n  value={${
          progressIndeterminate ? "null" : progressVal
        }}\n  variant="${progressVariant}"\n  size="${progressSize}"${
          progressShowLabel ? "\n  showLabel" : ""
        }\n/>`;

      case "avatar":
        return `<AppAvatar\n  fallback="${avatarFallback}"\n  size="${avatarSize}"\n  status="${avatarStatus}"\n/>`;

      case "tabs":
        return `<AppTabs defaultValue="metrics">\n  <AppTabsList>\n    <AppTabsTrigger value="metrics">Metrics</AppTabsTrigger>\n    <AppTabsTrigger value="logs">Logs</AppTabsTrigger>\n    <AppTabsTrigger value="settings">Settings</AppTabsTrigger>\n  </AppTabsList>\n  <AppTabsContent value="metrics">Real-time telemetry graphs.</AppTabsContent>\n  <AppTabsContent value="logs">Live container stdout/stderr stream.</AppTabsContent>\n  <AppTabsContent value="settings">Worker instance threshold configuration.</AppTabsContent>\n</AppTabs>`;

      case "accordion":
        return `<AppAccordion type="single" defaultValue={["item-1"]}>\n  <AppAccordionItem value="item-1">\n    <AppAccordionTrigger>Security Compliance</AppAccordionTrigger>\n    <AppAccordionContent>SOC-2 Type II audit logs are archived daily.</AppAccordionContent>\n  </AppAccordionItem>\n  <AppAccordionItem value="item-2">\n    <AppAccordionTrigger>Data Retention</AppAccordionTrigger>\n    <AppAccordionContent>Ephemeral telemetry is expired after 30 days.</AppAccordionContent>\n  </AppAccordionItem>\n</AppAccordion>`;

      case "drawer":
        return `<AppDrawer\n  isOpen={isOpen}\n  onClose={() => setIsOpen(false)}\n  position="${drawerPosition}"\n  title="Node Diagnostics"\n  description="Detailed runtime metrics for selected pod."\n>\n  <p>Diagnostic content panel...</p>\n</AppDrawer>`;
    }
  }, [
    selectedComponent,
    btnVariant,
    btnSize,
    btnText,
    btnLoading,
    btnDisabled,
    btnIcon,
    badgeVariant,
    badgeText,
    badgeIcon,
    alertVariant,
    alertTitle,
    alertMessage,
    alertDismissible,
    inputLabel,
    inputPlaceholder,
    inputHelper,
    inputError,
    inputDisabled,
    inputRequired,
    progressVal,
    progressVariant,
    progressSize,
    progressShowLabel,
    progressIndeterminate,
    avatarSize,
    avatarStatus,
    avatarFallback,
    drawerPosition,
  ]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      {/* Playground Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
          <AppIcon name="sliders" size="xs" />
          <span>Interactive Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
          UI Component Playground
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-3xl leading-relaxed">
          Configure component props interactively, observe real-time visual states across
          both light and dark themes, and copy ready-to-use JSX snippets.
        </p>
      </div>

      {/* Component Selection Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border)]">
        {(
          [
            { id: "button", label: "AppButton", icon: "cube" },
            { id: "badge", label: "AppBadge", icon: "circle-check" },
            { id: "alert", label: "AppAlert", icon: "triangle-exclamation" },
            { id: "input", label: "AppInput", icon: "font" },
            { id: "progress", label: "AppProgress", icon: "chart-line" },
            { id: "avatar", label: "AppAvatar", icon: "user" },
            { id: "tabs", label: "AppTabs", icon: "layer-group" },
            { id: "accordion", label: "AppAccordion", icon: "chevron-down" },
            { id: "drawer", label: "AppDrawer", icon: "box-archive" },
          ] as const
        ).map((comp) => {
          const isSelected = selectedComponent === comp.id;
          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => setSelectedComponent(comp.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs font-semibold"
                  : "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              <AppIcon name={comp.icon} size="xs" />
              <span>{comp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Props Configuration</span>
                <span className="text-xs font-mono font-normal text-[var(--text-muted)]">
                  {selectedComponent}
                </span>
              </CardTitle>
              <CardDescription>
                Customize attributes to see reactive DOM rendering
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* BUTTON CONTROLS */}
              {selectedComponent === "button" && (
                <>
                  <AppSelect
                    label="Variant"
                    value={btnVariant}
                    onChange={(e) => setBtnVariant(e.target.value as typeof btnVariant)}
                    options={[
                      { value: "primary", label: "Primary (Accent)" },
                      { value: "secondary", label: "Secondary (Neutral)" },
                      { value: "outline", label: "Outline" },
                      { value: "destructive", label: "Destructive" },
                      { value: "ghost", label: "Ghost" },
                    ]}
                  />

                  <AppSelect
                    label="Size"
                    value={btnSize}
                    onChange={(e) => setBtnSize(e.target.value as typeof btnSize)}
                    options={[
                      { value: "sm", label: "Small (sm)" },
                      { value: "md", label: "Medium (md)" },
                      { value: "lg", label: "Large (lg)" },
                    ]}
                  />

                  <AppInput
                    label="Button Text"
                    value={btnText}
                    onChange={(e) => setBtnText(e.target.value)}
                  />

                  <AppSelect
                    label="Leading Icon"
                    value={btnIcon}
                    onChange={(e) => setBtnIcon(e.target.value as IconName | "")}
                    options={[
                      { value: "", label: "None" },
                      { value: "gear", label: "Gear" },
                      { value: "plus", label: "Plus" },
                      { value: "trash", label: "Trash" },
                      { value: "arrows-rotate", label: "Refresh" },
                      { value: "check", label: "Check" },
                    ]}
                  />

                  <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-2">
                    <AppSwitch
                      label="Loading State"
                      description="Displays animated spinner icon"
                      checked={btnLoading}
                      onChange={setBtnLoading}
                    />
                    <AppSwitch
                      label="Disabled State"
                      description="Suppresses click interactions"
                      checked={btnDisabled}
                      onChange={setBtnDisabled}
                    />
                  </div>
                </>
              )}

              {/* BADGE CONTROLS */}
              {selectedComponent === "badge" && (
                <>
                  <AppSelect
                    label="Variant"
                    value={badgeVariant}
                    onChange={(e) =>
                      setBadgeVariant(e.target.value as typeof badgeVariant)
                    }
                    options={[
                      { value: "default", label: "Default" },
                      { value: "primary", label: "Primary" },
                      { value: "success", label: "Success" },
                      { value: "warning", label: "Warning" },
                      { value: "error", label: "Error" },
                      { value: "info", label: "Info" },
                      { value: "outline", label: "Outline" },
                    ]}
                  />

                  <AppInput
                    label="Badge Label"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                  />

                  <AppSelect
                    label="Badge Icon"
                    value={badgeIcon}
                    onChange={(e) => setBadgeIcon(e.target.value as IconName | "")}
                    options={[
                      { value: "", label: "None" },
                      { value: "circle-check", label: "Circle Check" },
                      { value: "triangle-exclamation", label: "Warning" },
                      { value: "clock", label: "Clock" },
                      { value: "shield-halved", label: "Shield" },
                    ]}
                  />
                </>
              )}

              {/* ALERT CONTROLS */}
              {selectedComponent === "alert" && (
                <>
                  <AppSelect
                    label="Variant"
                    value={alertVariant}
                    onChange={(e) =>
                      setAlertVariant(e.target.value as typeof alertVariant)
                    }
                    options={[
                      { value: "info", label: "Info" },
                      { value: "success", label: "Success" },
                      { value: "warning", label: "Warning" },
                      { value: "error", label: "Error" },
                      { value: "default", label: "Default" },
                    ]}
                  />

                  <AppInput
                    label="Alert Title"
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                  />

                  <AppInput
                    label="Alert Message"
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                  />

                  <AppSwitch
                    label="Dismissible Button"
                    description="Shows an accessible close button"
                    checked={alertDismissible}
                    onChange={setAlertDismissible}
                  />
                </>
              )}

              {/* INPUT CONTROLS */}
              {selectedComponent === "input" && (
                <>
                  <AppInput
                    label="Input Label"
                    value={inputLabel}
                    onChange={(e) => setInputLabel(e.target.value)}
                  />
                  <AppInput
                    label="Placeholder"
                    value={inputPlaceholder}
                    onChange={(e) => setInputPlaceholder(e.target.value)}
                  />
                  <AppInput
                    label="Helper Text"
                    value={inputHelper}
                    onChange={(e) => setInputHelper(e.target.value)}
                  />
                  <AppInput
                    label="Simulated Error"
                    placeholder="Leave blank for valid state"
                    value={inputError}
                    onChange={(e) => setInputError(e.target.value)}
                  />
                  <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-2">
                    <AppSwitch
                      label="Required Indicator"
                      checked={inputRequired}
                      onChange={setInputRequired}
                    />
                    <AppSwitch
                      label="Disabled State"
                      checked={inputDisabled}
                      onChange={setInputDisabled}
                    />
                  </div>
                </>
              )}

              {/* PROGRESS CONTROLS */}
              {selectedComponent === "progress" && (
                <>
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                      <span>Value ({progressVal}%)</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={progressVal}
                      disabled={progressIndeterminate}
                      onChange={(e) => setProgressVal(Number(e.target.value))}
                      className="w-full cursor-pointer accent-[var(--primary)]"
                    />
                  </div>

                  <AppSelect
                    label="Variant"
                    value={progressVariant}
                    onChange={(e) =>
                      setProgressVariant(e.target.value as typeof progressVariant)
                    }
                    options={[
                      { value: "primary", label: "Primary" },
                      { value: "success", label: "Success" },
                      { value: "warning", label: "Warning" },
                      { value: "error", label: "Error" },
                    ]}
                  />

                  <AppSelect
                    label="Size"
                    value={progressSize}
                    onChange={(e) =>
                      setProgressSize(e.target.value as typeof progressSize)
                    }
                    options={[
                      { value: "sm", label: "Small (sm)" },
                      { value: "md", label: "Medium (md)" },
                      { value: "lg", label: "Large (lg)" },
                    ]}
                  />

                  <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-2">
                    <AppSwitch
                      label="Show Percentage Label"
                      checked={progressShowLabel}
                      onChange={setProgressShowLabel}
                    />
                    <AppSwitch
                      label="Indeterminate Mode"
                      description="Simulates ongoing indeterminate task"
                      checked={progressIndeterminate}
                      onChange={setProgressIndeterminate}
                    />
                  </div>
                </>
              )}

              {/* AVATAR CONTROLS */}
              {selectedComponent === "avatar" && (
                <>
                  <AppInput
                    label="Fallback Initials"
                    value={avatarFallback}
                    onChange={(e) => setAvatarFallback(e.target.value)}
                  />

                  <AppSelect
                    label="Size"
                    value={avatarSize}
                    onChange={(e) => setAvatarSize(e.target.value as typeof avatarSize)}
                    options={[
                      { value: "xs", label: "Extra Small (xs)" },
                      { value: "sm", label: "Small (sm)" },
                      { value: "md", label: "Medium (md)" },
                      { value: "lg", label: "Large (lg)" },
                      { value: "xl", label: "Extra Large (xl)" },
                    ]}
                  />

                  <AppSelect
                    label="Status Badge"
                    value={avatarStatus}
                    onChange={(e) =>
                      setAvatarStatus(e.target.value as typeof avatarStatus)
                    }
                    options={[
                      { value: "online", label: "Online (Green)" },
                      { value: "busy", label: "Busy (Red)" },
                      { value: "away", label: "Away (Amber)" },
                      { value: "offline", label: "Offline (Muted)" },
                    ]}
                  />
                </>
              )}

              {/* TABS & ACCORDION & DRAWER INFO */}
              {(selectedComponent === "tabs" ||
                selectedComponent === "accordion" ||
                selectedComponent === "drawer") && (
                <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {selectedComponent === "tabs" && (
                    <p>
                      AppTabs handles keyboard arrows (ArrowLeft/ArrowRight/Home/End) and
                      strict ARIA tab/tabpanel specifications.
                    </p>
                  )}
                  {selectedComponent === "accordion" && (
                    <p>
                      AppAccordion provides keyboard Space/Enter activation, smooth
                      chevron rotation, and accessible region panels.
                    </p>
                  )}
                  {selectedComponent === "drawer" && (
                    <div className="flex flex-col gap-3">
                      <p>
                        AppDrawer slides in smoothly from the screen edge with a backdrop,
                        focus trap, and Escape key dismissal.
                      </p>
                      <AppSelect
                        label="Drawer Side"
                        value={drawerPosition}
                        onChange={(e) =>
                          setDrawerPosition(e.target.value as typeof drawerPosition)
                        }
                        options={[
                          { value: "right", label: "Right Edge" },
                          { value: "left", label: "Left Edge" },
                        ]}
                      />
                      <AppButton variant="primary" onClick={() => setIsDrawerOpen(true)}>
                        Open Slide-Out Drawer
                      </AppButton>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Canvas & Code Snippet */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Live Preview Canvas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Live Preview Canvas</CardTitle>
                <CardDescription>
                  Rendered with active semantic tokens and theme variables
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[220px] p-8 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-center transition-colors">
                {selectedComponent === "button" && (
                  <AppButton
                    variant={btnVariant}
                    size={btnSize}
                    isLoading={btnLoading}
                    disabled={btnDisabled}
                    leftIcon={btnIcon || undefined}
                  >
                    {btnText}
                  </AppButton>
                )}

                {selectedComponent === "badge" && (
                  <AppBadge variant={badgeVariant} leftIcon={badgeIcon || undefined}>
                    {badgeText}
                  </AppBadge>
                )}

                {selectedComponent === "alert" && (
                  <div className="w-full max-w-md">
                    <AppAlert
                      variant={alertVariant}
                      title={alertTitle}
                      dismissible={alertDismissible}
                    >
                      {alertMessage}
                    </AppAlert>
                  </div>
                )}

                {selectedComponent === "input" && (
                  <div className="w-full max-w-sm">
                    <AppInput
                      label={inputLabel}
                      placeholder={inputPlaceholder}
                      helperText={inputHelper}
                      errorMessage={inputError || undefined}
                      required={inputRequired}
                      disabled={inputDisabled}
                    />
                  </div>
                )}

                {selectedComponent === "progress" && (
                  <div className="w-full max-w-md">
                    <AppProgress
                      value={progressIndeterminate ? null : progressVal}
                      variant={progressVariant}
                      size={progressSize}
                      showLabel={progressShowLabel}
                    />
                  </div>
                )}

                {selectedComponent === "avatar" && (
                  <AppAvatar
                    fallback={avatarFallback}
                    size={avatarSize}
                    status={avatarStatus}
                  />
                )}

                {selectedComponent === "tabs" && (
                  <div className="w-full max-w-md">
                    <AppTabs defaultValue="metrics">
                      <AppTabsList>
                        <AppTabsTrigger value="metrics">Metrics</AppTabsTrigger>
                        <AppTabsTrigger value="logs">Logs</AppTabsTrigger>
                        <AppTabsTrigger value="settings">Settings</AppTabsTrigger>
                      </AppTabsList>
                      <AppTabsContent value="metrics">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-muted)]">
                          Operational telemetry graphs: Latency 18ms, throughput 4.2k
                          req/sec.
                        </div>
                      </AppTabsContent>
                      <AppTabsContent value="logs">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-muted)] font-mono">
                          [INFO] Container runtime initialized in 210ms.
                        </div>
                      </AppTabsContent>
                      <AppTabsContent value="settings">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-muted)]">
                          Threshold configurations: Autoscale at 80% CPU memory pressure.
                        </div>
                      </AppTabsContent>
                    </AppTabs>
                  </div>
                )}

                {selectedComponent === "accordion" && (
                  <div className="w-full max-w-md">
                    <AppAccordion type="single" defaultValue={["item-1"]}>
                      <AppAccordionItem value="item-1">
                        <AppAccordionTrigger>Security Compliance</AppAccordionTrigger>
                        <AppAccordionContent>
                          SOC-2 Type II audit logs are archived daily into immutable S3
                          storage vaults.
                        </AppAccordionContent>
                      </AppAccordionItem>
                      <AppAccordionItem value="item-2">
                        <AppAccordionTrigger>Data Retention</AppAccordionTrigger>
                        <AppAccordionContent>
                          Ephemeral telemetry records expire automatically after 30 days
                          of inactivity.
                        </AppAccordionContent>
                      </AppAccordionItem>
                    </AppAccordion>
                  </div>
                )}

                {selectedComponent === "drawer" && (
                  <div className="text-center">
                    <AppButton
                      variant="primary"
                      onClick={() => setIsDrawerOpen(true)}
                      leftIcon="box-archive"
                    >
                      Trigger Slide-Out Drawer ({drawerPosition})
                    </AppButton>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generated JSX Snippet */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Generated JSX</CardTitle>
                <CardDescription>
                  Production-ready snippet matching your active parameters
                </CardDescription>
              </div>
              <AppButton
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                leftIcon={copied ? "check" : "copy"}
              >
                {copied ? "Copied!" : "Copy Code"}
              </AppButton>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-xl bg-[var(--sidebar-bg)] text-[var(--sidebar-foreground)] font-mono text-xs overflow-x-auto border border-[var(--border)] leading-relaxed">
                <code>{generatedCode}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drawer Component for Playground */}
      <AppDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position={drawerPosition}
        title="Node Diagnostics & Metrics"
        description="Real-time execution telemetry for container worker-04"
        footer={
          <AppButton variant="outline" onClick={() => setIsDrawerOpen(false)}>
            Close Panel
          </AppButton>
        }
      >
        <div className="flex flex-col gap-4 text-sm">
          <p className="text-[var(--text-muted)]">
            This slide-out drawer traps focus, prevents background scrolling, and closes
            on Escape or backdrop click.
          </p>
          <div className="p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex flex-col gap-2 font-mono text-xs">
            <div>Pod ID: worker-04-prod-8a9d</div>
            <div>CPU Usage: 42.1%</div>
            <div>Memory Working Set: 312 MB</div>
            <div>Status: Running</div>
          </div>
        </div>
      </AppDrawer>
    </div>
  );
}
