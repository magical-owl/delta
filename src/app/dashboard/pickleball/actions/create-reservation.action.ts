"use server";

import {
  createPickleballReservationSchema,
  formatZodError,
  type CreatePickleballReservationInput,
} from "@/lib/validation/pickleball-reservation.schema";
import {
  createPickleballReservation,
  type PickleballReservationRecord,
} from "@/server/dal/repositories/pickleball-reservation.repository";
import {
  dispatchWebhookAction,
  type DispatchWebhookResult,
} from "../../automations/actions/dispatch-webhook.action";

export interface PickleballBookingDTO {
  id: string;
  publicId?: string;
  bookingReference: string;
  courtId: string;
  courtName: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  startIso: string;
  endIso: string;
  timeZone: string;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  matchType: string;
  rentals: string[];
  pinCode: string;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod: string;
  status: "confirmed" | "cancelled";
  googleCalendarEventId: string | null;
  googleCalendarLink: string | null;
  bookedAt: string;
}

export type CreateReservationActionResult =
  | {
      success: true;
      data: {
        booking: PickleballBookingDTO;
        dispatchResult?: DispatchWebhookResult;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string>;
      };
    };

export async function createPickleballReservationAction(
  rawInput: CreatePickleballReservationInput
): Promise<CreateReservationActionResult> {
  const validation = createPickleballReservationSchema.safeParse(rawInput);

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted form errors.",
        fieldErrors: formatZodError(validation.error),
      },
    };
  }

  const input = validation.data;
  const pinCode = String(Math.floor(1000 + Math.random() * 9000));
  const bookingReference = `PB-${input.date.replace(/-/g, "")}-${pinCode}`;
  const nowIso = new Date().toISOString();

  let dbRecord: PickleballReservationRecord | null = null;

  // 1. Attempt PostgreSQL & Drizzle ORM persistence
  try {
    dbRecord = await createPickleballReservation({
      bookingReference,
      courtId: input.courtId,
      courtName: input.courtName,
      date: input.date,
      timeSlot: input.timeSlot,
      durationMinutes: input.durationMinutes,
      startIso: input.startIso,
      endIso: input.endIso,
      timeZone: input.timeZone,
      playerName: input.playerName,
      playerEmail: input.playerEmail,
      playerPhone: input.playerPhone,
      matchType: input.matchType,
      rentals: input.rentals,
      pinCode,
      totalAmount: input.totalAmount,
      paymentStatus: "paid",
      paymentMethod: input.paymentMethod,
      status: "confirmed",
    });
  } catch (dbErr) {
    // If DB is unavailable in local dev/demo without DATABASE_URL, continue with synthetic record
    console.warn("[PickleballReservation] DB persistence skipped or unavailable:", dbErr);
  }

  // 2. Dispatch to n8n Webhook for Google Calendar sync and physical facility notification (unless skipped to prevent duplicates)
  let dispatchResult: DispatchWebhookResult | undefined;
  let gcalEventId: string | null = input.googleCalendarEventId || null;
  let gcalLink: string | null = input.googleCalendarLink || null;

  if (!input.skipWebhook) {
    const targetWebhook =
      input.webhookUrl ||
      "https://ozephyrmor.app.n8n.cloud/webhook/delta-pickleball-reservation";

    try {
      const payload = {
        action: "book_court",
        courtId: input.courtId,
        courtName: input.courtName,
        date: input.date,
        timeSlot: input.timeSlot,
        durationMinutes: input.durationMinutes,
        startIso: input.startIso,
        endIso: input.endIso,
        timeZone: input.timeZone,
        playerName: input.playerName,
        playerEmail: input.playerEmail,
        playerPhone: input.playerPhone,
        matchType: input.matchType,
        rentals: input.rentals,
        totalAmount: input.totalAmount,
        paymentMethod: input.paymentMethod,
        bookingReference,
        pinCode,
      };

      dispatchResult = await dispatchWebhookAction(targetWebhook, payload);

      if (
        dispatchResult.success &&
        dispatchResult.responseBody &&
        typeof dispatchResult.responseBody === "object"
      ) {
        const resp = dispatchResult.responseBody as {
          googleCalendarEventId?: string;
          googleCalendarLink?: string;
          booking?: {
            googleCalendarEventId?: string;
            googleCalendarLink?: string;
          };
        };
        gcalEventId =
          resp.googleCalendarEventId || resp.booking?.googleCalendarEventId || null;
        gcalLink = resp.googleCalendarLink || resp.booking?.googleCalendarLink || null;
      }
    } catch (whErr) {
      console.error("[PickleballReservation] n8n Webhook dispatch error:", whErr);
    }
  }

  const bookingDto: PickleballBookingDTO = {
    id: dbRecord?.publicId || bookingReference,
    publicId: dbRecord?.publicId,
    bookingReference,
    courtId: input.courtId,
    courtName: input.courtName,
    date: input.date,
    timeSlot: input.timeSlot,
    durationMinutes: input.durationMinutes,
    startIso: input.startIso,
    endIso: input.endIso,
    timeZone: input.timeZone,
    playerName: input.playerName,
    playerEmail: input.playerEmail,
    playerPhone: input.playerPhone,
    matchType: input.matchType,
    rentals: input.rentals,
    pinCode,
    totalAmount: input.totalAmount,
    paymentStatus: "paid",
    paymentMethod: input.paymentMethod,
    status: "confirmed",
    googleCalendarEventId: gcalEventId,
    googleCalendarLink: gcalLink,
    bookedAt: nowIso,
  };

  return {
    success: true,
    data: {
      booking: bookingDto,
      dispatchResult,
    },
  };
}
