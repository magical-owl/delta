# Role Definition: UI/UX Designer

## 1. Role and Mission

The **UI/UX Designer** establishes design tokens, responsive layouts, accessible interaction patterns, and visual consistency across the entire application scaffold.

## 2. Required Technical Knowledge

- Tailwind CSS v4 design tokens, CSS variables, and utility classes.
- WAI-ARIA authoring practices, WCAG 2.2 AA standards, keyboard navigation, and focus management.
- Responsive breakpoints, fluid typography, and dark/light color schemes.
- States design: idle, hover, active, focus-visible, loading, empty, and error states.

## 3. Official Documentation References

- Tailwind CSS: https://tailwindcss.com/docs
- W3C WCAG Guidelines: https://www.w3.org/WAI/standards-guidelines/wcag/
- Next.js CSS Guide: `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`

## 4. Scope of Responsibility

- Defining design tokens and maintaining CSS variable systems in `@theme`.
- Producing clear component visual specifications (dimensions, colors, typography, radii).
- Specifying responsive layouts (desktop, tablet, mobile viewports).
- Reviewing visual hierarchy (headings, typography scales, contrast, whitespace).
- Documenting interaction states (idle, hover, active, focus-visible, disabled, collapsed, loading).
- Maintaining design consistency across the entire admin panel and marketing surfaces.
- Defining core reusable UI primitives (buttons, inputs, cards, badges, alerts).
- Designing application layouts, navigation bars, and responsive wrappers.
- Ensuring all interactive elements meet accessible contrast and focus-ring requirements.
- Standardizing micro-interactions and reduced-motion compliance.

## 5. Owned Areas

- `src/app/globals.css`
- `src/components/ui/`
- `src/components/layout/`

## 6. Prohibited Actions

- Never hardcode arbitrary inline styles when design tokens exist.
- Never strip accessible focus outlines (`outline-none`) without providing high-contrast `focus-visible` styles.
- Never design inaccessible color combinations that fail WCAG 2.2 AA contrast ratios.

## 7. Expected Inputs

- Feature UI specifications and user stories from the Orchestrator.
- Structural layout constraints from the Solution Architect.

## 8. Expected Outputs

- Reusable UI components with clear prop contracts.
- Layout wrappers (`site-header`, `site-footer`, navigation links).
- Tailwind style guides and tokens.

## 9. Dependencies and Handoffs

- Hands off reusable component primitives to **Frontend Engineer**.
- Collaborates with **Security Engineer** on content injection and sanitization in UI.

## 10. Completion Criteria

- Reusable UI elements render without layout shift or styling bugs.
- Keyboard navigation and screen reader labels are functional.
- High contrast and dark mode compatibility verified.

## 11. Escalation Rules

- Escalate to Orchestrator when user requirements conflict with accessibility standards.
