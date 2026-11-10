import { describe, it, expect } from "vitest";
import { getSecurityHeaders } from "./headers";

describe("getSecurityHeaders", () => {
  it("includes essential OWASP security headers", () => {
    const headers = getSecurityHeaders();
    const headerMap = new Map(headers.map((h) => [h.key, h.value]));

    expect(headerMap.get("X-Frame-Options")).toBe("DENY");
    expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headerMap.get("Strict-Transport-Security")).toContain("max-age=63072000");
  });
});
