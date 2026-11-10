# Role-Based Access Control (RBAC) & Rate Limiting

## 1. RBAC Architecture

The authorization framework lives in `src/lib/rbac/`:

### Permission Keys (`src/lib/rbac/permissions.ts`)

Permissions follow the `<domain>:<action>` convention and are defined as typed constants:

- User Domain: `users:read`, `users:write`, `users:delete`
- Role Domain: `roles:read`, `roles:write`
- Settings Domain: `settings:read`, `settings:write`
- Reports Domain: `reports:read`, `reports:export`
- Audit Domain: `audit:read`
- System-Wide Bypass: `admin:all`

### System Roles (`src/lib/rbac/roles.ts`)

Pre-configured roles map to canonical privilege sets:

- **`super_admin`**: Possesses all permissions including `admin:all`.
- **`admin`**: Administrative control over users, roles, settings, reports, and audit logs.
- **`manager`**: Management capability over users, reports, and settings viewing.
- **`viewer`**: Read-only access to users and reports.

### Authorization Utilities (`src/lib/rbac/authorize.ts`)

Protected with `server-only`:

- `hasPermission(userPermissions, requiredPermission)`: Checks if the target permission exists or if the user possesses `admin:all`.
- `hasAnyPermission(userPermissions, permissions)`: Returns true if at least one permission matches.
- `hasAllPermissions(userPermissions, permissions)`: Returns true if all permissions match.
- `requirePermission(ctx, requiredPermission)`: Enforces permission check or raises an `AuthorizationError`.
- `withAuthorization(getAuthContext, requiredPermission)`: Higher-order function wrapping Route Handlers to return `403 Forbidden` JSON responses on authorization failures.

## 2. Distributed Rate Limiting

The rate-limiting system is located in `src/lib/ratelimit/`:

### Storage Engine

- **Production**: Distributed Redis instance via `ioredis` (`REDIS_URL`).
- **Development**: Seamless no-op fallback when `REDIS_URL` is omitted, returning `allowed: true`.
- **Failure Mode in Production**: Server raises a startup configuration error if `REDIS_URL` is missing when `NODE_ENV === 'production'`.

### Sliding Window Algorithm (`src/lib/ratelimit/limiter.ts`)

Employs an atomic Redis Lua script combining:

1. `ZREMRANGEBYSCORE`: Evicts timestamp entries older than `now - windowMs`.
2. `ZCARD`: Evaluates request count in the current rolling window.
3. `ZADD`: Appends current timestamp when count is within the quota.
   This eliminates race conditions under high-concurrency requests across multiple Next.js instances.

### Route Handler Wrapper (`src/lib/ratelimit/with-rate-limit.ts`)

Extracts caller IP (`x-forwarded-for` or socket address), applies namespaced rate limit keys (`ratelimit:<prefix>:<ip>`), and returns `429 Too Many Requests` with a compliant `Retry-After` header when limits are exceeded.

## 3. Audit Logging (`src/lib/audit/log-event.ts`)

Provides structured event tracking for administrative actions:

- Records `actorUserId`, `action`, `targetType`, `targetPublicId`, `ipAddress`, and `metadata`.
- Strict zero-credential policy: Passwords, tokens, cookies, or secrets must never be passed to `logAuditEvent`.
