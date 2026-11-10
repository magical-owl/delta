import { Permission, type PermissionKey } from "./permissions";

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: PermissionKey[];
}

export const SystemRole = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  VIEWER: "viewer",
} as const;

export type SystemRoleName = (typeof SystemRole)[keyof typeof SystemRole];

export const ROLE_DEFINITIONS: Record<SystemRoleName, RoleDefinition> = {
  super_admin: {
    name: "Super Admin",
    description: "Full system access",
    permissions: Object.values(Permission) as PermissionKey[],
  },
  admin: {
    name: "Admin",
    description: "Administrative access excluding super-admin operations",
    permissions: [
      Permission.USERS_READ,
      Permission.USERS_WRITE,
      Permission.USERS_CREATE,
      Permission.ROLES_READ,
      Permission.SETTINGS_READ,
      Permission.SETTINGS_WRITE,
      Permission.REPORTS_READ,
      Permission.REPORTS_EXPORT,
      Permission.AUDIT_READ,
    ],
  },
  manager: {
    name: "Manager",
    description: "Team management access",
    permissions: [
      Permission.USERS_READ,
      Permission.REPORTS_READ,
      Permission.SETTINGS_READ,
    ],
  },
  viewer: {
    name: "Viewer",
    description: "Read-only access",
    permissions: [Permission.USERS_READ, Permission.REPORTS_READ],
  },
};
