import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRevokeLocalSession = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@/server/services/local-auth.service", () => ({
  revokeLocalSession: () => mockRevokeLocalSession(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT: ${url}`);
  },
}));

describe("logoutAction Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revokes local session and redirects to /login", async () => {
    const { logoutAction } = await import("./logout.action");

    await expect(logoutAction()).rejects.toThrow("NEXT_REDIRECT: /login");
    expect(mockRevokeLocalSession).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });
});
