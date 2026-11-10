# User Provisioning, Invitation Workflow & Emergency Recovery

## 1. Overview

Account creation in this application is strictly administrator-controlled. Public self-registration is disabled by default via `ENABLE_PUBLIC_REGISTRATION=false`.

## 2. Public Registration Policy

- The `/register` route presents an informational notice: **"Registration by Invitation Only"**.
- The server endpoint `POST /api/auth/register` independently validates `isPublicRegistrationEnabled()`. Missing, empty, or unrecognized values fail closed (`403 Forbidden`).
- Rate limiting protects `/api/auth/register` (5 attempts per 15 minutes per IP).

## 3. Administrator-Controlled User Provisioning

Authorized administrators possessing `users:create` or `admin:all` provision users via:

- UI: `/dashboard/users` (Provision User dialog)
- API: `POST /api/users` (Zod validated with `createUserSchema`, rate-limited to 20/15m)

### Safeguards Enforced:

1. **Server-Side Authorization**: Unauthenticated callers receive `401`; unauthorized callers receive `403`.
2. **Privilege Escalation Prevention**: Ordinary administrators cannot grant the `super_admin` role.
3. **Account Conflict Detection**: Duplicate email submissions are rejected.
4. **Data Isolation**: Responses return public UUIDs (`publicId`); internal `BIGINT` IDs are never leaked.
5. **Audit Logging**: Every creation records a structured audit event (`user.admin_provision`).

## 4. Invitation & Activation Workflow

1. When `sendInvitation=true`, a 256-bit cryptographically secure token is generated.
2. The SHA-256 digest (`tokenHash`) is persisted in `invitation_tokens` with an expiration timestamp (7 days) and single-use constraint.
3. Raw invitation tokens are never stored, logged, or returned in ordinary API responses.
4. If email delivery is unconfigured (`SMTP_HOST` or `RESEND_API_KEY` missing), the API flags `invitationStatus: "email_unconfigured"` rather than fabricating delivery.
5. Account status starts as `pending`. Pending accounts cannot authenticate to protected workspace resources.

## 5. Account Lifecycle & Last-Superadmin Protection

- Accounts may be toggled between `active` and `disabled` via `PATCH /api/users?publicId=<uuid>`.
- **Last-Superadmin Protection**: The service dynamically counts active Superadmins (`countActiveSuperadmins()`). Attempting to disable the last active Superadmin fails with an explicit rejection, preventing workspace lockout.

## 6. Initial Superadmin Bootstrap

Execution is strictly manual and deliberate:

```bash
pnpm auth:bootstrap-superadmin
# Or provide environment variables:
BOOTSTRAP_SUPERADMIN_EMAIL=admin@example.com \
BOOTSTRAP_SUPERADMIN_NAME="Primary Admin" \
BOOTSTRAP_SUPERADMIN_PASSWORD="SecurePassword123!" \
pnpm auth:bootstrap-superadmin
```

Safeguards:

- Never executes automatically during application startup.
- Refuses execution if an active Superadmin already exists.
- Hashes password using Argon2id.
- Assigns the `super_admin` role and records an audit event.

## 7. Emergency Recovery Procedure

If all administrative access is lost or compromised:

1. Access the production database container directly:
   ```bash
   docker exec -it delta_postgres psql -U delta -d delta
   ```
2. Inspect the current Superadmin status:
   ```sql
   SELECT u.id, u.public_id, u.email, u.status, u.is_active, r.name as role
   FROM users u
   JOIN user_roles ur ON ur.user_id = u.id
   JOIN roles r ON r.id = ur.role_id
   WHERE r.name = 'super_admin';
   ```
3. Re-enable an administratively disabled Superadmin account:
   ```sql
   UPDATE users
   SET status = 'active', is_active = true, updated_at = NOW()
   WHERE email = 'admin@example.com';
   ```
4. Record an out-of-band audit entry documenting the emergency manual intervention.
