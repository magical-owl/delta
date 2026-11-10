# Production-Oriented Next.js Scaffold with AI Agent Orchestration

A reusable, production-ready full-stack application scaffold built on **Next.js 16 (App Router)**, **React 19**, **TypeScript (Strict Mode)**, **Tailwind CSS v4**, and a structured **Multi-Agent Engineering Framework**.

Designed for SaaS platforms, enterprise dashboards, and administrative systems requiring strict documentation compliance, secure architecture, high unit-test coverage, and containerized deployment.

---

## 1. Key Architectural Principles

1. **Official Documentation-First**: Strictly follows official guides for Next.js App Router (`node_modules/next/dist/docs/`), React 19, TypeScript, and OWASP.
2. **Strict Development / Runtime Boundary**: AI agent architecture files (`AGENTS.md`, `CLAUDE.md`, `.agents/`) are strictly development-time engineering resources. They are mathematically excluded from production client bundles and Docker containers.
3. **Server Components by Default**: Server-side data fetching and rendering default; Client Components (`'use client'`) are confined to leaf interactive components.
4. **Data Access Layer (DAL) Boundary**: Server persistence and sensitive logic reside in `src/server/dal/` and are protected with `import 'server-only'`.
5. **Deterministic Unit Testing**: Vitest and React Testing Library provide offline, deterministic unit test coverage (>95%) without brittle E2E or external network dependencies.
6. **Hardened Multi-Stage Docker**: Generates minimal standalone outputs running under an unprivileged `nextjs` system user with built-in `/api/health` monitoring.

---

## 2. Technology Stack & Installed Versions

| Component           | Technology                               | Installed Version                               |
| :------------------ | :--------------------------------------- | :---------------------------------------------- |
| **Framework**       | Next.js (App Router)                     | `16.4.5`                                        |
| **UI Library**      | React / React DOM                        | `19.3.0`                                        |
| **Language**        | TypeScript (Strict)                      | `5.9.3`                                         |
| **Styling**         | Tailwind CSS v4                          | `4.3.5`                                         |
| **Primitives**      | shadcn/ui inspired (cva, clsx, tw-merge) | `cva@0.7.1`, `tailwind-merge@3.7.0`             |
| **Icons**           | Lucide React                             | `1.70.0`                                        |
| **Validation**      | Zod                                      | `4.6.7`                                         |
| **Testing**         | Vitest + RTL + jest-dom                  | `vitest@5.1.0`, `@testing-library/react@16.3.3` |
| **Package Manager** | pnpm                                     | `12.18.0`                                       |
| **Container**       | Docker / Compose                         | Multi-stage Node 22 Alpine                      |

---

## 3. Directory Topology

```
.
├── .agents/                    # Multi-agent engineering system (DEVELOPMENT ONLY)
│   ├── orchestrator.md         # End-to-end task coordination & quality enforcement
│   ├── roles/                  # Specialist roles (Architect, Frontend, Backend, etc.)
│   ├── workflows/              # Structured engineering workflows
│   └── templates/              # Task & handoff templates
├── .github/workflows/          # GitHub Actions CI quality gates
├── docs/                       # Comprehensive architectural documentation
│   ├── architecture.md         # System design, data flow & security boundaries
│   ├── coding-standards.md     # Official standards, rules & source precedence
│   ├── conventions.md          # File naming, TypeScript & component conventions
│   ├── docker.md               # Containerization & isolation verification guide
│   ├── testing-strategy.md     # Unit testing policy & deferred scopes
│   └── decisions/              # Architecture Decision Records (ADRs)
├── public/                     # Static client assets
├── src/
│   ├── app/                    # Next.js App Router (Layouts, Pages, Route Handlers)
│   │   ├── api/health/         # Healthcheck Route Handler
│   │   ├── api/inquiries/      # Domain Inquiries Route Handler
│   │   ├── layout.tsx          # Root Layout (System fonts, metadata)
│   │   └── page.tsx            # Architecture & Interactive Showcase
│   ├── components/
│   │   ├── layout/             # SiteHeader, SiteFooter
│   │   └── ui/                 # Reusable primitives (Button, Card, Badge, Input, Alert)
│   ├── features/
│   │   └── inquiry/            # Vertical feature slice (Components, Actions)
│   ├── lib/
│   │   ├── security/           # OWASP headers & security utilities
│   │   ├── utils/              # cn (clsx + tailwind-merge)
│   │   └── validation/         # Zod schemas (inquirySchema)
│   ├── server/
│   │   ├── dal/                # Data Access Layer (protected with 'server-only')
│   │   └── services/           # Domain business services
│   └── test/                   # Vitest setup & mocks
├── Dockerfile                  # Multi-stage standalone container
├── compose.yaml                # Production-like local orchestration
├── .dockerignore               # Complete exclusion of agent assets from builds
└── package.json
```

---

## 4. Multi-Agent Development System

The project is governed by 10 specialized agent roles defined in `.agents/roles/`:

- **Orchestrator**: Master planning, documentation compliance, and quality enforcement.
- **Solution Architect**: System boundaries, ADRs, and module contracts.
- **UI/UX Designer**: Accessible design tokens, responsive layouts, and state patterns.
- **Frontend Engineer**: Server Component UI, leaf Client Components, and forms.
- **Backend Engineer**: Domain services, Server Actions, Route Handlers, and validation.
- **Database Engineer**: Data modeling, repository adapters, and migrations (deferred until required).
- **Security Engineer**: OWASP Top 10 compliance, secrets management, and header hardening.
- **Unit Test Engineer**: Focused, deterministic Vitest suites with >90% coverage.
- **Code Reviewer**: Quality gate compliance, static analysis, and regression prevention.
- **DevOps Engineer**: Standalone Docker builds, CI pipelines, and isolation verification.

---

## 5. Development & Quality Gate Commands

All quality gates must pass before submitting or merging changes:

```bash
# Start local Next.js development server
pnpm dev

# Type check with strict TypeScript
pnpm typecheck

# Run ESLint across entire codebase
pnpm lint

# Verify Prettier formatting
pnpm format:check

# Auto-format codebase
pnpm format

# Run all unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Generate V8 unit test coverage report
pnpm test:coverage

# Build optimized production bundle (standalone output)
pnpm build
```

---

## 6. Docker & Container Deployment

### Local Production Emulation

```bash
# Build and run container with Compose
docker compose up --build -d

# Check container health status
docker compose ps

# Test health check endpoint
curl -i http://localhost:3000/api/health
```

### Development Asset Isolation Verification

To prove mathematically that development agent files and test suites never leak into the production container:

```bash
docker run --rm delta-scaffold:latest find /app -name "*agent*" -o -name "AGENTS.md"
# Expected output: (empty)
```

---

## 7. License

MIT
