# ADR 0001: Next.js App Router Scaffold Architecture & Isolation Model

- **Status**: Accepted
- **Date**: 2026-11-10
- **Deciders**: Solution Architect, Lead Engineering Orchestrator

## Context & Problem Statement

We need a reusable, production-oriented Next.js full-stack scaffold that supports future SaaS, enterprise dashboards, and business web applications. The scaffold must establish clean architectural patterns, unit test coverage, Docker containerization, and a multi-agent development engineering framework while preventing development-time agent resources from leaking into the production runtime.

## Decision Drivers

1. Strict alignment with official Next.js App Router standards (`next@16.4.5`).
2. Absolute separation of AI engineering agent definitions from the application runtime.
3. Minimal attack surface and containerized standalone deployment.
4. Fast, isolated unit test suite without external runtime dependencies.
5. Prevention of premature complexity (no unnecessary databases, ORMs, or integration frameworks).

## Considered Options

1. **Next.js Pages Router**: Mature, but does not leverage modern Server Components, streaming, or current official defaults.
2. **Next.js App Router with Monolithic Client Architecture (`'use client'` everywhere)**: Discards performance and security benefits of Server Components.
3. **Next.js App Router with Strict Layering & Server Component Defaults**: Preferred. Server components handle server logic; client components are restricted to interactive leaves.

## Decision Outcome

We adopted **Option 3: Next.js App Router with Strict Layering & Server Component Defaults**.

Key elements:

- **Server/Client Boundary**: Server Components by default; Client Components isolated at leaf UI nodes.
- **Data Access Layer**: Protected via `import 'server-only'` in `src/server/dal/`.
- **Validation**: Zod schema validation across all Server Actions and Route Handlers.
- **Agent Isolation**: `.agents/` and `AGENTS.md` are development-only; `.dockerignore` and multi-stage Docker builds enforce runtime isolation.
- **Containerization**: Multi-stage Dockerfile leveraging Next.js `output: 'standalone'` running under non-root user `nextjs`.
- **Testing**: Vitest + React Testing Library + `@testing-library/jest-dom` for focused, offline unit testing.

## Consequences

- **Positive**: High performance, small Docker image sizes, rapid unit test execution, clear separation of concerns, zero risk of agent instructions leaking to end users.
- **Negative / Trade-offs**: Asynchronous Server Components cannot be unit-tested via jsdom directly; business logic must be isolated in pure domain services to achieve high unit test coverage.
