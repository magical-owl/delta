import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

import {
  findValidInvitationToken,
  markInvitationTokenUsed,
  createInvitationTokenRecord,
} from "./invitation.repository";
import { hashToken } from "@/lib/auth/invitation-tokens";
import { db } from "../db";

describe("invitation.repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies single-use and expiration semantics for invitation tokens", async () => {
    const rawToken = "sample-secure-token-12345678901234567890";
    const tokenHash = hashToken(rawToken);

    // Mock expired token
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([]), // Expired returns empty query
        }),
      }),
    } as unknown as ReturnType<typeof db.select>);

    const expiredResult = await findValidInvitationToken(tokenHash);
    expect(expiredResult).toBe(null);

    // Mock already used token
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([
            {
              id: BigInt(10),
              userId: BigInt(2),
              tokenHash,
              expiresAt: new Date(Date.now() + 100000),
              usedAt: new Date(), // Already used!
              createdAt: new Date(),
            },
          ]),
        }),
      }),
    } as unknown as ReturnType<typeof db.select>);

    const usedResult = await findValidInvitationToken(tokenHash);
    expect(usedResult).toBe(null);

    // Mock valid unused token
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([
            {
              id: BigInt(11),
              userId: BigInt(3),
              tokenHash,
              expiresAt: new Date(Date.now() + 100000),
              usedAt: null,
              createdAt: new Date(),
            },
          ]),
        }),
      }),
    } as unknown as ReturnType<typeof db.select>);

    const validResult = await findValidInvitationToken(tokenHash);
    expect(validResult).not.toBe(null);
    expect(validResult?.id).toBe(BigInt(11));
  });

  it("creates invitation token record and marks token used", async () => {
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValueOnce({
        returning: vi.fn().mockResolvedValueOnce([{ id: BigInt(100) }]),
      }),
    } as unknown as ReturnType<typeof db.insert>);

    const rec = await createInvitationTokenRecord({
      userId: BigInt(5),
      tokenHash: "abc",
      expiresAt: new Date(),
    });
    expect(rec?.id).toBe(BigInt(100));

    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockResolvedValueOnce([]),
      }),
    } as unknown as ReturnType<typeof db.update>);

    await markInvitationTokenUsed(BigInt(100));
    expect(db.update).toHaveBeenCalled();
  });
});
