import "server-only";

import { desc, eq, and } from "drizzle-orm";
import { db } from "../db";
import {
  pickleballReservations,
  type InsertPickleballReservation,
  type PickleballReservationRecord,
  type PickleballReservationStatus,
  type PickleballPaymentStatus,
} from "../schema";

export type { PickleballReservationRecord, InsertPickleballReservation };

/**
 * Creates a new pickleball reservation in PostgreSQL.
 */
export async function createPickleballReservation(
  data: InsertPickleballReservation
): Promise<PickleballReservationRecord> {
  const result = await db.insert(pickleballReservations).values(data).returning();

  const record = result[0];
  if (!record) {
    throw new Error("Failed to insert pickleball reservation record.");
  }
  return record;
}

/**
 * Finds a pickleball reservation by its human-readable booking reference.
 */
export async function findPickleballReservationByReference(
  bookingReference: string
): Promise<PickleballReservationRecord | null> {
  const result = await db
    .select()
    .from(pickleballReservations)
    .where(eq(pickleballReservations.bookingReference, bookingReference))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Finds a pickleball reservation by its UUIDv4 public identifier.
 */
export async function findPickleballReservationByPublicId(
  publicId: string
): Promise<PickleballReservationRecord | null> {
  const result = await db
    .select()
    .from(pickleballReservations)
    .where(eq(pickleballReservations.publicId, publicId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Lists pickleball reservations, optionally filtered by date or status.
 */
export async function listPickleballReservations(options?: {
  date?: string;
  status?: PickleballReservationStatus;
}): Promise<PickleballReservationRecord[]> {
  const conditions = [];

  if (options?.date) {
    conditions.push(eq(pickleballReservations.date, options.date));
  }
  if (options?.status) {
    conditions.push(eq(pickleballReservations.status, options.status));
  }

  const query = db
    .select()
    .from(pickleballReservations)
    .orderBy(desc(pickleballReservations.createdAt));

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }

  return query;
}

/**
 * Cancels a reservation by its publicId, setting status to 'cancelled',
 * invalidating the gate PIN, and recording the cancellation timestamp and reason.
 */
export async function cancelPickleballReservation(
  publicId: string,
  reason?: string
): Promise<PickleballReservationRecord | null> {
  const result = await db
    .update(pickleballReservations)
    .set({
      status: "cancelled",
      paymentStatus: "refunded",
      cancellationReason: reason || "User cancelled court booking",
      cancelledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(pickleballReservations.publicId, publicId))
    .returning();

  return result[0] ?? null;
}

/**
 * Updates payment status and method for a reservation.
 */
export async function updatePickleballReservationPayment(
  publicId: string,
  paymentStatus: PickleballPaymentStatus,
  paymentMethod?: string
): Promise<PickleballReservationRecord | null> {
  const result = await db
    .update(pickleballReservations)
    .set({
      paymentStatus,
      paymentMethod: paymentMethod || "Credit Card",
      updatedAt: new Date(),
    })
    .where(eq(pickleballReservations.publicId, publicId))
    .returning();

  return result[0] ?? null;
}

/**
 * Finds a reservation by its associated Stripe Checkout Session ID.
 */
export async function findPickleballReservationByStripeSession(
  stripeSessionId: string
): Promise<PickleballReservationRecord | null> {
  const result = await db
    .select()
    .from(pickleballReservations)
    .where(eq(pickleballReservations.stripeSessionId, stripeSessionId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Marks a reservation as paid upon successful Stripe Checkout Session completion.
 */
export async function confirmPickleballReservationPayment(params: {
  bookingReference: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paymentMethod?: string;
  pinCode?: string;
}): Promise<PickleballReservationRecord | null> {
  const updateData: Partial<InsertPickleballReservation> = {
    paymentStatus: "paid",
    status: "confirmed",
    updatedAt: new Date(),
  };

  if (params.stripeSessionId) updateData.stripeSessionId = params.stripeSessionId;
  if (params.stripePaymentIntentId)
    updateData.stripePaymentIntentId = params.stripePaymentIntentId;
  if (params.paymentMethod) updateData.paymentMethod = params.paymentMethod;
  if (params.pinCode) updateData.pinCode = params.pinCode;

  const result = await db
    .update(pickleballReservations)
    .set(updateData)
    .where(eq(pickleballReservations.bookingReference, params.bookingReference))
    .returning();

  return result[0] ?? null;
}
