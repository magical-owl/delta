import Link from "next/link";
import { AppIcon, type IconName } from "@/components/ui/app-icon";

interface ComponentCategory {
  title: string;
  description: string;
  href: string;
  icon: IconName;
  components: string[];
}

const categories: ComponentCategory[] = [
  {
    title: "Input Controls & Forms",
    description:
      "Accessible text fields, email, password visibility toggles, number, search, resizable textarea, and shared form field wrapper.",
    href: "/dashboard/components/inputs",
    icon: "font",
    components: ["AppInput", "AppTextarea", "AppButton", "AppFormField"],
  },
  {
    title: "Selection Controls",
    description:
      "Native styled dropdown selects, single & multi checkboxes, radio button groups, and animated toggle switches.",
    href: "/dashboard/components/selections",
    icon: "list-check",
    components: ["AppSelect", "AppCheckbox", "AppRadioGroup", "AppSwitch"],
  },
  {
    title: "Date & Time Pickers",
    description:
      "Timezone-safe native date inputs, datetime-local controls, minimum/maximum bounds, and date range validation.",
    href: "/dashboard/components/dates",
    icon: "calendar-days",
    components: ["AppDateInput"],
  },
  {
    title: "Data Tables",
    description:
      "Production-ready tables with sortable columns, live query filtering, pagination controls, and row selection.",
    href: "/dashboard/components/tables",
    icon: "table",
    components: ["AppTable"],
  },
  {
    title: "Feedback & Overlays",
    description:
      "Contextual alert banners, status badges, focus-trapped modal dialogs, slide-out drawers, floating popovers, and tooltips.",
    href: "/dashboard/components/feedback",
    icon: "bell",
    components: [
      "AppAlert",
      "AppBadge",
      "AppDialog",
      "AppDrawer",
      "AppPopover",
      "AppTooltip",
    ],
  },
  {
    title: "Navigation & Structure",
    description:
      "Accessible multi-panel tabs, animated collapsible accordions, and semantic breadcrumb navigation.",
    href: "/dashboard/playground",
    icon: "layer-group",
    components: ["AppTabs", "AppAccordion", "AppBreadcrumbs"],
  },
  {
    title: "Indicators & Media",
    description:
      "Linear progress bars, user avatars with status dots, and pulse skeleton loading placeholders.",
    href: "/dashboard/playground",
    icon: "chart-line",
    components: ["AppProgress", "AppAvatar", "AppSkeleton"],
  },
  {
    title: "Interactive UI Playground",
    description:
      "Live component workbench to tweak props interactively, test responsive states, and copy JSX code snippets.",
    href: "/dashboard/playground",
    icon: "sliders",
    components: ["Live Studio", "Prop Controls", "JSX Generator"],
  },
];

export default function ComponentLibraryOverviewPage() {
  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      {/* Intro Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Reusable Component System
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-3xl leading-relaxed">
          Centralized UI foundation designed strictly with WCAG 2.2 AA accessibility, Font
          Awesome Free CSS webfonts, and persistent light/dark theme CSS variables.
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className="group flex flex-col justify-between p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] hover:shadow-lg transition-all duration-200"
          >
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-selected-bg)] text-[var(--primary)] flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                <AppIcon name={cat.icon} />
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                  <span>{cat.title}</span>
                  <AppIcon
                    name="arrow-right"
                    size="xs"
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--primary)]"
                  />
                </h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--border)] flex flex-wrap gap-1.5">
              {cat.components.map((comp) => (
                <span
                  key={comp}
                  className="px-2 py-0.5 rounded-md text-xs font-mono bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]"
                >
                  {comp}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
