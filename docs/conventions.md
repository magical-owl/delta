# Project Conventions & Guidelines

## 1. File & Directory Naming Conventions

- **Directories**: Use lowercase kebab-case (e.g., `src/components/ui/`, `src/server/services/`, `src/features/inquiry/`).
- **Source Files**: Use lowercase kebab-case with descriptive suffixes:
  - React Components: `button.tsx`, `site-header.tsx`, `inquiry-form.tsx`
  - Domain Services: `inquiry.service.ts`
  - Validation Schemas: `inquiry.schema.ts`
  - Server Actions: `submit-inquiry.action.ts`
  - Data Access: `health.dal.ts`
  - Tests: colocated alongside subject file as `[name].test.ts` or `[name].test.tsx`
- **Next.js App Router Special Files**: Follow framework exact casing:
  - `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`

## 2. TypeScript Conventions

- **Strict Mode**: Enabled in `tsconfig.json` (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`).
- **No `any`**: Disallow `any`. Use `unknown` for unvalidated data, narrow via Zod schemas or type guards.
- **Explicit Types**: Export types with descriptive names. Prefer `interface` for object structures that may be extended, and `type` for unions/aliases.
- **Discriminated Unions**: Use discriminated unions for operation outcomes (e.g., `{ success: true, data: T } | { success: false, error: AppError }`).

## 3. Server and Client Component Conventions

- **Server Component First**: Never add `'use client'` unless the component strictly requires:
  1. Browser event listeners (`onClick`, `onChange`, `onSubmit`).
  2. React state or lifecycle hooks (`useState`, `useReducer`, `useTransition`, `useEffect`).
  3. Custom client hooks or browser-only APIs (`window`, `localStorage`).
- **Leaf-Level Boundaries**: Place `'use client'` at the lowest possible leaf in the component tree. Pass server-rendered JSX or children into client wrappers rather than marking parent containers as client components.
- **Server-Only Protection**: Any module in `src/server/` that reads server environment variables or accesses internal server logic must begin with:
  ```typescript
  import "server-only";
  ```
- **Server Functions**: All Server Actions must include the `'use server'` directive and validate all arguments with Zod before invoking domain services.

## 4. Styling Conventions

- Use **Tailwind CSS** utility classes directly in JSX.
- For conditional or combined classes, use the standardized `cn()` helper (`clsx` + `tailwind-merge`).
- Avoid arbitrary inline CSS values (e.g. `w-[347px]`); utilize the design system's spacing scale and semantic tokens.
- Maintain accessible focus indicators: always pair interactive controls with `focus-visible:ring-2 focus-visible:ring-offset-2`.

## 5. Import Ordering

Maintain structured import grouping:

1. Node built-ins / framework modules (`react`, `next`, `next/server`).
2. Third-party packages (`zod`, `clsx`, `lucide-react`).
3. Internal aliased modules (`@/components/*`, `@/lib/*`, `@/server/*`).
4. Relative imports (`./types`, `./styles.css`).
