# Reusable Component Library Reference

This document catalogs the 24 core accessible UI components located in `src/components/ui/`.

---

## 1. Iconography Policy: Font Awesome Free WebFonts Only

Per mandatory project constraints, **no inline SVG markup, SVG icon components, Lucide React, or Heroicons are permitted**.
All icons must use `AppIcon` backed by Font Awesome Free 7.3.1 WebFonts:

```tsx
import { AppIcon } from "@/components/ui/app-icon";

<AppIcon name="chart-pie" size="md" srLabel="Telemetry Chart" />;
```

---

## 2. Component Directory

### `AppButton`

- **Location**: `src/components/ui/app-button.tsx`
- **Variants**: `primary`, `secondary`, `outline`, `destructive`, `ghost`, `icon`
- **Sizes**: `sm`, `md`, `lg`, `icon`
- **Features**: `isLoading` (renders spinning Font Awesome `spinner`), `leftIcon`, `rightIcon`, full keyboard accessibility and disabled state.

### `AppInput`

- **Location**: `src/components/ui/app-input.tsx`
- **Features**: Accessible label, helper text, error message with `role="alert"` and `aria-invalid`, leading/trailing `leftIcon` and `rightIcon` slots, and password visibility toggle with `eye` / `eye-slash` Font Awesome icons.

### `AppTextarea`

- **Location**: `src/components/ui/app-textarea.tsx`
- **Features**: Label, helper text, error message, resize-y, character counter (`showCount` + `maxLength`).

### `AppSelect`

- **Location**: `src/components/ui/app-select.tsx`
- **Features**: Native accessible `<select>` with custom styled wrapper, Font Awesome `chevron-down` indicator, option list or JSX children, helper and error text.

### `AppCheckbox`

- **Location**: `src/components/ui/app-checkbox.tsx`
- **Features**: Accessible checkbox with custom check indicator (`check` Font Awesome icon), support for indeterminate states, description line, and validation error messages.

### `AppRadioGroup`

- **Location**: `src/components/ui/app-radio-group.tsx`
- **Features**: Structured semantic `<fieldset role="radiogroup">` and `<legend>`, styled option cards with title and description, full keyboard navigation.

### `AppSwitch`

- **Location**: `src/components/ui/app-switch.tsx`
- **Features**: Semantic `role="switch"`, `aria-checked`, keyboard Enter/Space activation, animated indicator pill, label, description, and disabled state.

### `AppDateInput`

- **Location**: `src/components/ui/app-date-input.tsx`
- **Features**: Timezone-safe native date and datetime-local picker, `calendar` / `calendar-days` Font Awesome icons, minimum and maximum date bounds, error messaging.

### `AppTable`

- **Location**: `src/components/ui/app-table.tsx`
- **Features**: Generic data table (`AppTable<T>`), sortable headers with `sort`, `sort-up`, `sort-down` icons, live text search/filter bar, client pagination controls, multi-row selection with indeterminate "Select All", skeleton loading animation, and customizable empty state.

### `AppBadge`

- **Location**: `src/components/ui/app-badge.tsx`
- **Variants**: `default`, `primary`, `success`, `warning`, `error`, `destructive`, `info`, `outline`
- **Features**: Pill badges with high-contrast text and border, optional `leftIcon`.

### `AppAlert`

- **Location**: `src/components/ui/app-alert.tsx`
- **Variants**: `info`, `success`, `warning`, `error`, `destructive`, `default`
- **Features**: Semantic `role="alert"`, status icon (Font Awesome), title, description, and dismissible close button.

### `AppDialog`

- **Location**: `src/components/ui/app-dialog.tsx`
- **Features**: Modal dialog rendered via `createPortal`, backdrop blur overlay, automatic focus trap, Escape key dismiss, body scroll lock, close button, and header/footer slots.

### `AppPopover`

- **Location**: `src/components/ui/app-popover.tsx`
- **Features**: Floating panel triggered by custom element, alignment options (`left`, `right`, `center`), outside-click dismiss, and Escape key listener.

### `AppTooltip`

- **Location**: `src/components/ui/app-tooltip.tsx`
- **Features**: Accessible tooltip (`role="tooltip"`, `aria-describedby`), triggered by hover and keyboard focus, positioning (`top`, `bottom`, `left`, `right`).

### `ThemeToggle`

- **Location**: `src/components/ui/theme-toggle.tsx`
- **Features**: Accessible switcher button with `sun` / `moon` Font Awesome icons, dynamic aria-label, and persistent theme toggling.

### `AppFormField`

- **Location**: `src/components/ui/app-form-field.tsx`
- **Features**: Centralized wrapper extracting label rendering, required indicators, helper text, and accessible error message linking (`aria-describedby`, `aria-invalid`, `aria-errormessage`) for form inputs.

### `AppTabs`

- **Location**: `src/components/ui/app-tabs.tsx`
- **Primitives**: `AppTabs`, `AppTabsList`, `AppTabsTrigger`, `AppTabsContent`
- **Features**: ARIA `tablist`/`tab`/`tabpanel` roles, ArrowLeft/ArrowRight/Home/End keyboard navigation, active indicator pill, and animated panel transitions.

### `AppAccordion`

- **Location**: `src/components/ui/app-accordion.tsx`
- **Primitives**: `AppAccordion`, `AppAccordionItem`, `AppAccordionTrigger`, `AppAccordionContent`
- **Features**: Single and multiple expansion modes, animated chevron rotation (`chevron-down`), `aria-expanded` and `aria-controls` bindings.

### `AppBreadcrumbs`

- **Location**: `src/components/ui/app-breadcrumbs.tsx`
- **Features**: Semantic `<nav aria-label="Breadcrumb">` with `<ol>`, current page indicator (`aria-current="page"`), home link, and Font Awesome `angle-right` dividers.

### `AppProgress`

- **Location**: `src/components/ui/app-progress.tsx`
- **Features**: Linear progress bar with `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, variants (`primary`, `success`, `warning`, `error`), optional percentage label, and indeterminate mode.

### `AppAvatar`

- **Location**: `src/components/ui/app-avatar.tsx`
- **Features**: Accessible user avatar supporting remote image with automatic fallback to text initials or Font Awesome `user` icon, sizes (`xs` through `xl`), and status indicator dots (`online`, `offline`, `busy`, `away`).

### `AppDrawer`

- **Location**: `src/components/ui/app-drawer.tsx`
- **Features**: Slide-out modal panel using `createPortal`, left/right positioning, backdrop blur, focus trap, Escape key dismiss, and scroll lock.

### `AppSkeleton`

- **Location**: `src/components/ui/app-skeleton.tsx`
- **Features**: Accessible loading placeholder with `animate-pulse`, variants (`text`, `circular`, `rectangular`), and customizable dimensions.
