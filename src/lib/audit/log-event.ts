import "server-only";

/**
 * SECURITY NOTE: Never log passwords, tokens, API keys, session identifiers,
 * or any other secret/credential material in audit events.
 * Callers must sanitize `metadata` before passing it to this function.
 */

export interface AuditEventInput {
  /** The user who performed the action (optional for unauthenticated events) */
  actorUserId?: bigint;
  /** Machine-readable action name, e.g. "user.login", "role.update" */
  action: string;
  /** Resource type the action was performed on, e.g. "User", "Role" */
  targetType?: string;
  /** Public identifier (never internal DB primary key) of the target resource */
  targetPublicId?: string;
  /**
   * Arbitrary structured metadata about the event.
   * MUST NOT contain passwords, tokens, secrets, or sensitive PII.
   */
  metadata?: Record<string, unknown>;
  /** IP address of the client that triggered the event */
  ipAddress?: string;
}

/**
 * Logs a structured audit event.
 *
 * Current implementation: writes to console in development; acts as a no-op
 * stub in production until a persistent store (e.g. database table) is wired
 * in by replacing the body below.
 *
 * To add DB persistence: import the data-access layer here and insert a row.
 */
export async function logAuditEvent(input: AuditEventInput): Promise<void> {
  const event = {
    timestamp: new Date().toISOString(),
    actorUserId: input.actorUserId?.toString() ?? null,
    action: input.action,
    targetType: input.targetType ?? null,
    targetPublicId: input.targetPublicId ?? null,
    // Spread metadata last so callers can see the shape; never log raw request bodies
    metadata: input.metadata ?? {},
    ipAddress: input.ipAddress ?? null,
  };

  if (process.env.NODE_ENV !== "production") {
    console.log("[audit]", JSON.stringify(event));
  }

  // TODO: Replace with DB insert once persistence layer is available, e.g.:
  // await db.insert(auditLogs).values(event);
}
