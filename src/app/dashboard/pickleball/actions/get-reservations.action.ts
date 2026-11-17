"use server";

import { listPickleballReservations } from "@/server/dal/repositories/pickleball-reservation.repository";
import type { PickleballBookingDTO } from "./create-reservation.action";

export async function getPickleballReservationsAction(options?: {
  date?: string;
}): Promise<{
  success: boolean;
  data: PickleballBookingDTO[];
}> {
  try {
    const records = await listPickleballReservations({
      date: options?.date,
      status: "confirmed",
    });

    const dtos: PickleballBookingDTO[] = records.map((r) => ({
      id: r.publicId,
      publicId: r.publicId,
      bookingReference: r.bookingReference,
      courtId: r.courtId,
      courtName: r.courtName,
      date: r.date,
      timeSlot: r.timeSlot,
      durationMinutes: r.durationMinutes,
      startIso: r.startIso,
      endIso: r.endIso,
      timeZone: r.timeZone,
      playerName: r.playerName,
      playerEmail: r.playerEmail,
      playerPhone: r.playerPhone,
      matchType: r.matchType,
      rentals: r.rentals || [],
      pinCode: r.pinCode,
      totalAmount: r.totalAmount,
      paymentStatus: (r.paymentStatus as "pending" | "paid" | "refunded") || "paid",
      paymentMethod: r.paymentMethod || "Credit Card",
      status: (r.status as "confirmed" | "cancelled") || "confirmed",
      googleCalendarEventId: r.googleCalendarEventId,
      googleCalendarLink: r.googleCalendarLink,
      bookedAt: r.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: dtos,
    };
  } catch (err) {
    console.warn("[PickleballReservation] Could not list reservations from DB:", err);
    return {
      success: true,
      data: [],
    };
  }
}
