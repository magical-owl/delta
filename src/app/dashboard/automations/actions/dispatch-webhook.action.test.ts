import { describe, it, expect, vi, beforeEach } from "vitest";
import { dispatchWebhookAction } from "./dispatch-webhook.action";

describe("dispatchWebhookAction Server Action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles successful 200 response from webhook endpoint", async () => {
    const mockJson = { success: true, message: "Acknowledged by n8n" };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockJson), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await dispatchWebhookAction(
      "https://ozephyrmor.app.n8n.cloud/webhook-test/delta-events",
      { event: "workspace.health_check" }
    );

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.responseBody).toEqual(mockJson);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("handles non-200 HTTP response appropriately", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Not Found", {
        status: 404,
        statusText: "Not Found",
        headers: { "Content-Type": "text/plain" },
      })
    );

    const result = await dispatchWebhookAction(
      "https://ozephyrmor.app.n8n.cloud/webhook-test/delta-events",
      { event: "workspace.health_check" }
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
    expect(result.error).toContain("404");
  });

  it("handles network failure or invalid URL gracefully", async () => {
    const result = await dispatchWebhookAction("invalid-url-shape", {
      event: "workspace.health_check",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
