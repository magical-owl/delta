# Workflow: Release & Production Verification

This workflow guides the preparation and verification of a production-ready release.

## 1. Scope & Dependency Audit

- Check `pnpm audit` for known dependency vulnerabilities.
- Confirm that no unapproved runtime dependencies have been introduced.
- Confirm frozen lockfile matches (`pnpm install --frozen-lockfile`).

## 2. Full Quality Gate Execution

Execute all verification commands in sequence:

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test:coverage
pnpm build
```

## 3. Standalone Artifact Verification

Inspect `.next/standalone`:

- Verify `server.js` exists and is functional.
- Verify `public/` and `.next/static/` are populated appropriately.
- Verify no development-only files or agent definitions exist inside `.next/standalone`.

## 4. Docker Container Verification

- Build image: `docker build -t nextjs-scaffold:latest .`
- Inspect contents: Ensure `.agents/`, `AGENTS.md`, and `src/test/` are completely absent.
- Check runtime user: Verify image runs as unprivileged user `nextjs` (UID 1001).
- Healthcheck: Verify `curl -f http://localhost:3000/api/health` succeeds.

## 5. Release Documentation & Handoff

- Update `CHANGELOG.md` or release notes.
- Record validation commands and actual results in the delivery report.
- Request final human sign-off prior to tag deployment.
