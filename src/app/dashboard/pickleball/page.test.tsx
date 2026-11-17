import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PickleballReservationPage from "./page";

// Mock dispatchWebhookAction
vi.mock("../automations/actions/dispatch-webhook.action", () => ({
  dispatchWebhookAction: vi.fn().mockResolvedValue({
    success: true,
    status: 200,
    latencyMs: 35,
    responseBody: {
      status: "AVAILABLE",
      isAvailable: true,
      aiEvaluation: "Court availability verified! Court is 100% open.",
      pricing: {
        courtRatePerHour: 25,
        isPeakHour: false,
        estimatedTotal: 25,
      },
    },
  }),
}));

const getTodayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

describe("PickleballReservationPage", () => {
  it("renders page title and facility metrics", () => {
    render(<PickleballReservationPage />);

    expect(
      screen.getByRole("heading", {
        name: "Pickleball Court Reservation & Facility Manager",
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Active Courts")).toBeInTheDocument();
    expect(screen.getByText("4 Courts")).toBeInTheDocument();
    expect(screen.getByText("Operating Hours")).toBeInTheDocument();
    expect(screen.getByText("07:00 – 22:00")).toBeInTheDocument();
  });

  it("toggles facility settings panel and allows configuring courts and hours", async () => {
    const user = userEvent.setup();
    render(<PickleballReservationPage />);

    const settingsBtn = screen.getByRole("button", {
      name: /Toggle Facility Configuration/i,
    });
    await user.click(settingsBtn);

    expect(
      screen.getByText("Facility Hours & Court Layout Configuration")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Select Number of Courts")).toBeInTheDocument();
    expect(screen.getByLabelText("Select Facility Opening Time")).toBeInTheDocument();
    expect(screen.getByLabelText("Select Facility Closing Time")).toBeInTheDocument();

    // Change court count to 6
    const courtSelect = screen.getByLabelText("Select Number of Courts");
    await user.selectOptions(courtSelect, "6");

    expect(courtSelect).toHaveValue("6");
  });

  it("renders court availability matrix grid with court columns and time slots", () => {
    render(<PickleballReservationPage />);

    expect(screen.getByText(/Court Availability Matrix/i)).toBeInTheDocument();
    expect(screen.getAllByText("Court 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Court 2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Court 3").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Court 4").length).toBeGreaterThan(0);

    // Baseline bookings exist
    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
  });

  it("switches to confirmed agenda view when clicking the agenda button", async () => {
    const user = userEvent.setup();
    render(<PickleballReservationPage />);

    const agendaBtn = screen.getByRole("button", {
      name: /Confirmed Agenda/i,
    });
    await user.click(agendaBtn);

    expect(screen.getByText(/Confirmed Court Reservations/i)).toBeInTheDocument();
    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText("Marcus Vance")).toBeInTheDocument();
  });

  it("renders reservation booking form and checks court availability via AI agent", async () => {
    const user = userEvent.setup();
    render(<PickleballReservationPage />);

    expect(screen.getByText("Book a Pickleball Court")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Alex Rivera")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("player@delta.local")).toBeInTheDocument();

    const checkBtn = screen.getByRole("button", {
      name: /Check Availability with AI Agent/i,
    });
    await user.click(checkBtn);

    expect(await screen.findByText(/Court is 100% Available!/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Confirm & Finalize Court Booking/i,
      })
    ).toBeInTheDocument();
  });

  it("renders inbound Gmail court inquiries and allows pre-filling the booking", async () => {
    const user = userEvent.setup();
    render(<PickleballReservationPage />);

    expect(screen.getByText(/Inbound Gmail Court Inquiries/i)).toBeInTheDocument();
    expect(screen.getByText("Liam O'Connor")).toBeInTheDocument();

    const checkGmailBtn = screen.getByRole("button", {
      name: /Check Gmail for Court Requests/i,
    });
    expect(checkGmailBtn).toBeInTheDocument();

    const evaluateBtns = screen.getAllByRole("button", {
      name: /Evaluate Court Availability & Pre-fill/i,
    });
    expect(evaluateBtns.length).toBeGreaterThan(0);
    await user.click(evaluateBtns[0]);

    expect(await screen.findByText(/Court is 100% Available!/i)).toBeInTheDocument();
  });

  it("synchronizes court reservations from Google Calendar events and displays them on the court matrix", async () => {
    const user = userEvent.setup();
    const { dispatchWebhookAction } =
      await import("../automations/actions/dispatch-webhook.action");
    const today = getTodayStr();

    vi.mocked(dispatchWebhookAction).mockResolvedValueOnce({
      success: true,
      status: 200,
      latencyMs: 42,
      dispatchedAt: `${today}T10:00:00.000Z`,
      responseBody: {
        action: "get_court_schedule",
        date: today,
        bookings: [
          {
            id: "gcal_sync_test_99",
            courtId: "court_4",
            courtName: "Court 4",
            date: today,
            timeSlot: "08:00 AM",
            durationMinutes: 60,
            playerName: "Serena Williams",
            playerEmail: "serena@delta.local",
            matchType: "Singles Match",
            pinCode: "7711",
            status: "CONFIRMED",
          },
        ],
      },
    });

    render(<PickleballReservationPage />);

    // Click "Sync Calendar"
    const syncBtn = screen.getByRole("button", {
      name: /Refresh & Sync Google Calendar/i,
    });
    await user.click(syncBtn);

    // Verify Serena Williams appears in Court 4 on the matrix
    expect(await screen.findByText("Serena Williams")).toBeInTheDocument();
    expect(screen.getByText("PIN: 7711")).toBeInTheDocument();
  });

  it("confirms a court booking and immediately reflects the reservation on the court matrix", async () => {
    const user = userEvent.setup();
    const { dispatchWebhookAction } =
      await import("../automations/actions/dispatch-webhook.action");
    const today = getTodayStr();

    // 1. Mock availability check
    vi.mocked(dispatchWebhookAction).mockResolvedValueOnce({
      success: true,
      status: 200,
      latencyMs: 30,
      dispatchedAt: `${today}T10:00:00.000Z`,
      responseBody: {
        status: "AVAILABLE",
        isAvailable: true,
        aiEvaluation: "Court is ready for booking.",
      },
    });

    // 2. Mock booking confirmation with Google Calendar event
    vi.mocked(dispatchWebhookAction).mockResolvedValueOnce({
      success: true,
      status: 200,
      latencyMs: 45,
      dispatchedAt: `${today}T10:00:00.000Z`,
      responseBody: {
        action: "book_court",
        bookingId: `PB-${today.replace(/-/g, "")}-9988`,
        accessCode: "9988",
        googleCalendarEventId: "gcal_evt_12345",
        googleCalendarLink: "https://calendar.google.com/calendar/r/eventedit/12345",
        booking: {
          id: `PB-${today.replace(/-/g, "")}-9988`,
          courtId: "court_3",
          courtName: "Court 3",
          date: today,
          timeSlot: "09:00 AM",
          durationMinutes: 60,
          playerName: "Carlos Alcaraz",
          playerEmail: "carlos@delta.local",
          matchType: "Doubles Match",
          pinCode: "9988",
          googleCalendarEventId: "gcal_evt_12345",
          googleCalendarLink: "https://calendar.google.com/calendar/r/eventedit/12345",
          status: "CONFIRMED",
        },
      },
    });

    render(<PickleballReservationPage />);

    // Fill form
    const nameInput = screen.getByPlaceholderText("e.g. Alex Rivera");
    await user.clear(nameInput);
    await user.type(nameInput, "Carlos Alcaraz");

    // Select Court 3
    const courtSelect = screen.getByLabelText("Court Selection");
    await user.selectOptions(courtSelect, "court_3");

    // Evaluate availability
    const checkBtn = screen.getByRole("button", {
      name: /Check Availability with AI Agent/i,
    });
    await user.click(checkBtn);

    // Confirm booking
    const confirmBtn = await screen.findByRole("button", {
      name: /Confirm & Finalize Court Booking/i,
    });
    await user.click(confirmBtn);

    // Verify booked pass appears and Carlos Alcaraz appears on the Court Matrix
    expect(await screen.findByText(/Court Reserved Successfully!/i)).toBeInTheDocument();
    expect(screen.getAllByText("Carlos Alcaraz").length).toBeGreaterThan(0);
    expect(screen.getAllByText("PIN: 9988").length).toBeGreaterThan(0);
  });

  it("formats schedules as 9:00am-10:00am, clearly states 1 hour, and dispatches timezone-aware ISO timestamps", async () => {
    const user = userEvent.setup();
    const { dispatchWebhookAction } =
      await import("../automations/actions/dispatch-webhook.action");

    render(<PickleballReservationPage />);

    // 1. Navigate to Next Day so 7:00am-8:00am is an upcoming bookable slot
    const nextDayBtn = screen.getByRole("button", { name: "Next Day" });
    await user.click(nextDayBtn);

    // 2. Matrix renders 9:00am-10:00am slot and 1 Hour badges
    expect(screen.getByText("9:00am-10:00am")).toBeInTheDocument();
    expect(screen.getAllByText("1 Hour").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Open (1h)").length).toBeGreaterThan(0);

    // 3. Select 7:00am-8:00am slot from dropdown
    const timeSlotSelect = screen.getByLabelText("Time Slot Selection");
    await user.selectOptions(timeSlotSelect, "7:00am-8:00am");

    // Check availability
    const checkBtn = screen.getByRole("button", {
      name: /Check Availability with AI Agent/i,
    });
    await user.click(checkBtn);

    // Confirm booking
    const confirmBtn = await screen.findByRole("button", {
      name: /Confirm & Finalize Court Booking/i,
    });
    await user.click(confirmBtn);

    // Inspect the call to dispatchWebhookAction
    expect(dispatchWebhookAction).toHaveBeenCalled();
    const lastCall = vi.mocked(dispatchWebhookAction).mock.calls.at(-1);
    expect(lastCall).toBeDefined();
    const payload = lastCall?.[1] as Record<string, unknown>;
    expect(payload.action).toBe("book_court");
    expect(payload.timeSlot).toBe("7:00am-8:00am");
    expect(typeof payload.startIso).toBe("string");
    expect(typeof payload.endIso).toBe("string");
    // Ensure startIso contains T07:00:00 and an explicit timezone offset (+ or -)
    expect(payload.startIso as string).toMatch(/T07:00:00([+-]\d{2}:\d{2}|Z)/);
    expect(payload.durationMinutes).toBe(60);
  });

  it("places a 10-minute soft hold in matrix and opens checkout payment dialog with itemized receipt", async () => {
    const user = userEvent.setup();
    render(<PickleballReservationPage />);

    // 1. Select open Court 3
    const courtSelect = screen.getByLabelText("Court Selection");
    await user.selectOptions(courtSelect, "court_3");

    // 2. Check availability
    const checkBtn = screen.getByRole("button", {
      name: /Check Availability with AI Agent/i,
    });
    await user.click(checkBtn);

    // 3. Verify soft hold is placed and visible in card and matrix
    expect(await screen.findByText(/10m Soft Hold/i)).toBeInTheDocument();
    expect(screen.getAllByText(/In Checkout/i).length).toBeGreaterThan(0);

    // 4. Open Checkout Receipt dialog
    const receiptBtn = screen.getByRole("button", {
      name: /Checkout Receipt/i,
    });
    await user.click(receiptBtn);

    // 5. Verify checkout dialog contents
    expect(screen.getByText("Court Reservation Checkout & Payment")).toBeInTheDocument();
    expect(screen.getByText(/Total Payment Due/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Free cancellation with full 100% refund/i)
    ).toBeInTheDocument();

    // 6. Select Apple Pay in checkout
    const applePayBtns = screen.getAllByRole("button", { name: "Apple Pay" });
    await user.click(applePayBtns[0]);

    // 7. Close checkout dialog
    const backBtn = screen.getByRole("button", { name: "Back" });
    await user.click(backBtn);
    expect(
      screen.queryByText("Court Reservation Checkout & Payment")
    ).not.toBeInTheDocument();
  });

  it("cancels a confirmed reservation, records refund, and releases court slot back to open status", async () => {
    const user = userEvent.setup();
    const { dispatchWebhookAction } =
      await import("../automations/actions/dispatch-webhook.action");

    vi.mocked(dispatchWebhookAction).mockResolvedValueOnce({
      success: true,
      status: 200,
      latencyMs: 20,
      dispatchedAt: "2026-11-14T10:00:00.000Z",
      responseBody: {
        action: "cancel_court",
        status: "CANCELLED",
        bookingReference: "PB-20261114-1011",
        refundStatus: "REFUNDED",
        refundAmount: "$25.00",
      },
    });

    render(<PickleballReservationPage />);

    // 1. Switch to Confirmed Agenda view to see Sarah Chen's booking
    const agendaBtn = screen.getByRole("button", { name: /Confirmed Agenda/i });
    await user.click(agendaBtn);

    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();

    // 2. Click Cancel button on Sarah Chen's booking
    const cancelBtns = screen.getAllByRole("button", { name: /Cancel/i });
    expect(cancelBtns.length).toBeGreaterThan(0);
    await user.click(cancelBtns[0]);

    // 3. Verify cancellation confirmation dialog appears
    expect(
      screen.getByText("Cancel Court Reservation & Process Refund")
    ).toBeInTheDocument();
    expect(screen.getByText(/A 100% refund of/i)).toBeInTheDocument();
    expect(screen.getByText(/Reason for Cancellation/i)).toBeInTheDocument();

    // 4. Confirm cancellation
    const confirmCancelBtn = screen.getByRole("button", {
      name: /Confirm Cancellation & Refund/i,
    });
    await user.click(confirmCancelBtn);

    // 5. Verify cancellation notification is displayed
    expect(await screen.findByText(/was successfully cancelled/i)).toBeInTheDocument();
  });

  it("disables past time slots with visual indicators and dynamically anchors Today to current client date", async () => {
    const user = userEvent.setup();
    render(<PickleballReservationPage />);

    // 1. Dynamic Today badge is displayed in date navigation
    expect(screen.getAllByText("Today").length).toBeGreaterThanOrEqual(2);

    // 2. Matrix Legend displays Past / Concluded (Unavailable)
    expect(screen.getByText(/Past \/ Concluded \(Unavailable\)/i)).toBeInTheDocument();

    // 3. Navigate to yesterday
    const prevDayBtn = screen.getByRole("button", { name: "Previous Day" });
    await user.click(prevDayBtn);

    // 4. In yesterday's view, open slots are unclickable and labeled Passed • Unavailable
    const passedSlots = screen.getAllByText(/Passed • Unavailable/i);
    expect(passedSlots.length).toBeGreaterThan(0);

    // 5. Jump to Today button dynamically restores today's date and Today badge
    const todayBtn = screen.getByRole("button", { name: "Jump to Today" });
    await user.click(todayBtn);
    expect(screen.getAllByText("Today").length).toBeGreaterThanOrEqual(2);
  });
});
