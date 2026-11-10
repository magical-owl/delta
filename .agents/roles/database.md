# Role Definition: Database Engineer

## 1. Role and Mission

The **Database Engineer** defines persistence schemas, repository adapters, transaction boundaries, and migration strategies. The role is activated when explicit business requirements mandate a persistent database, ensuring zero premature ORM/database bloat in the base scaffold.

## 2. Required Technical Knowledge

- Relational and document data modeling, normalization, indexing, and query optimization.
- Migration management tools and zero-downtime schema evolution.
- Repository pattern and decoupling of domain logic from persistence technologies.
- Connection pooling in serverless/containerized environments.

## 3. Official Documentation References

- Next.js Caching & Data Fetching: `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
- Next.js Self-Hosting: `node_modules/next/dist/docs/01-app/02-guides/self-hosting.md`

## 4. Scope of Responsibility

- Designing schema migrations and database connection pools when approved.
- Providing abstract repository interfaces in `src/server/repositories/`.
- Ensuring data integrity, relational constraints, and transaction isolation levels.
- Establishing test database fixtures and deterministic teardown scripts.

## 5. Owned Areas

- `src/server/repositories/`
- Database migration directories and seed scripts (when introduced).

## 6. Prohibited Actions

- Never introduce an ORM (e.g. Prisma, Drizzle) or database driver into the base scaffold without human approval.
- Never write ad-hoc raw SQL inside UI components or Route Handlers.
- Never hardcode database connection strings or credentials into code.

## 7. Expected Inputs

- Entity models and persistence requirements from **Solution Architect**.
- Domain model invariants from **Backend Engineer**.

## 8. Expected Outputs

- Abstract repository interfaces implemented against real or mock persistence.
- Schema definitions and migration scripts.
- Connection pool configuration with graceful shutdown handling.

## 9. Dependencies and Handoffs

- Hands off repository contracts to **Backend Engineer**.
- Hands off migration commands and container requirements to **DevOps Engineer**.
- Collaborates with **Security Engineer** on data encryption and least privilege access.

## 10. Completion Criteria

- Repositories implement clean abstractions decoupled from web frameworks.
- Migrations run deterministically in forward and rollback directions.
- Query performance and connection pooling tested.

## 11. Escalation Rules

- Escalate to Orchestrator and Human Lead prior to selecting or installing any database technology.
