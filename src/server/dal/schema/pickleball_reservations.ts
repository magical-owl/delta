import {
  bigint,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const pickleballReservationStatusEnum = ["confirmed", "cancelled"] as const;
export type PickleballReservationStatus =
  (typeof pickleballReservationStatusEnum)[number];

export const pickleballPaymentStatusEnum = ["pending", "paid", "refunded"] as const;
export type PickleballPaymentStatus = (typeof pickleballPaymentStatusEnum)[number];

export const pickleballReservations = pgTable("pickleball_reservations", {
  id: bigint("id", { mode: "bigint" }).generatedAlwaysAsIdentity().primaryKey(),
  publicId: uuid("public_id").notNull().defaultRandom().unique(),
  bookingReference: varchar("booking_reference", { length: 64 }).notNull().unique(),
  courtId: varchar("court_id", { length: 64 }).notNull(),
  courtName: varchar("court_name", { length: 128 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  timeSlot: varchar("time_slot", { length: 64 }).notNull(), // e.g. 9:00am-10:00am
  durationMinutes: integer("duration_minutes").notNull().default(60),
  startIso: text("start_iso").notNull(),
  endIso: text("end_iso").notNull(),
  timeZone: varchar("time_zone", { length: 64 }).notNull().default("UTC"),
  playerName: varchar("player_name", { length: 255 }).notNull(),
  playerEmail: varchar("player_email", { length: 255 }).notNull(),
  playerPhone: varchar("player_phone", { length: 64 }).notNull(),
  matchType: varchar("match_type", { length: 64 }).notNull().default("Doubles Match"),
  rentals: jsonb("rentals").$type<string[]>().default([]),
  pinCode: varchar("pin_code", { length: 16 }).notNull(),
  totalAmount: integer("total_amount").notNull().default(25),
  paymentStatus: varchar("payment_status", { length: 32 }).notNull().default("paid"),
  paymentMethod: varchar("payment_method", { length: 64 })
    .notNull()
    .default("Credit Card"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: varchar("status", { length: 32 }).notNull().default("confirmed"),
  googleCalendarEventId: text("google_calendar_event_id"),
  googleCalendarLink: text("google_calendar_link"),
  cancellationReason: text("cancellation_reason"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PickleballReservationRecord = typeof pickleballReservations.$inferSelect;
export type InsertPickleballReservation = typeof pickleballReservations.$inferInsert;
