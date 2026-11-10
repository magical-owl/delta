<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Engineering & Multi-Agent Orchestration Protocol

This repository is a production-oriented Next.js full-stack scaffold governed by a structured multi-agent engineering system.

## 1. Primary Source of Truth: Documentation-First Policy

All code, architecture, and tool usage must align strictly with official documentation:

1. **Next.js App Router**: Installed version documentation in `node_modules/next/dist/docs/` is primary. Online docs: https://nextjs.org/docs/app
2. **React 19**: https://react.dev
3. **TypeScript**: https://www.typescriptlang.org/docs/
4. **Tailwind CSS**: https://tailwindcss.com/docs
5. **Vitest**: https://vitest.dev
6. **Testing Library**: https://testing-library.com
7. **Zod**: https://zod.dev
8. **Docker**: https://docs.docker.com
9. **OWASP**: https://owasp.org

Do not rely solely on past LLM training weights. When framework behavior differs, prioritize the installed version (`next@16.4.5`).

## 2. Technology Stack & Key Decisions

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript in strict mode (`tsconfig.json`)
- **Styling**: Tailwind CSS v4 with composable CSS variables
- **Components**: Accessible primitives inspired by shadcn/ui (`cva`, `clsx`, `tailwind-merge`, `lucide-react`)
- **Validation**: Zod schemas for all boundaries (forms, Route Handlers, Server Functions)
- **Data Boundaries**: Distinct Presentation, Services, and Data Access Layers (`server-only`)
- **Testing**: Vitest + React Testing Library + `@testing-library/jest-dom`
- **Package Manager**: pnpm (frozen lockfile enforcement)
- **Containerization**: Multi-stage Dockerfile with `output: 'standalone'` and unprivileged `nextjs` user
- **CI**: GitHub Actions with frozen dependency checks, typecheck, lint, test, and build

## 3. Strict Development / Runtime Boundary

The AI agent architecture (`AGENTS.md`, `CLAUDE.md`, `.agents/**`) is a DEVELOPMENT-TIME ONLY engineering framework:

- Agent files must NEVER be imported in `src/`.
- Agent files must NEVER be copied into production Docker images (enforced by `.dockerignore` and multi-stage copying).
- Agent files must NEVER be served via routes or exposed to public clients.

## 4. Multi-Agent Team Structure

All development tasks proceed through defined agent roles located in `.agents/roles/`:

- **Orchestrator** (`.agents/orchestrator.md`): End-to-end task coordination and quality enforcement.
- **Solution Architect** (`.agents/roles/architect.md`): Module boundaries, ADRs, interface contracts.
- **UI/UX Designer** (`.agents/roles/ui-ux.md`): Accessible design tokens, responsive layout, states.
- **Frontend Engineer** (`.agents/roles/frontend.md`): App Router UI, Server Components by default, narrow Client Components.
- **Backend Engineer** (`.agents/roles/backend.md`): Domain services, Route Handlers, Server Actions, input validation.
- **Database Engineer** (`.agents/roles/database.md`): Schema models, migrations, repository boundaries (when persistence is required).
- **Security Engineer** (`.agents/roles/security.md`): OWASP compliance, zero trust, sanitized output, header protection.
- **Unit Test Engineer** (`.agents/roles/unit-test.md`): Isolated unit tests, fixtures, mocks, coverage.
- **Code Reviewer** (`.agents/roles/code-review.md`): Correctness, clean code, pattern adherence, regression prevention.
- **DevOps Engineer** (`.agents/roles/devops.md`): Docker builds, CI quality gates, dependency hygiene.

## 5. Development Workflows

Standard workflows are documented in `.agents/workflows/`:

- `feature-delivery.md`: Requirements -> Docs -> Architecture -> UI/UX -> Implementation -> Test -> Review -> Quality Gates -> Delivery.
- `bugfix.md`: Reproduction -> Root Cause Analysis -> Minimal Fix -> Regression Test -> Verification.
- `release.md`: Audit -> Standalone Verification -> Docker Image Scan -> Tagging & Artifact Generation.

## 6. Frontend & Backend Engineering Standards

### Frontend

- Server Components by default; Client Components (`'use client'`) only for state, effects, or DOM APIs.
- Keep Client Component boundaries at the leaf level.
- Semantic HTML and WCAG 2.2 AA accessibility (proper labels, keyboard navigation, focus visible).
- Responsive layouts with Tailwind utility classes.
- Enforce the mandatory design system (`docs/design-system.md`).
- A technically functioning component without complete visual styling is a failed deliverable. No unstyled HTML or placeholder UI.
- Strictly forbidden: inline SVG markup, Lucide React, Heroicons, or emoji icons. Use Font Awesome Free CSS webfonts through the reusable `AppIcon` component.

### Backend

- Input validation: Parse and validate all incoming inputs using Zod.
- Data Access Layer: Enforce `import 'server-only'` to prevent leaking server logic to client bundles.
- Route Handlers & Server Actions: Return consistent JSON contracts `{ success: true, data }` or `{ success: false, error }`.
- Never trust client inputs; always re-validate permissions and constraints on the server.

## 7. Mandatory Quality Gates

Before any change is committed or considered complete:

1. `pnpm typecheck` - Zero TypeScript errors.
2. `pnpm lint` - Zero ESLint errors or unhandled warnings.
3. `pnpm format:check` - Complete Prettier conformity.
4. `pnpm test` - All Vitest unit tests pass.
5. `pnpm build` - Clean production build with standalone artifacts and verified CSS emission.
6. Verify `.agents/` and development assets do not leak into build outputs or containers.
7. Visual Quality Gate - Verify rendered outputs at desktop (1440px) and mobile (390px) viewports: confirm design tokens, font rendering, icon loading, responsive layout, and interactive states. Reject unstyled deliverables.

## 8. Human Escalation Rules

Agents must immediately escalate to the human lead when:

- Proposed changes require adding a new database, ORM, auth provider, or cloud dependency.
- Official documentation conflicts with business requirements or project constraints.
- Breaking changes in third-party dependencies cannot be resolved cleanly within current versions.
- Security-sensitive secrets or infrastructure credentials are required.
