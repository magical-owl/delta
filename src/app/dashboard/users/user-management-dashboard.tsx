"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { AppAlert } from "@/components/ui/app-alert";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton } from "@/components/ui/app-button";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppFormField } from "@/components/ui/app-form-field";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { AppTable, type Column } from "@/components/ui/app-table";
import { ContentCard } from "@/components/shared/content-card";
import { PageHeading } from "@/components/shared/page-heading";

export interface UserItem extends Record<string, unknown> {
  publicId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  isActive: boolean;
  status: string;
  roles: string[];
  createdAt: string;
}

export function UserManagementDashboard() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Create User Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newRole, setNewRole] = useState("viewer");
  const [sendInvite, setSendInvite] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Status Action Dialog State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<"active" | "disabled">("disabled");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = search
        ? `/api/users?search=${encodeURIComponent(search)}`
        : "/api/users";
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load users");
      }
      setUsers(json.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/users");
        const json = await res.json();
        if (!ignore) {
          if (res.ok && json.success) {
            setUsers(json.data || []);
          } else {
            setError(json.error || "Failed to load users");
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load users");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: newEmail,
            displayName: newDisplayName,
            role: newRole,
            sendInvitation: sendInvite,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to provision user");
        }

        setFormSuccess(
          `User created successfully.${
            json.invitationStatus === "email_unconfigured"
              ? " (Email service not configured; invitation stored in pending status)."
              : " Invitation issued."
          }`
        );
        setNewEmail("");
        setNewDisplayName("");
        setNewRole("viewer");
        fetchUsers();
        setTimeout(() => {
          setCreateDialogOpen(false);
          setFormSuccess(null);
        }, 1500);
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : "Error creating user");
      }
    });
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/users?publicId=${selectedUser.publicId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: targetStatus }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to update user status");
        }
        setConfirmDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Status update failed");
        setConfirmDialogOpen(false);
      }
    });
  };

  const columns = useMemo<Column<UserItem>[]>(
    () => [
      {
        key: "user",
        header: "User",
        render: (user) => (
          <div className="flex flex-col">
            <span className="font-medium text-[var(--foreground)]">
              {user.displayName}
            </span>
            <span className="text-xs text-[var(--text-muted)]">{user.email}</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (user) => (
          <AppBadge
            variant={
              user.status === "active"
                ? "success"
                : user.status === "pending"
                  ? "warning"
                  : "error"
            }
          >
            {user.status}
          </AppBadge>
        ),
      },
      {
        key: "roles",
        header: "Roles",
        render: (user) => (
          <div className="flex flex-wrap gap-1">
            {user.roles.length > 0 ? (
              user.roles.map((r) => (
                <AppBadge key={r} variant="outline">
                  {r}
                </AppBadge>
              ))
            ) : (
              <span className="text-xs text-[var(--text-muted)]">None</span>
            )}
          </div>
        ),
      },
      {
        key: "publicId",
        header: "Public Identifier",
        render: (user) => (
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {user.publicId}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Created",
        render: (user) => (
          <span className="text-xs text-[var(--text-muted)]">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: "actions",
        header: <span className="text-right block">Actions</span>,
        className: "text-right",
        render: (user) =>
          user.status === "disabled" ? (
            <AppButton
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedUser(user);
                setTargetStatus("active");
                setConfirmDialogOpen(true);
              }}
            >
              Enable
            </AppButton>
          ) : (
            <AppButton
              size="sm"
              variant="outline"
              className="text-[var(--danger)] hover:bg-[var(--danger)]/10"
              onClick={() => {
                setSelectedUser(user);
                setTargetStatus("disabled");
                setConfirmDialogOpen(true);
              }}
            >
              Disable
            </AppButton>
          ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeading
          title="User Directory & Access"
          subtitle="Manage workspace users, administrative role assignments, and account lifecycles."
        />
        <AppButton
          variant="primary"
          leftIcon="plus"
          onClick={() => setCreateDialogOpen(true)}
        >
          Provision User
        </AppButton>
      </div>

      {error && (
        <AppAlert
          variant="error"
          title="Operation Error"
          dismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </AppAlert>
      )}

      {/* Search and Filter Bar */}
      <ContentCard>
        <form onSubmit={handleSearchSubmit} className="flex gap-3 items-center">
          <div className="flex-1">
            <AppInput
              placeholder="Search by name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon="magnifying-glass"
            />
          </div>
          <AppButton type="submit" variant="secondary">
            Filter
          </AppButton>
          {search && (
            <AppButton
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                setTimeout(fetchUsers, 0);
              }}
            >
              Clear
            </AppButton>
          )}
        </form>
      </ContentCard>

      {/* Users Table */}
      <ContentCard>
        <AppTable<UserItem>
          data={users}
          columns={columns}
          keyExtractor={(u) => u.publicId}
          isLoading={loading}
          emptyMessage="No users found matching your search."
        />
      </ContentCard>

      {/* Provision User Modal */}
      <AppDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        title="Provision New User"
        description="Create an account and assign workspace roles. Public self-registration is disabled."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {formError && (
            <AppAlert variant="error" title="Error">
              {formError}
            </AppAlert>
          )}
          {formSuccess && (
            <AppAlert variant="success" title="Success">
              {formSuccess}
            </AppAlert>
          )}

          <AppFormField label="Email Address" required>
            <AppInput
              type="email"
              required
              placeholder="colleague@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </AppFormField>

          <AppFormField label="Display Name" required>
            <AppInput
              type="text"
              required
              placeholder="Jane Doe"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
            />
          </AppFormField>

          <AppFormField label="Initial Role">
            <AppSelect
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              options={[
                { value: "viewer", label: "Viewer (Read Only)" },
                { value: "manager", label: "Manager" },
                { value: "admin", label: "Admin" },
              ]}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Superadmin privileges cannot be assigned via standard provisioning.
            </p>
          </AppFormField>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="sendInvite"
              checked={sendInvite}
              onChange={(e) => setSendInvite(e.target.checked)}
              className="rounded border-[var(--border)]"
            />
            <label htmlFor="sendInvite" className="text-sm text-[var(--foreground)]">
              Send activation invitation (account starts in pending state)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <AppButton
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </AppButton>
            <AppButton type="submit" variant="primary" disabled={isPending}>
              {isPending ? "Provisioning..." : "Provision User"}
            </AppButton>
          </div>
        </form>
      </AppDialog>

      {/* Confirmation Dialog */}
      <AppDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        title={`${targetStatus === "disabled" ? "Disable" : "Enable"} Account`}
        description={`Are you sure you want to ${targetStatus} account access for ${selectedUser?.displayName}?`}
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            {targetStatus === "disabled"
              ? "Disabled users are blocked from accessing protected workspace resources. Last active Superadmins cannot be disabled."
              : "Re-enabling this account will restore standard workspace access."}
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <AppButton variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </AppButton>
            <AppButton
              variant={targetStatus === "disabled" ? "destructive" : "primary"}
              onClick={handleToggleStatus}
              disabled={isPending}
            >
              Confirm
            </AppButton>
          </div>
        </div>
      </AppDialog>
    </div>
  );
}
