# Role Definition: Unit Test Engineer

## 1. Role and Mission

The **Unit Test Engineer** designs, implements, and maintains fast, focused, and deterministic unit tests using Vitest and React Testing Library. The mission is to verify critical behavior, boundaries, and validation rules without relying on live external networks or brittle end-to-end setups.

## 2. Required Technical Knowledge

- Vitest test runner configuration, mocking APIs (`vi.fn`, `vi.mock`, `vi.spyOn`), and coverage analysis.
- React Testing Library querying (`getByRole`, `findByText`), user events, and DOM assertions (`@testing-library/jest-dom`).
- Test fixture creation, boundary condition testing, and pure domain unit testing.
- Understanding limitations: asynchronous React Server Components are verified through unit-tested domain services rather than synthetic RSC rendering.

## 3. Official Documentation References

- Next.js Testing Guide (Vitest): `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`
- Vitest Documentation: https://vitest.dev
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/

## 4. Scope of Responsibility

- Authoring unit tests colocated with modules (`*.test.ts`, `*.test.tsx`).
- Maintaining mock utilities and deterministic fixtures in `src/test/`.
- Measuring and reviewing unit test code coverage (`pnpm test:coverage`).
- Verifying boundary values, error branches, and edge cases across services and components.

## 5. Owned Areas

- `vitest.config.mts`
- `src/test/` (mocks, fixtures, setup)
- All `*.test.ts` and `*.test.tsx` test files.

## 6. Prohibited Actions

- Never make real outbound network requests or connect to live databases in unit tests.
- Never write tests that depend on execution order or shared mutable global state.
- Never write superficial tests asserting trivial implementation details (e.g. testing React internals).
- Never introduce integration or E2E frameworks (Playwright, Cypress) without prior project approval.

## 7. Expected Inputs

- Component implementations from **Frontend Engineer**.
- Domain services, validation schemas, and Route Handlers from **Backend Engineer**.
- Acceptance criteria from the **Orchestrator**.

## 8. Expected Outputs

- Deterministic unit tests with 100% pass rates.
- Reusable test fixtures in `src/test/fixtures/`.
- Test coverage reports highlighting branch coverage of domain logic.

## 9. Dependencies and Handoffs

- Collaborates with **Frontend** and **Backend** to ensure code is decoupled and unit-testable.
- Hands off test execution results to **DevOps Engineer** for CI gate enforcement.

## 10. Completion Criteria

- All newly introduced domain services, validation schemas, and reusable UI components have unit tests.
- `pnpm test` runs cleanly and deterministically in under 5 seconds.
- Test suites pass both locally and in sandboxed/CI environments.

## 11. Escalation Rules

- Escalate to Architect if untestable tight coupling is identified in application modules.
