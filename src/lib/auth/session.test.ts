import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Module mocks — must be declared before any imports that resolve the module.
// ---------------------------------------------------------------------------

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/auth0-client", () => ({
  auth0: {
    getSession: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    // Simulate redirect by throwing so callers can detect it.
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/server/dal/repositories/user.repository", () => ({
  findUserByAuth0Subject: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports — after mocks are declared.
// ---------------------------------------------------------------------------

import { auth0 } from "@/lib/auth/auth0-client";
import { findUserByAuth0Subject } from "@/server/dal/repositories/user.repository";
import {
  getCurrentSession,
  requireSession,
  getSessionUser,
  requireActiveSession,
} from "./session";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockGetSession = vi.mocked(auth0.getSession);
const mockFindUserByAuth0Subject = vi.mocked(findUserByAuth0Subject);

function makeSession(user: Record<string, unknown> = {}) {
  return { user: { sub: "auth0|123", ...user }, tokenSet: {} } as never;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getCurrentSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no session exists", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await getCurrentSession();
    expect(result).toBeNull();
  });

  it("returns session when one exists", async () => {
    const session = makeSession({ email: "test@example.com" });
    mockGetSession.mockResolvedValue(session);
    const result = await getCurrentSession();
    expect(result).toEqual(session);
  });

  it("never throws — returns null on SDK error", async () => {
    mockGetSession.mockRejectedValue(new Error("Auth0 network failure"));
    const result = await getCurrentSession();
    expect(result).toBeNull();
  });
});

describe("requireSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /login when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(requireSession()).rejects.toThrow("REDIRECT:/login");
  });

  it("returns session when authenticated", async () => {
    const session = makeSession({ email: "test@example.com" });
    mockGetSession.mockResolvedValue(session);
    const result = await requireSession();
    expect(result).toEqual(session);
  });
});

describe("requireActiveSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /login if no session exists", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(requireActiveSession()).rejects.toThrow("REDIRECT:/login");
  });

  it("redirects to /unauthorized if internal account is disabled", async () => {
    const session = makeSession({ email: "disabled@example.com" });
    mockGetSession.mockResolvedValue(session);
    mockFindUserByAuth0Subject.mockResolvedValueOnce({
      id: BigInt(10),
      publicId: "uuid-1",
      email: "disabled@example.com",
      displayName: "Disabled User",
      auth0Subject: "auth0|123",
      avatarUrl: null,
      isActive: false,
      status: "disabled",
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(requireActiveSession()).rejects.toThrow(
      "REDIRECT:/unauthorized?reason=account_not_active"
    );
  });

  it("redirects to /unauthorized if internal account is pending", async () => {
    const session = makeSession({ email: "pending@example.com" });
    mockGetSession.mockResolvedValue(session);
    mockFindUserByAuth0Subject.mockResolvedValueOnce({
      id: BigInt(11),
      publicId: "uuid-2",
      email: "pending@example.com",
      displayName: "Pending User",
      auth0Subject: "auth0|123",
      avatarUrl: null,
      isActive: true,
      status: "pending",
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(requireActiveSession()).rejects.toThrow(
      "REDIRECT:/unauthorized?reason=account_not_active"
    );
  });

  it("succeeds for active accounts", async () => {
    const session = makeSession({ email: "active@example.com" });
    mockGetSession.mockResolvedValue(session);
    mockFindUserByAuth0Subject.mockResolvedValueOnce({
      id: BigInt(12),
      publicId: "uuid-3",
      email: "active@example.com",
      displayName: "Active User",
      auth0Subject: "auth0|123",
      avatarUrl: null,
      isActive: true,
      status: "active",
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const ctx = await requireActiveSession();
    expect(ctx.sessionUser.sub).toBe("auth0|123");
    expect(ctx.internalUser?.status).toBe("active");
  });
});

describe("getSessionUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no session exists", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await getSessionUser();
    expect(result).toBeNull();
  });

  it("returns null when session has no user", async () => {
    // @ts-expect-error — deliberately malformed session for test
    mockGetSession.mockResolvedValue({ user: null });
    const result = await getSessionUser();
    expect(result).toBeNull();
  });

  it("returns typed user object from session", async () => {
    const session = makeSession({
      name: "Alice Smith",
      email: "alice@example.com",
      picture: "https://example.com/avatar.png",
      email_verified: true,
    });
    mockGetSession.mockResolvedValue(session);

    const user = await getSessionUser();
    expect(user).not.toBeNull();
    expect(user?.sub).toBe("auth0|123");
    expect(user?.name).toBe("Alice Smith");
    expect(user?.email).toBe("alice@example.com");
    expect(user?.email_verified).toBe(true);
  });

  it("coerces sub to string", async () => {
    const session = makeSession({ sub: 42 });
    mockGetSession.mockResolvedValue(session);
    const user = await getSessionUser();
    expect(typeof user?.sub).toBe("string");
    expect(user?.sub).toBe("42");
  });
});
