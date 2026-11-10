import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { InquiryForm } from "./inquiry-form";
import * as actions from "../actions/submit-inquiry.action";

describe("InquiryForm Client Component", () => {
  it("renders all form fields with semantic labels and controls", () => {
    render(<InquiryForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/urgency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit domain inquiry/i })
    ).toBeInTheDocument();
  });

  it("displays server validation errors when action rejects input", async () => {
    vi.spyOn(actions, "submitInquiryAction").mockResolvedValue({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted form errors.",
        fieldErrors: {
          email: "Please provide a valid email address",
        },
      },
    });

    render(<InquiryForm />);

    const submitBtn = screen.getByRole("button", {
      name: /submit domain inquiry/i,
    });
    await userEvent.click(submitBtn);

    expect(
      await screen.findByText(/please provide a valid email address/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/please correct the highlighted form errors/i)
    ).toBeInTheDocument();
  });

  it("displays success message and resets on valid submission", async () => {
    vi.spyOn(actions, "submitInquiryAction").mockResolvedValue({
      success: true,
      data: {
        id: "inq_test_12345",
        email: "test@domain.com",
        category: "architecture",
        subject: "Valid Architecture Plan",
        message: "This is a detailed message testing UI success flow.",
        urgency: "medium",
        createdAt: "2026-11-10T00:00:00Z",
        status: "received",
      },
    });

    render(<InquiryForm />);

    const submitBtn = screen.getByRole("button", {
      name: /submit domain inquiry/i,
    });
    await userEvent.click(submitBtn);

    expect(
      await screen.findByText(/inquiry submitted successfully/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/inq_test_12345/i)).toBeInTheDocument();
  });
});
