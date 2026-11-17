import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReservationPage from "./page";

// Mock dispatchWebhookAction
vi.mock("../automations/actions/dispatch-webhook.action", () => ({
  dispatchWebhookAction: vi.fn().mockResolvedValue({
    success: true,
    status: 200,
    latencyMs: 45,
    responseBody: {
      status: "AVAILABLE",
      isAvailable: true,
      aiEvaluation: "0 overlapping events detected.",
    },
  }),
}));

describe("ReservationPage", () => {
  it("renders page title and initial Google Calendar events", () => {
    render(<ReservationPage />);

    expect(
      screen.getByRole("heading", { name: "Reservation & Google Calendar Sync" })
    ).toBeInTheDocument();

    expect(screen.getByText("November 2026")).toBeInTheDocument();

    expect(
      screen.getAllByText(/Sprint Planning & Architecture Sync/i).length
    ).toBeGreaterThan(0);
  });

  it("renders visual calendar grid with weekdays and interactive slots", () => {
    render(<ReservationPage />);

    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Month Grid/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Agenda List/i })).toBeInTheDocument();
  });

  it("switches to agenda view when clicking Agenda List button", async () => {
    const user = userEvent.setup();
    render(<ReservationPage />);

    const agendaBtn = screen.getByRole("button", { name: /Agenda List/i });
    await user.click(agendaBtn);

    expect(screen.getByText("Enterprise Client Architecture Demo")).toBeInTheDocument();
  });

  it("renders reservation form inputs and check availability button", () => {
    render(<ReservationPage />);

    expect(screen.getByPlaceholderText("e.g. Alex Rivera")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("alex.rivera@delta.local")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Check Availability with AI Agent/i })
    ).toBeInTheDocument();
  });

  it("checks availability when clicking the check availability button", async () => {
    const user = userEvent.setup();
    render(<ReservationPage />);

    const checkBtn = screen.getByRole("button", {
      name: /Check Availability with AI Agent/i,
    });
    await user.click(checkBtn);

    expect(await screen.findByText(/Slot is 100% Available!/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Confirm & Book Event/i })
    ).toBeInTheDocument();
  });

  it("renders inbound Gmail reservation inquiries and supports pre-filling", async () => {
    const user = userEvent.setup();
    render(<ReservationPage />);

    expect(screen.getByText(/Inbound Gmail Reservation Inquiries/i)).toBeInTheDocument();
    expect(screen.getByText("Jordan Reed")).toBeInTheDocument();

    const checkGmailBtn = screen.getByRole("button", {
      name: /Check Gmail for Requests/i,
    });
    expect(checkGmailBtn).toBeInTheDocument();

    const evaluateBtns = screen.getAllByRole("button", {
      name: /Evaluate Availability & Pre-fill/i,
    });
    expect(evaluateBtns.length).toBeGreaterThan(0);
    await user.click(evaluateBtns[0]);

    expect(await screen.findByText(/Slot is 100% Available!/i)).toBeInTheDocument();
  });
});
