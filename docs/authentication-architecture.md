# Authentication, Session Management & Password Security

## 1. Authentication Authority: Auth0

Authentication and identity verification are delegated exclusively to Auth0 via `@auth0/nextjs-auth0` (v4).

### Fundamental Password Security Principle

- **No Passwords Stored Or Processed**: The application does **NOT** store, hash, handle, accept, or process user passwords.
- **Zero Credential Custody**: Registration, password reset, credential validation, MFA, and brute-force defenses are handled entirely within Auth0's hardened, audited cloud infrastructure.
- In-app auth views (`/login`, `/register`, `/forgot-password`, `/unauthorized`) act solely as presentation and dispatch interfaces redirecting the user to Auth0 universal login endpoints.

## 2. Next.js 16 Edge Proxy & Protection

In accordance with Next.js 16 conventions, request routing and auth session hydration are managed via `src/proxy.ts` (the Next.js 16 successor to legacy `middleware.ts`):

- Handles automatic session checks and callback routes under `/auth/*`.
- Protects administrative paths (`/dashboard/*`).
- Public paths are whitelisted: `/`, `/login`, `/register`, `/forgot-password`, `/unauthorized`, `/auth/*`, `/api/health`.

## 3. Identity Provisioning Service

When an authenticated session enters the server context:

1. `src/lib/auth/session.ts` extracts the Auth0 JWT claims via `auth0.getSession()`.
2. `src/server/services/identity.service.ts` (`provisionUser`) idempotently resolves the internal account:
   - Queries `external_identities` joined to `users` using `providerSubject = claims.sub`.
   - If not found, provisions a new record in `users` with an auto-assigned internal `BIGINT` PK and public `UUID`, plus an `external_identities` entry (`provider = 'auth0'`).
   - If existing, returns the persisted internal user entity.
3. No credentials or secrets are ever requested or stored in the database.

## 4. Environment Variables Required

| Key                   | Description                                   | Example                 |
| --------------------- | --------------------------------------------- | ----------------------- |
| `AUTH0_SECRET`        | 32-byte secret for encrypting session cookies | `openssl rand -hex 32`  |
| `APP_BASE_URL`        | Base URL of the application                   | `http://localhost:3000` |
| `AUTH0_DOMAIN`        | Tenant domain (without protocol)              | `dev-xyz.us.auth0.com`  |
| `AUTH0_CLIENT_ID`     | Application Client ID from Auth0              | `yourClientId`          |
| `AUTH0_CLIENT_SECRET` | Application Client Secret from Auth0          | `yourClientSecret`      |
