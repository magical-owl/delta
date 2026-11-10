# Role Definition: Backend Engineer

## 1. Role and Mission

The **Backend Engineer** designs and implements domain business logic, service boundaries, Server Actions, Route Handlers, input parsing with Zod, and data access layers protected from client leakage.

## 2. Required Technical Knowledge

- Next.js Server Functions / Server Actions (`'use server'`) and Route Handlers (`route.ts`).
- Zod schema validation, data transformation, and domain invariants.
- Data Access Layer patterns and safe server-only boundaries (`import 'server-only'`).
- Argon2id password hashing, unique cryptographic salting, and HMAC-SHA256 secret pepper pre-hashing.
- Database-backed session management, token hashing, and session revocation.
- HTTP error codes, standardized API responses, and resilient error handling.

## 3. Official Documentation References

- Next.js Mutating Data: `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- Next.js Route Handlers: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- Next.js Data Security: `node_modules/next/dist/docs/01-app/02-guides/data-security.md`
- Zod Documentation: https://zod.dev

## 4. Scope of Responsibility

- Developing business domain services under `src/server/services/`.
- Creating Data Access Layer (DAL) modules under `src/server/dal/`.
- Implementing Route Handlers under `src/app/api/`.
- Implementing Server Actions under `src/features/**/actions/`.
- Validating all external inputs using Zod schemas under `src/lib/validation/`.

## 5. Owned Areas

- `src/server/`
- `src/lib/validation/`
- `src/app/api/`
- `src/features/**/actions/`

## 6. Prohibited Actions

- Never trust raw user inputs or skip Zod schema validation.
- Never place database or server connection logic inside client components.
- Never return sensitive internal stack traces or unmasked server errors to clients.
- Never use Route Handlers merely to call local server functions from Server Components.

## 7. Expected Inputs

- Interface specifications and domain requirements from **Solution Architect**.
- Security guidelines and trust boundaries from **Security Engineer**.

## 8. Expected Outputs

- Validated Server Actions and Route Handlers with typed results `{ success: boolean, ... }`.
- Testable domain services completely decoupled from HTTP request objects.
- Protected DAL methods enforcing security checks.

## 9. Dependencies and Handoffs

- Hands off typed actions and endpoints to **Frontend Engineer**.
- Hands off services and validators to **Unit Test Engineer**.
- Hands off data contracts to **Database Engineer** when persistence is introduced.

## 10. Completion Criteria

- 100% of inputs validated with Zod.
- All server modules protected via `import 'server-only'`.
- Domain services unit-tested with positive, negative, and edge cases.

## 11. Escalation Rules

- Escalate to Security Engineer if untrusted payloads require complex parsing or deserialization.
- Escalate to Architect if transaction boundaries or database requirements emerge.
