# Database Architecture & Identifier Strategy

## 1. Overview & Engine

- **Engine**: PostgreSQL 17
- **ORM**: Drizzle ORM
- **Migration Engine**: Drizzle Kit (`drizzle/migrations/`)
- **Connection Adapter**: `pg` (node-postgres `Pool`) with connection pooling and hot-reload safe singleton management.

## 2. Identifier Strategy & Rules

To reconcile high-performance relational joining, foreign-key indexing, and sequential storage locality with zero information leakage across public boundaries, the system strictly enforces a dual-identifier architecture:

| Domain                     | Identifier Type | Strategy                            | Exposed to Clients    | Notes                                                          |
| -------------------------- | --------------- | ----------------------------------- | --------------------- | -------------------------------------------------------------- |
| **Internal Primary Keys**  | `BIGINT`        | `generatedAlwaysAsIdentity()`       | **NO** (Never leaked) | Compact (8 bytes), sequential, optimal B-tree page utilization |
| **Internal Foreign Keys**  | `BIGINT`        | References internal PK (`onDelete`) | **NO**                | Fast index joins, avoids multi-table UUID overhead             |
| **Public-Facing Entities** | `UUID` (v4)     | `defaultRandom()`                   | **YES**               | Cryptographically unguessable, protects business enumeration   |

### Prohibitions

1. Never expose `id` (`BIGINT`) in client API payloads, URLs, or cookies.
2. Never join or establish relational foreign keys on `public_id` or external string identifiers; use internal `BIGINT` IDs for all relationships.
3. Every public-facing entity table must generate a `public_id` UUID column.

## 3. Schema Topology

The schema modules reside in `src/server/dal/schema/`:

- **`users`**: Core user accounts.
  - `id`: `bigint` (Identity PK)
  - `publicId`: `uuid` (Unique public handle)
  - `auth0Subject`: `varchar(255)` (Unique Auth0 subject)
  - `email`: `varchar(255)` (Unique)
  - `displayName`: `varchar(255)`
  - `avatarUrl`: `text` (Nullable)
  - `isActive`: `boolean` (Default `true`)
  - `createdAt` / `updatedAt`: `timestamp`
- **`roles`**: System role definitions (`id`, `name`, `description`, `createdAt`).
- **`permissions`**: Granular capability keys (`id`, `key`, `description`, `createdAt`).
- **`user_roles`**: Join table binding `users(id)` to `roles(id)` (`BIGINT` FKs, `onDelete: 'cascade'`).
- **`role_permissions`**: Join table binding `roles(id)` to `permissions(id)` (`BIGINT` FKs, `onDelete: 'cascade'`).
- **`external_identities`**: Multi-provider identity mapping (`id`, `userId`, `provider`, `providerSubject`).
- **`audit_events`**: Audit log trails (`id`, `actorUserId`, `action`, `targetType`, `targetPublicId`, `metadata`, `ipAddress`, `createdAt`).

## 4. Migration & Management Workflow

Drizzle Kit scripts are defined in `package.json`:

- `pnpm db:generate`: Generate SQL migration files in `drizzle/migrations/` from schema definitions.
- `pnpm db:migrate`: Apply pending migrations to the PostgreSQL database.
- `pnpm db:push`: Push schema changes directly to PostgreSQL (development only).
- `pnpm db:studio`: Launch Drizzle Studio browser explorer for inspecting local database records.
