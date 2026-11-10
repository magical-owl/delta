import { describe, it, expect } from "vitest";
import { logAuditEvent } from "./log-event";

describe("logAuditEvent", () => {
  it("resolves without error given minimal input", async () => {
    await expect(logAuditEvent({ action: "user.login" })).resolves.toBeUndefined();
  });

  it("resolves without error given full input", async () => {
    await expect(
      logAuditEvent({
        actorUserId: BigInt(1),
        action: "role.update",
        targetType: "Role",
        targetPublicId: "role_abc123",
        metadata: { previousName: "Viewer", newName: "Manager" },
        ipAddress: "192.168.1.100",
      })
    ).resolves.toBeUndefined();
  });

  it("does not throw when actorUserId is omitted", async () => {
    await expect(
      logAuditEvent({
        action: "user.logout",
        ipAddress: "10.0.0.1",
      })
    ).resolves.toBeUndefined();
  });

  it("does not throw when metadata is an empty object", async () => {
    await expect(
      logAuditEvent({
        actorUserId: BigInt(99),
        action: "settings.read",
        metadata: {},
      })
    ).resolves.toBeUndefined();
  });
});
