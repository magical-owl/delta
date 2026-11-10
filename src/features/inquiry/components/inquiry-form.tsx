"use client";

import * as React from "react";
import {
  submitInquiryAction,
  SubmitInquiryResult,
} from "../actions/submit-inquiry.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function InquiryForm() {
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<SubmitInquiryResult | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await submitInquiryAction(formData);
      setResult(response);
      if (response.success && formRef.current) {
        formRef.current.reset();
      }
    });
  };

  const fieldErrors = !result?.success ? result?.error?.fieldErrors : undefined;

  return (
    <div className="space-y-4">
      {result?.success && (
        <Alert variant="success" className="animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Inquiry Submitted Successfully</AlertTitle>
          <AlertDescription>
            Reference ID: <code className="font-mono font-bold">{result.data.id}</code>.
            The domain service recorded your inquiry.
          </AlertDescription>
        </Alert>
      )}

      {result && !result.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Submission Failed</AlertTitle>
          <AlertDescription>{result.error.message}</AlertDescription>
        </Alert>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="inquiry-email"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
          >
            Email Address <span className="text-rose-500">*</span>
          </label>
          <Input
            id="inquiry-email"
            name="email"
            type="email"
            placeholder="developer@company.com"
            error={Boolean(fieldErrors?.email)}
            aria-describedby={fieldErrors?.email ? "email-error" : undefined}
            disabled={isPending}
            required
          />
          {fieldErrors?.email && (
            <p id="email-error" className="mt-1 text-xs text-rose-500 font-medium">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="inquiry-category"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
            >
              Category
            </label>
            <select
              id="inquiry-category"
              name="category"
              defaultValue="architecture"
              disabled={isPending}
              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="architecture">Architecture Consultation</option>
              <option value="technical">Technical Support</option>
              <option value="security">Security & Compliance</option>
              <option value="general">General Inquiries</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="inquiry-urgency"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
            >
              Urgency
            </label>
            <select
              id="inquiry-urgency"
              name="urgency"
              defaultValue="medium"
              disabled={isPending}
              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="inquiry-subject"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
          >
            Subject <span className="text-rose-500">*</span>
          </label>
          <Input
            id="inquiry-subject"
            name="subject"
            placeholder="e.g. Scalable State Management Strategy"
            error={Boolean(fieldErrors?.subject)}
            aria-describedby={fieldErrors?.subject ? "subject-error" : undefined}
            disabled={isPending}
            required
          />
          {fieldErrors?.subject && (
            <p id="subject-error" className="mt-1 text-xs text-rose-500 font-medium">
              {fieldErrors.subject}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="inquiry-message"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
          >
            Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            rows={3}
            placeholder="Describe requirements or technical questions in detail (min 10 characters)..."
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors?.message)}
            aria-describedby={fieldErrors?.message ? "message-error" : undefined}
            className="flex w-full rounded-md border border-slate-300 bg-white p-3 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
            required
          />
          {fieldErrors?.message && (
            <p id="message-error" className="mt-1 text-xs text-rose-500 font-medium">
              {fieldErrors.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Validating & Submitting...</span>
            </>
          ) : (
            <span>Submit Domain Inquiry</span>
          )}
        </Button>
      </form>
    </div>
  );
}
