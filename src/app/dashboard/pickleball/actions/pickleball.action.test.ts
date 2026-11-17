import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the repository and dispatchWebhookAction
vi.mock("@/server/dal/repositories/pickleball-reservation.repository", () => ({
  createPickleballReservation: vi.fn().mockImplementation((data) =>
    Promise.resolve({
      ...data,
      id: BigInt(1),
      publicId: "123e4567-e89b-12d3-a456-426614174000",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  ),
  cancelPickleballReservation: vi.fn().mockImplementation((publicId, reason) =>
    Promise.resolve({
      id: BigInt(1),
      publicId,
      status: "cancelled",
      paymentStatus: "refunded",
      cancellationReason: reason,
      updatedAt: new Date(),
    })
  ),
  findPickleballReservationByPublicId: vi.fn().mockImplementation((publicId) =>
    Promise.resolve({
      id: BigInt(1),
      publicId,
      bookingReference: "PB-20261114-1234",
      stripePaymentIntentId: null,
      paymentStatus: "paid",
    })
  ),
  findPickleballReservationByReference: vi.fn().mockImplementation((bookingReference) =>
    Promise.resolve({
      id: BigInt(1),
      publicId: "123e4567-e89b-12d3-a456-426614174000",
      bookingReference,
      stripePaymentIntentId: null,
      paymentStatus: "paid",
    })
  ),
  listPickleballReservations: vi.fn().mockResolvedValue([
    {
      id: BigInt(1),
      publicId: "123e4567-e89b-12d3-a456-426614174000",
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
      rentals: [],
      pinCode: "1234",
      totalAmount: 25,
      paymentStatus: "paid",
      paymentMethod: "Credit Card",
      status: "confirmed",
      googleCalendarEventId: "gcal_1",
      googleCalendarLink: null,
      createdAt: new Date(),
    },
  ]),
}));

vi.mock("../../automations/actions/dispatch-webhook.action", () => ({
  dispatchWebhookAction: vi.fn().mockResolvedValue({
    success: true,
    status: 200,
    latencyMs: 30,
    responseBody: {
      action: "book_court",
      googleCalendarEventId: "gcal_event_mock_99",
      googleCalendarLink: "https://calendar.google.com/event/99",
    },
  }),
}));

import { createPickleballReservationAction } from "./create-reservation.action";
import { cancelPickleballReservationAction } from "./cancel-reservation.action";
import { getPickleballReservationsAction } from "./get-reservations.action";

describe("Pickleball Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully creates a reservation with valid input and records payment", async () => {
    const result = await createPickleballReservationAction({
      courtId: "court_2",
      courtName: "Court 2",
      date: "2026-11-14",
      timeSlot: "9:00am-10:00am",
      durationMinutes: 60,
      startIso: "2026-11-14T09:00:00+08:00",
      endIso: "2026-11-14T10:00:00+08:00",
      timeZone: "Asia/Manila",
      playerName: "Carlos Alcaraz",
      playerEmail: "carlos@delta.local",
      playerPhone: "+1 (555) 019-2834",
      matchType: "Doubles Match",
      rentals: ["Paddle Rental (2x)"],
      totalAmount: 35,
      paymentMethod: "Credit Card",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.booking.playerName).toBe("Carlos Alcaraz");
      expect(result.data.booking.timeSlot).toBe("9:00am-10:00am");
      expect(result.data.booking.totalAmount).toBe(35);
      expect(result.data.booking.paymentStatus).toBe("paid");
      expect(result.data.booking.googleCalendarEventId).toBe("gcal_event_mock_99");
      expect(result.data.booking.pinCode).toHaveLength(4);
    }
  });

  it("returns validation error when required fields are missing", async () => {
    const result = await createPickleballReservationAction({
      courtId: "",
      courtName: "",
      date: "not-a-date",
      timeSlot: "",
      durationMinutes: 60,
      startIso: "",
      endIso: "",
      timeZone: "UTC",
      playerName: "A",
      playerEmail: "invalid-email",
      playerPhone: "123",
      matchType: "Doubles Match",
      rentals: [],
      totalAmount: 25,
      paymentMethod: "Credit Card",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(result.error.fieldErrors).toBeDefined();
    }
  });

  it("cancels a reservation and returns refund confirmation", async () => {
    const result = await cancelPickleballReservationAction({
      bookingReference: "PB-20261114-1234",
      publicId: "123e4567-e89b-12d3-a456-426614174000",
      reason: "Scheduling conflict",
      date: "2026-11-14",
      courtId: "court_1",
      timeSlot: "9:00am-10:00am",
      googleCalendarEventId: "gcal_1",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bookingReference).toBe("PB-20261114-1234");
      expect(result.data.refunded).toBe(true);
    }
  });

  it("retrieves reservations list", async () => {
    const result = await getPickleballReservationsAction({ date: "2026-11-14" });
    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].playerName).toBe("Alex Rivera");
  });
});
