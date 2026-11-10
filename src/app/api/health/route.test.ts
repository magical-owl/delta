import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

// Mock server-only so Vitest in jsdom environment does not throw
vi.mock("server-only", () => ({}));

describe("GET /api/health Route Handler", () => {
  it("returns status 200 with health data", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("healthy");
    expect(typeof body.data.uptimeSeconds).toBe("number");
    expect(body.data.nodeVersion).toBeDefined();
  });
});
