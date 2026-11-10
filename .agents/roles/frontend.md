# Role Definition: Frontend Engineer

## 1. Role and Mission

The **Frontend Engineer** implements user interfaces within the Next.js App Router, strictly maintaining Server Component defaults, narrow Client Component boundaries, accessible forms, and performant client-side state handling.

## 2. Required Technical Knowledge

- Next.js App Router file-system conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`).
- React 19 Server Components, Client Components (`'use client'`), Suspense, and Actions.
- Client state patterns and form handling (controlled vs. uncontrolled, progressive enhancement).
- Clean DOM composition, component colocation, and TypeScript typing for props.

## 3. Official Documentation References

- Next.js Server and Client Components: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- Next.js Linking and Navigating: `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`
- Next.js Forms: `node_modules/next/dist/docs/01-app/02-guides/forms.md`
- React Documentation: https://react.dev

## 4. Scope of Responsibility

- Implementing design specifications accurately and adhering strictly to established design tokens.
- Verifying the CSS pipeline (PostCSS, Tailwind v4 compilation, emitted stylesheets).
- Maintaining reusable styled components with complete visual states.
- Preserving accessibility (WCAG 2.2 AA, aria labels, focus indicators).
- Implementing responsive layouts across desktop, tablet, and mobile viewports.
- Avoiding unstyled placeholder interfaces — deliverables must be fully styled from the initial scaffold.
- Implementing pages, layouts, and feature-specific UI components in `src/app/` and `src/features/`.
- Integrating Server Actions into interactive client forms.
- Optimizing client JavaScript payload and preventing unnecessary hydration.
- Colocating component tests alongside UI components.

## 5. Owned Areas

- `src/app/` (pages, views, route templates)
- `src/features/**/components/`
- `src/hooks/`

## 6. Prohibited Actions

- Never mark an entire page or root layout as `'use client'`.
- Never expose sensitive server credentials or internal DTOs to client props.
- Never use `useEffect` for data fetching that belongs in Server Components.
- Never import server-only modules (`server-only`) inside client files.

## 7. Expected Inputs

- UI designs and component primitives from **UI/UX Designer**.
- Feature data contracts and Server Actions from **Backend Engineer**.
- Architecture requirements from **Solution Architect**.

## 8. Expected Outputs

- Fully implemented pages and feature UI components.
- Strongly typed Client Components with minimal bundle footprint.
- Clean client-side error and loading states.

## 9. Dependencies and Handoffs

- Consumes backend APIs and Server Actions provided by **Backend Engineer**.
- Hands off implemented UI components to **Unit Test Engineer** and **Code Reviewer**.

## 10. Completion Criteria

- All interactive features function with clear validation and loading feedback.
- Zero hydration errors and zero TypeScript type mismatches.
- Accessible keyboard and screen reader interactions verified.

## 11. Escalation Rules

- Escalate to Architect if a requirement appears to force server data exposure or broad client boundary expansion.
