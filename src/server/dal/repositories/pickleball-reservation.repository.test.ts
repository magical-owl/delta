import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

import {
  createPickleballReservation,
  findPickleballReservationByReference,
  findPickleballReservationByPublicId,
  listPickleballReservations,
  cancelPickleballReservation,
  updatePickleballReservationPayment,
} from "./pickleball-reservation.repository";
import { db } from "../db";

describe("pickleball-reservation.repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a pickleball reservation and returns the record", async () => {
    const mockRecord = {
      id: BigInt(1),
      publicId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      bookingReference: "PB-20261114-1234",
      courtId: "court_1",
      courtName: "Court 1",
      date: "2026-11-14",
      timeSlot: "9:00am-10:00am",
      durationMinutes: 60,
      startIso: "2026-11-14T09:00:00+08:00",
      endIso: "2026-11-14T10:00:00+08:00",
      timeZone: "Asia/Manila",
      playerName: "Alex Rivera",
      playerEmail: "alex@delta.local",
      playerPhone: "+1 (555) 019-2834",
      matchType: "Doubles Match",
      rentals: ["Paddle Rental (2x)"],
      pinCode: "5544",
      totalAmount: 35,
      paymentStatus: "paid",
      paymentMethod: "Credit Card",
      status: "confirmed",
      googleCalendarEventId: "gcal_123",
      googleCalendarLink: "https://calendar.google.com/event/123",
      cancellationReason: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValueOnce({
        returning: vi.fn().mockResolvedValueOnce([mockRecord]),
      }),
    } as unknown as ReturnType<typeof db.insert>);

    const result = await createPickleballReservation({
      bookingReference: "PB-20261114-1234",
      courtId: "court_1",
      courtName: "Court 1",
      date: "2026-11-14",
      timeSlot: "9:00am-10:00am",
      durationMinutes: 60,
      startIso: "2026-11-14T09:00:00+08:00",
      endIso: "2026-11-14T10:00:00+08:00",
      timeZone: "Asia/Manila",
      playerName: "Alex Rivera",
      playerEmail: "alex@delta.local",
      playerPhone: "+1 (555) 019-2834",
      matchType: "Doubles Match",
      rentals: ["Paddle Rental (2x)"],
      pinCode: "5544",
      totalAmount: 35,
      paymentStatus: "paid",
      paymentMethod: "Credit Card",
      status: "confirmed",
    });

    expect(result.bookingReference).toBe("PB-20261114-1234");
    expect(result.pinCode).toBe("5544");
    expect(result.status).toBe("confirmed");
  });

  it("finds a reservation by booking reference or public ID", async () => {
    const mockRecord = {
      id: BigInt(2),
      publicId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      bookingReference: "PB-20261114-9999",
      courtId: "court_2",
      courtName: "Court 2",
      date: "2026-11-14",
      timeSlot: "10:00am-11:00am",
      durationMinutes: 60,
      startIso: "2026-11-14T10:00:00+08:00",
      endIso: "2026-11-14T11:00:00+08:00",
      timeZone: "Asia/Manila",
      playerName: "Sarah Chen",
      playerEmail: "sarah@delta.local",
      playerPhone: "+1 (555) 019-9999",
      matchType: "Singles Match",
      rentals: [],
      pinCode: "4321",
      totalAmount: 25,
      paymentStatus: "paid",
      paymentMethod: "Apple Pay",
      status: "confirmed",
      googleCalendarEventId: null,
      googleCalendarLink: null,
      cancellationReason: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // By reference
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([mockRecord]),
        }),
      }),
    } as unknown as ReturnType<typeof db.select>);

    const byRef = await findPickleballReservationByReference("PB-20261114-9999");
    expect(byRef?.playerName).toBe("Sarah Chen");

    // By public ID
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([mockRecord]),
        }),
      }),
    } as unknown as ReturnType<typeof db.select>);

    const byId = await findPickleballReservationByPublicId(
      "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
    );
    expect(byId?.bookingReference).toBe("PB-20261114-9999");
  });

  it("cancels a reservation and records refund status and reason", async () => {
    const cancelledRecord = {
      id: BigInt(3),
      publicId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      bookingReference: "PB-20261114-8888",
      courtId: "court_1",
      courtName: "Court 1",
      date: "2026-11-14",
      timeSlot: "2:00pm-3:00pm",
      durationMinutes: 60,
      startIso: "2026-11-14T14:00:00+08:00",
      endIso: "2026-11-14T15:00:00+08:00",
      timeZone: "Asia/Manila",
      playerName: "Marcus Vance",
      playerEmail: "marcus@delta.local",
      playerPhone: "+1 (555) 019-8888",
      matchType: "Doubles Match",
      rentals: [],
      pinCode: "8888",
      totalAmount: 25,
      paymentStatus: "refunded",
      paymentMethod: "Credit Card",
      status: "cancelled",
      googleCalendarEventId: "gcal_888",
      googleCalendarLink: null,
      cancellationReason: "Rain check / schedule conflict",
      cancelledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([cancelledRecord]),
        }),
      }),
    } as unknown as ReturnType<typeof db.update>);

    const result = await cancelPickleballReservation(
      "cccccccc-cccc-cccc-cccc-cccccccccccc",
      "Rain check / schedule conflict"
    );

    expect(result?.status).toBe("cancelled");
    expect(result?.paymentStatus).toBe("refunded");
    expect(result?.cancellationReason).toBe("Rain check / schedule conflict");
  });

  it("updates payment status and method for a reservation", async () => {
    const updatedRecord = {
      id: BigInt(4),
      publicId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      bookingReference: "PB-20261114-7777",
      courtId: "court_3",
      courtName: "Court 3",
      date: "2026-11-14",
      timeSlot: "5:00pm-6:00pm",
      durationMinutes: 60,
      startIso: "2026-11-14T17:00:00+08:00",
      endIso: "2026-11-14T18:00:00+08:00",
      timeZone: "Asia/Manila",
      playerName: "Elena Rostova",
      playerEmail: "elena@delta.local",
      playerPhone: "+1 (555) 019-7777",
      matchType: "Doubles Match",
      rentals: [],
      pinCode: "7777",
      totalAmount: 35,
      paymentStatus: "paid",
      paymentMethod: "Club Account",
      status: "confirmed",
      googleCalendarEventId: null,
      googleCalendarLink: null,
      cancellationReason: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([updatedRecord]),
        }),
      }),
    } as unknown as ReturnType<typeof db.update>);

    const result = await updatePickleballReservationPayment(
      "dddddddd-dddd-dddd-dddd-dddddddddddd",
      "paid",
      "Club Account"
    );

    expect(result?.paymentStatus).toBe("paid");
    expect(result?.paymentMethod).toBe("Club Account");
  });

  it("lists pickleball reservations", async () => {
    const records = [
      {
        id: BigInt(1),
        publicId: "11111111-1111-1111-1111-111111111111",
        bookingReference: "PB-20261114-1111",
        courtId: "court_1",
        courtName: "Court 1",
        date: "2026-11-14",
        timeSlot: "9:00am-10:00am",
        durationMinutes: 60,
        startIso: "2026-11-14T09:00:00+08:00",
        endIso: "2026-11-14T10:00:00+08:00",
        timeZone: "Asia/Manila",
        playerName: "Alex Rivera",
        playerEmail: "alex@delta.local",
        playerPhone: "+1 (555) 019-2834",
        matchType: "Doubles Match",
        rentals: [],
        pinCode: "1111",
        totalAmount: 25,
        paymentStatus: "paid",
        paymentMethod: "Credit Card",
        status: "confirmed",
        googleCalendarEventId: null,
        googleCalendarLink: null,
        cancellationReason: null,
        cancelledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        orderBy: vi.fn().mockResolvedValueOnce(records),
      }),
    } as unknown as ReturnType<typeof db.select>);

    const list = await listPickleballReservations();
    expect(list.length).toBe(1);
    expect(list[0].bookingReference).toBe("PB-20261114-1111");
  });
});
