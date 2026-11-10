import { describe, it, expect } from "vitest";
import { submitInquiryAction } from "./submit-inquiry.action";

describe("submitInquiryAction Server Action", () => {
  it("rejects invalid form data and returns formatted field errors", async () => {
    const formData = new FormData();
    formData.append("email", "bad-email");
    formData.append("subject", "Short");

    const result = await submitInquiryAction(formData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(result.error.fieldErrors?.email).toBeDefined();
    }
  });

  it("successfully processes valid form submission", async () => {
    const formData = new FormData();
    formData.append("email", "action-test@delta.local");
    formData.append("category", "architecture");
    formData.append("subject", "Valid Action Subject");
    formData.append(
      "message",
      "This is a detailed message for testing the Server Action."
    );
    formData.append("urgency", "high");

    const result = await submitInquiryAction(formData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toMatch(/^inq_/);
      expect(result.data.email).toBe("action-test@delta.local");
    }
  });
});
