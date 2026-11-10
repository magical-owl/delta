"use server";

import {
  inquirySchema,
  formatZodError,
  InquiryRecord,
} from "@/lib/validation/inquiry.schema";
import { inquiryService } from "@/server/services/inquiry.service";

export type SubmitInquiryResult =
  | { success: true; data: InquiryRecord }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string>;
      };
    };

/**
 * Server Action for handling inquiry form submission.
 * Enforces Zod validation, invokes domain service, and returns structured result.
 */
export async function submitInquiryAction(
  formData: FormData
): Promise<SubmitInquiryResult> {
  const rawInput = {
    email: formData.get("email"),
    category: formData.get("category"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    urgency: formData.get("urgency"),
  };

  const validation = inquirySchema.safeParse(rawInput);

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

  try {
    const record = await inquiryService.createInquiry(validation.data);
    return {
      success: true,
      data: record,
    };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "SERVER_MUTATION_FAILED",
        message: err instanceof Error ? err.message : "Failed to record inquiry",
      },
    };
  }
}
