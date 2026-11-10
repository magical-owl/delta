import { z } from "zod";

export const InquiryCategoryEnum = z.enum([
  "general",
  "technical",
  "security",
  "architecture",
]);
export type InquiryCategory = z.infer<typeof InquiryCategoryEnum>;

export const InquiryUrgencyEnum = z.enum(["low", "medium", "high"]);
export type InquiryUrgency = z.infer<typeof InquiryUrgencyEnum>;

export const inquirySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email address is required" })
    .email({ message: "Please provide a valid email address" }),
  category: InquiryCategoryEnum.default("technical"),
  subject: z
    .string()
    .trim()
    .min(5, { message: "Subject must be at least 5 characters" })
    .max(100, { message: "Subject cannot exceed 100 characters" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(1000, { message: "Message cannot exceed 1000 characters" }),
  urgency: InquiryUrgencyEnum.default("medium"),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export interface InquiryRecord extends InquiryInput {
  id: string;
  createdAt: string;
  status: "received" | "triaged" | "resolved";
}

/**
 * Standardized validation error formatter
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
