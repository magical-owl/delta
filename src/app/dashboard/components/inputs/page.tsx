"use client";

import * as React from "react";
import { AppInput } from "@/components/ui/app-input";
import { AppTextarea } from "@/components/ui/app-textarea";
import { AppButton } from "@/components/ui/app-button";
import { AppAlert } from "@/components/ui/app-alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function InputsShowcasePage() {
  // Interactive Form State
  const [formState, setFormState] = React.useState({
    fullName: "",
    email: "",
    password: "",
    notes: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formState.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    if (!formState.email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (formState.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Input Controls & Forms
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          High-contrast accessible text inputs, password visibility toggles, and resizable
          textareas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Input Types */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Input Types</CardTitle>
            <CardDescription>
              Common text, email, and number inputs with helper text
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <AppInput
              label="Standard Text Input"
              placeholder="e.g. John Doe"
              helperText="Informative hint for input expectations."
            />
            <AppInput
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              leftIcon="users"
              helperText="We will never share your email with third parties."
            />
            <AppInput
              label="Search Query"
              type="search"
              placeholder="Search components or files..."
              leftIcon="magnifying-glass"
            />
            <AppInput
              label="Numeric Port"
              type="number"
              placeholder="8080"
              defaultValue={3000}
            />
          </CardContent>
        </Card>

        {/* Password & Security */}
        <Card>
          <CardHeader>
            <CardTitle>Password with Visibility Toggle</CardTitle>
            <CardDescription>
              Accessible toggle button using Font Awesome eye icons
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <AppInput
              label="Secret API Key"
              type="password"
              showPasswordToggle
              defaultValue="sk_live_94812304918230912"
              helperText="Click the eye icon to inspect unmasked key."
            />
            <AppInput
              label="Input with Error Validation"
              defaultValue="invalid-format-entry"
              errorMessage="This format does not match the expected pattern."
            />
            <AppInput
              label="Disabled Input"
              disabled
              defaultValue="System Locked Value"
              helperText="This field is disabled by administrative policy."
            />
          </CardContent>
        </Card>

        {/* Textarea Controls */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Textarea with Character Counter</CardTitle>
            <CardDescription>
              Multi-line field with built-in count bounds and reactive resizing
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AppTextarea
              label="Project Scope Description"
              placeholder="Detail your operational requirements..."
              maxLength={200}
              showCount
              rows={4}
              helperText="Maximum 200 characters allowed."
            />
            <AppTextarea
              label="Error State Textarea"
              errorMessage="Audit notes cannot be empty during deployment review."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Interactive Validation Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Interactive Validated Form</CardTitle>
            <CardDescription>
              Demonstrates live client-side validation, error messaging, and button
              loading
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted && (
              <div className="mb-6">
                <AppAlert
                  variant="success"
                  title="Form Submitted Successfully"
                  dismissible
                  onDismiss={() => setSubmitted(false)}
                >
                  All inputs passed client-side validation without errors.
                </AppAlert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
              <AppInput
                label="Full Name"
                required
                placeholder="Jane Smith"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                errorMessage={errors.fullName}
              />

              <AppInput
                label="Corporate Email"
                required
                type="email"
                placeholder="jane@company.org"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                errorMessage={errors.email}
              />

              <AppInput
                label="Secure Password"
                required
                type="password"
                showPasswordToggle
                placeholder="Enter password (min 8 chars)"
                value={formState.password}
                onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                errorMessage={errors.password}
                helperText="Must be at least 8 characters long."
              />

              <AppTextarea
                label="Optional Feedback"
                placeholder="Any special operational constraints..."
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                rows={3}
              />

              <div className="flex items-center gap-3 pt-2">
                <AppButton type="submit" variant="primary">
                  Submit Form
                </AppButton>
                <AppButton
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormState({ fullName: "", email: "", password: "", notes: "" });
                    setErrors({});
                    setSubmitted(false);
                  }}
                >
                  Reset Form
                </AppButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
