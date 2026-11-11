"use server";

export interface DispatchWebhookResult {
  success: boolean;
  status?: number;
  statusText?: string;
  responseBody?: unknown;
  latencyMs: number;
  error?: string;
  dispatchedAt: string;
}

/**
 * Server action to dispatch a test webhook payload to n8n.
 * Executing on the server prevents browser CORS restrictions and
 * keeps any signed secret headers secure.
 */
export async function dispatchWebhookAction(
  targetUrl: string,
  payload: Record<string, unknown>
): Promise<DispatchWebhookResult> {
  const startTime = Date.now();
  const dispatchedAt = new Date().toISOString();

  try {
    const url = new URL(targetUrl.trim());

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Delta-Dashboard/1.0",
        "X-Delta-Event": String(payload.event || "workspace.health_check"),
        "X-Delta-Dispatched-At": dispatchedAt,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const latencyMs = Date.now() - startTime;
    let responseBody: unknown = null;

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }
    } else {
      responseBody = await response.text();
    }

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
        responseBody,
        latencyMs,
        error: `Webhook returned HTTP ${response.status} ${response.statusText}`,
        dispatchedAt,
      };
    }

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      responseBody,
      latencyMs,
      dispatchedAt,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const errorMessage =
      err instanceof Error ? err.message : "Failed to dispatch webhook";

    return {
      success: false,
      latencyMs,
      error: errorMessage,
      dispatchedAt,
    };
  }
}
