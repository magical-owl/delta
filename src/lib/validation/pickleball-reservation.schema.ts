import { z } from "zod";

export const MatchTypeEnum = z.enum([
  "Doubles Match",
  "Singles Match",
  "Open Play",
  "Private Coaching",
  "Tournament",
]);
export type MatchType = z.infer<typeof MatchTypeEnum>;

export const PaymentMethodEnum = z.enum([
  "Credit Card",
  "Apple Pay",
  "Google Pay",
  "Club Account",
]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const createPickleballReservationSchema = z.object({
  courtId: z.string().trim().min(1, { message: "Court ID is required" }),
  courtName: z.string().trim().min(1, { message: "Court Name is required" }),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be YYYY-MM-DD" }),
  timeSlot: z.string().trim().min(1, { message: "Time slot is required" }),
  durationMinutes: z.number().int().positive().default(60),
  startIso: z.string().trim().min(1, { message: "startIso timestamp is required" }),
  endIso: z.string().trim().min(1, { message: "endIso timestamp is required" }),
  timeZone: z.string().trim().default("UTC"),
  playerName: z
    .string()
    .trim()
    .min(2, { message: "Player name must be at least 2 characters" })
    .max(100, { message: "Player name cannot exceed 100 characters" }),
  playerEmail: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Please provide a valid email address" }),
  playerPhone: z.string().trim().min(7, { message: "Phone number is required" }).max(30),
  matchType: MatchTypeEnum.default("Doubles Match"),
  rentals: z.array(z.string()).default([]),
  totalAmount: z.number().min(0).default(25),
  paymentMethod: PaymentMethodEnum.default("Credit Card"),
  webhookUrl: z.string().url().optional(),
  skipWebhook: z.boolean().optional(),
  googleCalendarEventId: z.string().optional().nullable(),
  googleCalendarLink: z.string().optional().nullable(),
});

export type CreatePickleballReservationInput = z.infer<
  typeof createPickleballReservationSchema
>;

export const createPickleballCheckoutSessionSchema = z.object({
  courtId: z.string().trim().min(1, { message: "Court ID is required" }),
  courtName: z.string().trim().min(1, { message: "Court Name is required" }),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be YYYY-MM-DD" }),
  timeSlot: z.string().trim().min(1, { message: "Time slot is required" }),
  durationMinutes: z.number().int().positive().default(60),
  startIso: z.string().trim().min(1, { message: "startIso timestamp is required" }),
  endIso: z.string().trim().min(1, { message: "endIso timestamp is required" }),
  timeZone: z.string().trim().default("UTC"),
  playerName: z
    .string()
    .trim()
    .min(2, { message: "Player name must be at least 2 characters" })
    .max(100, { message: "Player name cannot exceed 100 characters" }),
  playerEmail: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Please provide a valid email address" }),
  playerPhone: z.string().trim().min(7, { message: "Phone number is required" }).max(30),
  matchType: MatchTypeEnum.default("Doubles Match"),
  rentals: z.array(z.string()).default([]),
  returnUrl: z.string().url().optional(),
});

export type CreatePickleballCheckoutSessionInput = z.infer<
  typeof createPickleballCheckoutSessionSchema
>;

export const cancelPickleballReservationSchema = z.object({
  bookingReference: z
    .string()
    .trim()
    .min(1, { message: "Booking Reference is required" }),
  publicId: z.string().uuid().optional(),
  reason: z.string().trim().max(500).optional(),
  date: z.string().optional(),
  courtId: z.string().optional(),
  timeSlot: z.string().optional(),
  googleCalendarEventId: z.string().optional().nullable(),
  webhookUrl: z.string().url().optional(),
});

export type CancelPickleballReservationInput = z.infer<
  typeof cancelPickleballReservationSchema
>;

/**
 * Standardized Zod error formatter
 */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path && !formatted[path]) {
      formatted[path] = issue.message;
    }
  }
  return formatted;
}
