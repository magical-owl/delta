# Workflow: Bugfix Lifecycle

This workflow governs reporting, isolating, fixing, and verifying defects within the scaffold.

## 1. Reproduction & Isolation

- **Agent**: Unit Test Engineer & Orchestrator
- **Action**: Reproduce the reported defect in a minimal, isolated unit test.
- **Rule**: The test must fail predictably before any code is modified.

## 2. Root Cause Analysis (RCA)

- **Agent**: Frontend or Backend Engineer (guided by Solution Architect)
- **Action**: Trace the failure to its origin (schema validation error, serialization mismatch, styling clash, or environment variable misconfiguration).
- **Rule**: Check official documentation to verify whether the behavior is expected or a misinterpretation of framework APIs.

## 3. Targeted Remediation

- **Agent**: Specialist Engineer (Frontend / Backend / DevOps)
- **Action**: Implement the minimal correct patch that resolves the issue without introducing unrelated refactoring.
- **Rule**: Preserve existing interfaces and avoid collateral changes.

## 4. Regression Verification

- **Agent**: Unit Test Engineer
- **Action**: Run the newly authored reproduction test alongside the full test suite (`pnpm test`).
- **Rule**: All tests must pass, confirming both fix efficacy and zero regression.

## 5. Review & Quality Gates

- **Agent**: Code Reviewer & DevOps Engineer
- **Action**: Verify type safety (`pnpm typecheck`), linting (`pnpm lint`), and production build (`pnpm build`).
- **Rule**: No fix is merged without green quality gates.
