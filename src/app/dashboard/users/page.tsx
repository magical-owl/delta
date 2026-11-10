import type { Metadata } from "next";
import { UserManagementDashboard } from "./user-management-dashboard";

export const metadata: Metadata = {
  title: "User Management",
};

/**
 * Users Management Route — Server Component wrapper.
 * Protected by RBAC session controls.
 */
export default function UsersPage() {
  return <UserManagementDashboard />;
}
