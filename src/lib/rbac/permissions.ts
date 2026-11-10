// No server-only needed here — permission keys are safe to share
export const Permission = {
  // User management
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  USERS_CREATE: "users:create",
  USERS_DELETE: "users:delete",
  // Role management
  ROLES_READ: "roles:read",
  ROLES_WRITE: "roles:write",
  // Settings
  SETTINGS_READ: "settings:read",
  SETTINGS_WRITE: "settings:write",
  // Reports
  REPORTS_READ: "reports:read",
  REPORTS_EXPORT: "reports:export",
  // Audit
  AUDIT_READ: "audit:read",
  // Admin
  ADMIN_ALL: "admin:all",
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];
