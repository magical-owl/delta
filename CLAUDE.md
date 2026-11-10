# Claude Code Guidelines

Refer to the primary orchestrator instructions in `AGENTS.md` and role definitions in `.agents/`.
All operations must strictly conform to:

1. Documentation-First Policy: consult installed Next.js docs in `node_modules/next/dist/docs/`.
2. Strict separation of `.agents/` and development documentation from runtime code.
3. Quality gates: `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`.
