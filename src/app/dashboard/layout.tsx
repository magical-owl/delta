import { AdminLayoutClient } from "@/components/admin/admin-layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
