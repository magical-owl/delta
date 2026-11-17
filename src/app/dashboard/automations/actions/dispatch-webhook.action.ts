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

    // Read response body as text once to avoid "body is unusable. body already been read" error
    const rawText = await response.text();
    if (rawText.trim().length > 0) {
      try {
        responseBody = JSON.parse(rawText);
      } catch {
        responseBody = rawText;
      }
    }

    if (!response.ok) {
      let detailedError = `Webhook returned HTTP ${response.status} ${response.statusText}`;
      if (
        responseBody &&
        typeof responseBody === "object" &&
        "message" in responseBody &&
        typeof (responseBody as { message: unknown }).message === "string"
      ) {
        detailedError += `: ${(responseBody as { message: string }).message}`;
      } else if (typeof responseBody === "string" && responseBody.trim()) {
        detailedError += `: ${responseBody.slice(0, 200)}`;
      }

      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
        responseBody,
        latencyMs,
        error: detailedError,
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
