import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

describe("/api/inquiries Route Handler", () => {
  it("GET returns current inquiry summary", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.totalInquiries).toBeGreaterThanOrEqual(0);
  });

  it("POST returns 400 when body fails schema validation", async () => {
    const req = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      body: JSON.stringify({ email: "invalid", subject: "Hi" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(body.error.details).toBeDefined();
  });

  it("POST returns 201 when valid data is supplied", async () => {
    const req = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      body: JSON.stringify({
        email: "route-test@delta.local",
        category: "technical",
        subject: "Route Handler Validation",
        message: "Testing route handler end-to-end unit logic.",
        urgency: "low",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toMatch(/^inq_/);
  });
});
