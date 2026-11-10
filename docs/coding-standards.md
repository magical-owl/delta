# Official Coding Standards & Technical Baseline

## 1. Primary Source of Truth & Precedence

All engineering implementations in this repository must conform to official documentation. The hierarchy of precedence is:

1. **Installed Next.js Version Documentation**:
   - Location: `node_modules/next/dist/docs/`
   - Online App Router: https://nextjs.org/docs/app
   - Installed Version: `next@16.4.5`
2. **React Official Documentation**:
   - React 19: https://react.dev
   - Installed Version: `react@19.3.0`
3. **TypeScript Official Documentation**:
   - https://www.typescriptlang.org/docs/
   - Installed Version: `typescript@5.9.3`
4. **Tailwind CSS Official Documentation**:
   - https://tailwindcss.com/docs
   - Installed Version: `@tailwindcss/turbopack@4.3.5`, `tailwindcss@4.3.5`
5. **Zod Validation Documentation**:
   - https://zod.dev
   - Installed Version: `zod@4.6.7`
6. **Vitest & Testing Library Documentation**:
   - Vitest: https://vitest.dev (`vitest@5.1.0`)
   - Testing Library: https://testing-library.com
7. **Docker Official Documentation**:
   - https://docs.docker.com
8. **OWASP Secure Coding Practices**:
   - https://owasp.org/www-project-top-ten/

_Note: When online documentation conflicts with the installed version documentation, the installed version's documented behavior governs._

## 2. TypeScript & Code Style Rules

- **Strict Type Checking**:
  - `strict: true` must remain enabled in `tsconfig.json`.
  - Zero use of `any`. If data origin is uncertain, use `unknown` and validate with a Zod schema before accessing properties.
  - Return types should be explicitly annotated on all exported functions, domain services, and Server Actions.
- **Null Safety**:
  - Nullish coalescing (`??`) and optional chaining (`?.`) are preferred over loose boolean coercion.

## 3. React & App Router Component Standards

- **Server Component First**:
  - All components in `src/app/` are Server Components by default.
  - Fetch data directly in Server Components using async/await; avoid calling internal Route Handlers from Server Components.
- **Client Component Leaf Principle**:
  - Add `'use client'` only at the specific interactive leaf component.
  - Never place `'use client'` in route layouts or top-level page components unless the entire view is an interactive canvas.
- **Props Serialization**:
  - Data passed from Server Components to Client Components must be serializable (plain objects, strings, numbers, booleans, arrays). Never pass server functions or classes containing methods.

## 4. Backend & Mutation Standards

- **Server Actions**:
  - Must declare `'use server'` at the function or file boundary.
  - Must parse input parameters with Zod:
    ```typescript
    const validated = schema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: formatZodError(validated.error) };
    }
    ```
- **Data Access Layer (DAL)**:
  - All persistence or external integration logic must be isolated in `src/server/dal/`.
  - Must begin with `import 'server-only'` to guarantee build-time failure if accidentally imported by client components.
- **Route Handlers (`route.ts`)**:
  - Use `NextRequest` and `NextResponse.json(...)` following Next.js standards.
  - Return uniform JSON contracts with deliberate HTTP status codes (200, 400, 404, 500).

## 5. Security Standards (OWASP Aligned)

- **Input Validation**: Every untrusted input from URL parameters, request bodies, and form submissions must be validated by Zod schemas before processing.
- **Secrets Isolation**:
  - Production secrets must never carry the `NEXT_PUBLIC_` prefix.
  - Access to `process.env.*` secrets is confined strictly to Server Components and `src/server/`.
- **Output Encoding**:
  - React auto-encodes rendered values. Never use `dangerouslySetInnerHTML` unless rendering pre-sanitized markup with a vetted sanitizer.
- **HTTP Security Headers**:
  - The application configures `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and Content Security Policy (CSP) guidelines.

## 6. UI & Accessibility Standards (WCAG 2.2 AA)

- **Semantic HTML**: Use `<header>`, `<main>`, `<footer>`, `<nav>`, `<button>`, and `<form>`. Avoid `<div onClick=...>` anti-patterns.
- **Keyboard Operability**: All interactive controls must be reachable and operable via keyboard (`Tab`, `Space`, `Enter`).
- **Focus Rings**: Interactive components must provide prominent focus visible styles:
  ```css
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
  ```
- **Labels & ARIA**: Form inputs must have programmatic labels (`htmlFor` matching input `id`) or `aria-label`. Error messages must be linked using `aria-describedby` and `aria-invalid`.

## 7. Unit Testing Standards

- **Scope**: Unit testing only. Focus on pure functions, validation schemas, domain services, and UI component render/interaction behavior.
- **Speed & Isolation**: Tests must run completely offline without relying on real network calls or live database sockets.
- **Colocation**: Test files live alongside the code they test (`*.test.ts`, `*.test.tsx`).
- **Assertions**: Use `@testing-library/jest-dom` matchers for readable, user-centric assertions.

## 8. Docker & Production Standards

- **Standalone Mode**: Next.js configuration must specify `output: 'standalone'`.
- **Non-Root Runtime**: Production Docker containers must run under an unprivileged user (UID `1001`, `nextjs`).
- **Isolation Enforcement**: `.dockerignore` must exclude development agents, test fixtures, and git metadata.
