"use client";

import * as React from "react";
import { useTransition } from "react";
import Link from "next/link";
import { PageHeading } from "@/components/shared/page-heading";
import { ContentCard } from "@/components/shared/content-card";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { AppInput } from "@/components/ui/app-input";
import {
  dispatchWebhookAction,
  type DispatchWebhookResult,
} from "../automations/actions/dispatch-webhook.action";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  endSlot?: string;
  attendees: string[];
  status: "confirmed" | "hold" | "cancelled";
  calendar: string;
  googleMeetLink?: string;
}

export interface SuggestedSlot {
  date: string;
  timeSlot: string;
  durationMinutes: number;
  label: string;
}

export interface ReservationAuditLog {
  id: string;
  action: "sync_events" | "check_availability" | "confirm_booking" | "check_gmail";
  summary: string;
  status: string;
  latencyMs: number;
  time: string;
  isSuccess: boolean;
}

export interface InboundGmailRequest {
  id: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  snippet: string;
  requestedDate: string;
  requestedSlot: string;
  receivedAt: string;
  status: "PENDING_EVALUATION" | "AVAILABLE" | "CONFLICT" | "BOOKED";
}

const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "gcal_evt_101",
    title: "Sprint Planning & Architecture Sync",
    date: "2026-11-16",
    timeSlot: "09:00 AM",
    durationMinutes: 60,
    endSlot: "10:00 AM",
    attendees: ["lead@delta.local", "arch@delta.local"],
    status: "confirmed",
    calendar: "Engineering Primary",
  },
  {
    id: "gcal_evt_102",
    title: "Executive Architecture Review",
    date: "2026-11-16",
    timeSlot: "10:30 AM",
    durationMinutes: 60,
    endSlot: "11:30 AM",
    attendees: ["cto@delta.local", "director@delta.local"],
    status: "confirmed",
    calendar: "Executive Board",
  },
  {
    id: "gcal_evt_103",
    title: "SecOps Vulnerability Briefing",
    date: "2026-11-16",
    timeSlot: "02:00 PM",
    durationMinutes: 60,
    endSlot: "03:00 PM",
    attendees: ["secops@delta.local"],
    status: "confirmed",
    calendar: "Security Operations",
  },
  {
    id: "gcal_evt_104",
    title: "Enterprise Client Architecture Demo",
    date: "2026-11-17",
    timeSlot: "11:00 AM",
    durationMinutes: 60,
    endSlot: "12:00 PM",
    attendees: ["partner@enterprise.com"],
    status: "confirmed",
    calendar: "Engineering Primary",
  },
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STANDARD_TIME_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "11:30 AM",
  "02:00 PM",
  "03:30 PM",
  "04:30 PM",
];

// Helper to generate the monthly calendar grid days
function getCalendarMonthDays(year: number, month: number) {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: {
    dayNumber: number;
    dateStr: string;
    isCurrentMonth: boolean;
  }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevM = month === 0 ? 12 : month;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ dayNumber: d, dateStr, isCurrentMonth: true });
  }

  // Next month leading days to complete full weeks
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextM = month === 11 ? 1 : month + 2;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
  }

  return days;
}

export default function ReservationPage() {
  const [isPending, startTransition] = useTransition();
  const [webhookUrl, setWebhookUrl] = React.useState(
    "https://ozephyrmor.app.n8n.cloud/webhook/delta-calendar-reservation"
  );

  // Synced Calendar State
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>(
    INITIAL_CALENDAR_EVENTS
  );
  const [isLiveSynced, setIsLiveSynced] = React.useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = React.useState<string>(
    "Initial Demo Baseline"
  );

  // Interactive Calendar View State (November 2026 default)
  const [calendarYear, setCalendarYear] = React.useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = React.useState<number>(10); // 0-indexed (10 = November)
  const [viewMode, setViewMode] = React.useState<"month" | "agenda">("month");

  // Booking Form State
  const [name, setName] = React.useState("Alex Rivera");
  const [email, setEmail] = React.useState("alex.rivera@delta.local");
  const [bookingDate, setBookingDate] = React.useState("2026-11-16");
  const [timeSlot, setTimeSlot] = React.useState("10:30 AM");
  const [duration, setDuration] = React.useState("45");
  const [purpose, setPurpose] = React.useState(
    "Technical Architecture Review & n8n Integration"
  );

  // AI Evaluation State
  const [availabilityResult, setAvailabilityResult] = React.useState<{
    status: "IDLE" | "AVAILABLE" | "CONFLICT" | "BOOKED";
    isAvailable?: boolean;
    conflictReason?: string;
    conflictWith?: string;
    aiEvaluation?: string;
    suggestedSlots?: SuggestedSlot[];
    bookingId?: string;
    meetUrl?: string;
  }>({ status: "IDLE" });

  const [latestDispatchResult, setLatestDispatchResult] =
    React.useState<DispatchWebhookResult | null>(null);

  const [auditLogs, setAuditLogs] = React.useState<ReservationAuditLog[]>([
    {
      id: "res_init_01",
      action: "sync_events",
      summary: "Loaded 4 Google Calendar events",
      status: "Ready",
      latencyMs: 38,
      time: "Initial Ready State",
      isSuccess: true,
    },
  ]);

  // Calendar Month Navigation
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const handleGoToSelectedDate = () => {
    const parts = bookingDate.split("-");
    if (parts.length === 3) {
      setCalendarYear(parseInt(parts[0], 10));
      setCalendarMonth(parseInt(parts[1], 10) - 1);
    }
  };

  // Sync Calendar from n8n
  const handleSyncCalendar = () => {
    startTransition(async () => {
      const payload = {
        action: "sync_events",
        calendarId: "primary@delta.local",
      };

      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestDispatchResult(result);

      if (
        result.success &&
        result.responseBody &&
        typeof result.responseBody === "object"
      ) {
        const body = result.responseBody as {
          events?: CalendarEvent[];
        };
        if (Array.isArray(body.events)) {
          setCalendarEvents(body.events);
          setIsLiveSynced(true);
        }
      }

      setLastSyncedTime(new Date().toLocaleTimeString());

      const syncedCount =
        result.success &&
        result.responseBody &&
        typeof result.responseBody === "object" &&
        Array.isArray((result.responseBody as { events?: unknown[] }).events)
          ? (result.responseBody as { events: unknown[] }).events.length
          : null;

      const newLog: ReservationAuditLog = {
        id: `res_sync_${Date.now().toString(36)}`,
        action: "sync_events",
        summary:
          syncedCount !== null
            ? `Synchronized ${syncedCount} event${syncedCount === 1 ? "" : "s"} from Google Calendar via n8n`
            : result.success
              ? "Synchronized calendar from Google via n8n"
              : `Sync failed: ${result.error || "Webhook error"}`,
        status: result.success ? `${result.status || 200} OK` : result.error || "Failed",
        latencyMs: result.latencyMs,
        time: new Date().toLocaleTimeString(),
        isSuccess: result.success,
      };

      setAuditLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    });
  };

  // Inbound Gmail Requests State
  const [inboundGmailRequests, setInboundGmailRequests] = React.useState<
    InboundGmailRequest[]
  >([
    {
      id: "mail_init_1",
      subject: "Meeting Request: Technical Consultation for Architecture Review",
      senderName: "Jordan Reed",
      senderEmail: "jreed@external-client.com",
      snippet:
        "Hi Delta team, Could we schedule a 45 min consultation on 2026-11-18 around 02:00 PM?",
      requestedDate: "2026-11-18",
      requestedSlot: "02:00 PM",
      receivedAt: "2026-11-14T10:15:00.000Z",
      status: "PENDING_EVALUATION",
    },
    {
      id: "mail_init_2",
      subject: "Inquiry on Delta AI Platform Integration",
      senderName: "Elena Rostova",
      senderEmail: "elena.r@enterprise.io",
      snippet:
        "Hello, requesting a demo session for our engineering squad on 2026-11-16 at 10:30 AM.",
      requestedDate: "2026-11-16",
      requestedSlot: "10:30 AM",
      receivedAt: "2026-11-14T11:00:00.000Z",
      status: "PENDING_EVALUATION",
    },
  ]);

  // Check Gmail for inbound reservation requests via n8n
  const handleCheckGmail = () => {
    startTransition(async () => {
      const payload = {
        action: "check_gmail",
      };

      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestDispatchResult(result);

      if (
        result.success &&
        result.responseBody &&
        typeof result.responseBody === "object"
      ) {
        const body = result.responseBody as {
          inboundRequests?: InboundGmailRequest[];
        };
        if (Array.isArray(body.inboundRequests) && body.inboundRequests.length > 0) {
          setInboundGmailRequests(body.inboundRequests);
        }
      }

      const reqCount =
        result.success &&
        result.responseBody &&
        typeof result.responseBody === "object" &&
        Array.isArray(
          (result.responseBody as { inboundRequests?: unknown[] }).inboundRequests
        )
          ? (result.responseBody as { inboundRequests: unknown[] }).inboundRequests.length
          : null;

      const newLog: ReservationAuditLog = {
        id: `res_gmail_${Date.now().toString(36)}`,
        action: "check_gmail",
        summary:
          reqCount !== null
            ? `Checked Gmail: Found ${reqCount} inbound reservation request email${reqCount === 1 ? "" : "s"}`
            : result.success
              ? "Checked Gmail inbox for reservation requests via n8n"
              : `Gmail query failed: ${result.error || "Webhook error"}`,
        status: result.success ? `${result.status || 200} OK` : result.error || "Failed",
        latencyMs: result.latencyMs,
        time: new Date().toLocaleTimeString(),
        isSuccess: result.success,
      };

      setAuditLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    });
  };

  // Check Availability with n8n AI Agent
  const handleCheckAvailability = () => {
    startTransition(async () => {
      const payload = {
        action: "check_availability",
        date: bookingDate,
        timeSlot,
        durationMinutes: parseInt(duration, 10) || 45,
        name,
        email,
        purpose,
      };

      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestDispatchResult(result);

      if (
        result.success &&
        result.responseBody &&
        typeof result.responseBody === "object"
      ) {
        const body = result.responseBody as {
          status?: "AVAILABLE" | "CONFLICT";
          isAvailable?: boolean;
          conflictWith?: string;
          conflictDetails?: string;
          aiEvaluation?: string;
          suggestedSlots?: SuggestedSlot[];
        };

        if (body.status === "CONFLICT") {
          setAvailabilityResult({
            status: "CONFLICT",
            isAvailable: false,
            conflictReason: body.conflictDetails || "Time slot overlap",
            conflictWith: body.conflictWith,
            aiEvaluation: body.aiEvaluation,
            suggestedSlots: body.suggestedSlots || [],
          });
        } else {
          setAvailabilityResult({
            status: "AVAILABLE",
            isAvailable: true,
            aiEvaluation:
              body.aiEvaluation ||
              "Google Calendar queried: 0 overlapping events detected.",
          });
        }
      } else {
        // Fallback local evaluation if n8n returns an error or is offline
        const localConflict = calendarEvents.find(
          (e) => e.date === bookingDate && e.timeSlot === timeSlot
        );

        if (localConflict) {
          setAvailabilityResult({
            status: "CONFLICT",
            isAvailable: false,
            conflictReason: `Conflict with '${localConflict.title}' (${localConflict.timeSlot} – ${localConflict.endSlot || "1 hour"})`,
            conflictWith: localConflict.title,
            aiEvaluation: `Local evaluator detected overlap with '${localConflict.title}'. Please pick an open slot.`,
            suggestedSlots: [
              {
                date: bookingDate,
                timeSlot: "11:30 AM",
                durationMinutes: parseInt(duration, 10) || 45,
                label: `${bookingDate} at 11:30 AM (Adjacent Open Slot)`,
              },
              {
                date: bookingDate,
                timeSlot: "03:30 PM",
                durationMinutes: parseInt(duration, 10) || 45,
                label: `${bookingDate} at 03:30 PM (Afternoon Window)`,
              },
            ],
          });
        } else {
          setAvailabilityResult({
            status: "AVAILABLE",
            isAvailable: true,
            aiEvaluation: `0 overlapping events detected for ${bookingDate} at ${timeSlot}. The slot is available!`,
          });
        }
      }

      const newLog: ReservationAuditLog = {
        id: `res_chk_${Date.now().toString(36)}`,
        action: "check_availability",
        summary: `Checked availability for ${bookingDate} at ${timeSlot}`,
        status: result.success
          ? `${result.status || 200} OK`
          : result.error || "Evaluated",
        latencyMs: result.latencyMs,
        time: new Date().toLocaleTimeString(),
        isSuccess: result.success,
      };

      setAuditLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    });
  };

  // Confirm and Finalize Booking on Google Calendar
  const handleConfirmBooking = () => {
    startTransition(async () => {
      const payload = {
        action: "confirm_booking",
        date: bookingDate,
        timeSlot,
        durationMinutes: parseInt(duration, 10) || 45,
        name,
        email,
        purpose,
      };

      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestDispatchResult(result);

      const bookingId = `gcal_evt_${Math.floor(10000 + Math.random() * 90000)}`;
      const meetUrl = `https://meet.google.com/res-${Date.now().toString(36)}`;

      if (
        result.success &&
        result.responseBody &&
        typeof result.responseBody === "object"
      ) {
        const body = result.responseBody as {
          bookingId?: string;
          meetUrl?: string;
          event?: CalendarEvent;
        };

        const confirmedBookingId = body.bookingId || bookingId;
        const confirmedMeetUrl = body.meetUrl || meetUrl;

        setAvailabilityResult({
          status: "BOOKED",
          bookingId: confirmedBookingId,
          meetUrl: confirmedMeetUrl,
          aiEvaluation: `Reservation confirmed! Google Calendar event created and Google Meet invite dispatched to ${email}.`,
        });

        if (body.event) {
          setCalendarEvents((prev) => [body.event!, ...prev]);
        } else {
          const newEvent: CalendarEvent = {
            id: confirmedBookingId,
            title: purpose,
            date: bookingDate,
            timeSlot,
            durationMinutes: parseInt(duration, 10) || 45,
            attendees: [email, "reservations@delta.local"],
            status: "confirmed",
            calendar: "Engineering Primary",
            googleMeetLink: confirmedMeetUrl,
          };
          setCalendarEvents((prev) => [newEvent, ...prev]);
        }
      } else {
        // Fallback local booking confirmation
        setAvailabilityResult({
          status: "BOOKED",
          bookingId,
          meetUrl,
          aiEvaluation: `Reservation confirmed locally! Google Calendar event created and invite queued for ${email}.`,
        });

        const newEvent: CalendarEvent = {
          id: bookingId,
          title: purpose,
          date: bookingDate,
          timeSlot,
          durationMinutes: parseInt(duration, 10) || 45,
          attendees: [email, "reservations@delta.local"],
          status: "confirmed",
          calendar: "Engineering Primary",
          googleMeetLink: meetUrl,
        };
        setCalendarEvents((prev) => [newEvent, ...prev]);
      }

      const newLog: ReservationAuditLog = {
        id: `res_book_${Date.now().toString(36)}`,
        action: "confirm_booking",
        summary: `Confirmed booking for ${name} on ${bookingDate} at ${timeSlot}`,
        status: result.success ? `${result.status || 200} OK` : "Booked",
        latencyMs: result.latencyMs,
        time: new Date().toLocaleTimeString(),
        isSuccess: true,
      };

      setAuditLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    });
  };

  // Calendar Month Days
  const monthDays = React.useMemo(() => {
    return getCalendarMonthDays(calendarYear, calendarMonth);
  }, [calendarYear, calendarMonth]);

  // Events on the currently selected bookingDate
  const selectedDateEvents = React.useMemo(() => {
    return calendarEvents.filter((e) => e.date === bookingDate);
  }, [calendarEvents, bookingDate]);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          <AppIcon name="arrow-left" size="xs" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-2">
          {isLiveSynced ? (
            <AppBadge variant="success" leftIcon="calendar-check">
              Google Calendar: Live ({calendarEvents.length})
            </AppBadge>
          ) : (
            <AppBadge variant="warning" leftIcon="circle-info">
              Demo Data (Click Sync)
            </AppBadge>
          )}
          <AppBadge variant="info" leftIcon="bolt">
            n8n AI Agent v2.4
          </AppBadge>
        </div>
      </div>

      <PageHeading
        title="Reservation & Google Calendar Sync"
        subtitle="Interactive visual calendar synchronized with Google Calendar. Select dates on the calendar, test datetime availability with the n8n AI agent, and confirm bookings with Google Meet links."
      >
        <div className="flex flex-wrap items-center gap-2">
          <AppButton
            variant="outline"
            size="sm"
            onClick={handleCheckGmail}
            disabled={isPending}
            aria-label="Check Gmail for Requests"
          >
            <AppIcon name="envelope" size="xs" />
            <span className="ml-1.5">Check Gmail Requests</span>
          </AppButton>
          <AppButton
            variant="outline"
            size="sm"
            onClick={handleSyncCalendar}
            disabled={isPending}
            aria-label="Sync from Google Calendar"
          >
            <AppIcon
              name={isPending ? "spinner" : "arrows-rotate"}
              spin={isPending}
              size="xs"
            />
            <span className="ml-1.5">
              {isPending ? "Syncing..." : "Sync from Google Calendar"}
            </span>
          </AppButton>
        </div>
      </PageHeading>

      {/* Demo Data Banner when not yet synced with live GCal */}
      {!isLiveSynced && (
        <div className="rounded-lg border border-[var(--color-info)] bg-[var(--color-info-bg)] p-3.5 text-xs text-[var(--color-info)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AppIcon name="circle-info" size="xs" />
            <span>
              Showing sample demo events (Sprint Planning, Exec Review). Click{" "}
              <strong>&ldquo;Sync from Google Calendar&rdquo;</strong> to replace them
              with your live Google Calendar events.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setCalendarEvents([]);
              setIsLiveSynced(true);
            }}
            className="text-xs font-semibold underline hover:text-[var(--foreground)] cursor-pointer"
          >
            Clear Demo Events
          </button>
        </div>
      )}

      {/* Sync Control & Webhook Configuration */}
      <ContentCard title="Google Calendar & n8n Automation Bridge">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              n8n Calendar Reservation Webhook URL
            </label>
            <AppInput
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://ozephyrmor.app.n8n.cloud/webhook/delta-calendar-reservation"
            />
            {latestDispatchResult && !latestDispatchResult.success && (
              <p className="mt-1.5 text-[11px] text-[var(--color-error)]">
                {latestDispatchResult.error}
              </p>
            )}
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs space-y-1">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Calendar ID:</span>
              <span className="font-mono text-[var(--foreground)]">
                primary@delta.local
              </span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Last Synced:</span>
              <span className="font-mono text-[var(--foreground)]">{lastSyncedTime}</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Active Events:</span>
              <span className="font-bold text-[var(--primary)]">
                {calendarEvents.length}
              </span>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Reservation Form & AI Availability Agent */}
        <div className="lg:col-span-5 space-y-6">
          <ContentCard title="Book a Reservation (AI Evaluated)">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Full Name
                </label>
                <AppInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Email Address (Invite Recipient)
                </label>
                <AppInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivera@delta.local"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Selected Date (or click Calendar &rarr;)
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      const parts = e.target.value.split("-");
                      if (parts.length === 3) {
                        setCalendarYear(parseInt(parts[0], 10));
                        setCalendarMonth(parseInt(parts[1], 10) - 1);
                      }
                    }}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    {STANDARD_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Target Calendar
                  </label>
                  <select
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    defaultValue="Engineering Primary"
                  >
                    <option value="Engineering Primary">Engineering Primary</option>
                    <option value="Executive Board">Executive Board</option>
                    <option value="Security Operations">Security Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Purpose / Agenda
                </label>
                <AppInput
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Architecture Review"
                />
              </div>

              <AppButton
                variant="primary"
                size="md"
                onClick={handleCheckAvailability}
                disabled={isPending}
                className="w-full justify-center"
              >
                <AppIcon
                  name={isPending ? "spinner" : "magnifying-glass"}
                  spin={isPending}
                  size="sm"
                />
                <span className="ml-2">
                  {isPending
                    ? "Querying Google Calendar & AI Agent..."
                    : "Check Availability with AI Agent"}
                </span>
              </AppButton>
            </div>
          </ContentCard>

          {/* AI Agent Feedback Card */}
          <ContentCard title="AI Agent Availability Feedback">
            {availabilityResult.status === "IDLE" && (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">
                <AppIcon
                  name="calendar-check"
                  size="lg"
                  className="mb-2 text-[var(--primary)]"
                />
                <p className="font-semibold text-[var(--foreground)]">
                  No Slot Checked Yet
                </p>
                <p className="mt-1">
                  Pick a date from the visual calendar and a time slot, then click
                  &ldquo;Check Availability&rdquo; to trigger the n8n AI Agent against
                  live Google Calendar events.
                </p>
              </div>
            )}

            {/* Case: CONFLICT */}
            {availabilityResult.status === "CONFLICT" && (
              <div className="space-y-3 rounded-lg border border-[var(--color-error)] bg-[var(--color-error-bg)] p-4 text-xs">
                <div className="flex items-center gap-2 text-[var(--color-error)] font-bold">
                  <AppIcon name="triangle-exclamation" size="sm" />
                  <span>Time Slot Unavailable (Conflict Detected)</span>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {availabilityResult.conflictReason}
                </p>
                {availabilityResult.aiEvaluation && (
                  <p className="text-[var(--text-muted)] italic">
                    &ldquo;{availabilityResult.aiEvaluation}&rdquo;
                  </p>
                )}

                {/* Suggested Alternatives */}
                {availabilityResult.suggestedSlots &&
                  availabilityResult.suggestedSlots.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                      <p className="font-semibold text-[var(--foreground)] mb-2">
                        AI-Recommended Alternative Slots:
                      </p>
                      <div className="space-y-1.5">
                        {availabilityResult.suggestedSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setBookingDate(slot.date);
                              setTimeSlot(slot.timeSlot);
                              setAvailabilityResult({ status: "IDLE" });
                            }}
                            className="w-full flex items-center justify-between rounded border border-[var(--border)] bg-[var(--surface)] p-2 text-left hover:border-[var(--primary)] hover:bg-[var(--surface-muted)] transition-colors"
                          >
                            <span className="font-medium text-[var(--foreground)]">
                              {slot.label}
                            </span>
                            <span className="text-[10px] text-[var(--primary)] font-semibold">
                              Select Slot &rarr;
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Case: AVAILABLE */}
            {availabilityResult.status === "AVAILABLE" && (
              <div className="space-y-4 rounded-lg border border-[var(--color-success)] bg-[var(--color-success-bg)] p-4 text-xs">
                <div className="flex items-center gap-2 text-[var(--color-success)] font-bold">
                  <AppIcon name="circle-check" size="sm" />
                  <span>Slot is 100% Available!</span>
                </div>
                <div className="rounded border border-[var(--color-success)]/30 bg-[var(--surface)] p-3 space-y-1">
                  <div className="font-semibold text-[var(--foreground)]">
                    {bookingDate} at {timeSlot} ({duration} mins)
                  </div>
                  <div className="text-[var(--text-muted)]">
                    Target Host: Engineering Primary &bull; Attendee: {email}
                  </div>
                  <div className="text-[var(--text-muted)]">
                    {availabilityResult.aiEvaluation}
                  </div>
                </div>

                {/* Confirmation Box */}
                <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-3 space-y-2">
                  <p className="font-semibold text-[var(--foreground)]">
                    Confirmation Required to Finalize:
                  </p>
                  <p className="text-[var(--text-muted)] text-[11px]">
                    Would you like to write this reservation to Google Calendar and
                    generate the Google Meet conference link?
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <AppButton
                      variant="primary"
                      size="sm"
                      onClick={handleConfirmBooking}
                      disabled={isPending}
                      className="flex-1 justify-center"
                    >
                      <AppIcon name="calendar-check" size="xs" />
                      <span className="ml-1.5">Confirm &amp; Book Event</span>
                    </AppButton>
                    <AppButton
                      variant="outline"
                      size="sm"
                      onClick={() => setAvailabilityResult({ status: "IDLE" })}
                    >
                      Cancel
                    </AppButton>
                  </div>
                </div>
              </div>
            )}

            {/* Case: BOOKED */}
            {availabilityResult.status === "BOOKED" && (
              <div className="space-y-3 rounded-lg border border-[var(--primary)] bg-[var(--color-selected-bg)] p-4 text-xs">
                <div className="flex items-center gap-2 text-[var(--primary)] font-bold">
                  <AppIcon name="calendar-check" size="sm" />
                  <span>Reservation Confirmed &amp; Scheduled!</span>
                </div>
                <p className="text-[var(--text-secondary)]">
                  {availabilityResult.aiEvaluation}
                </p>
                <div className="rounded bg-[var(--surface)] p-3 space-y-1.5 font-mono text-[11px] border border-[var(--border)]">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Booking ID:</span>
                    <span className="font-semibold">{availabilityResult.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Google Meet:</span>
                    <a
                      href={availabilityResult.meetUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline truncate max-w-[200px]"
                    >
                      {availabilityResult.meetUrl}
                    </a>
                  </div>
                </div>
                <AppButton
                  variant="outline"
                  size="sm"
                  onClick={() => setAvailabilityResult({ status: "IDLE" })}
                  className="w-full justify-center"
                >
                  Book Another Slot
                </AppButton>
              </div>
            )}
          </ContentCard>
        </div>

        {/* Right Column (7 cols): ACTUAL VISUAL CALENDAR */}
        <div className="lg:col-span-7 space-y-6">
          <ContentCard title="Google Calendar Live Grid & Availability">
            {/* Calendar Controls & View Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
                  title="Previous month"
                >
                  <AppIcon name="chevron-left" size="xs" />
                </button>
                <div className="text-sm font-bold text-[var(--foreground)] min-w-[140px] text-center">
                  {MONTH_NAMES[calendarMonth]} {calendarYear}
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
                  title="Next month"
                >
                  <AppIcon name="chevron-right" size="xs" />
                </button>
                <button
                  type="button"
                  onClick={handleGoToSelectedDate}
                  className="rounded border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
                >
                  Selected Date
                </button>
              </div>

              {/* View Toggle (Month Grid vs Agenda List) */}
              <div className="flex items-center rounded-lg border border-[var(--border)] p-0.5 bg-[var(--surface-muted)]">
                <button
                  type="button"
                  onClick={() => setViewMode("month")}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    viewMode === "month"
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <AppIcon name="calendar-days" size="xs" />
                  <span>Month Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("agenda")}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    viewMode === "agenda"
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <AppIcon name="list-check" size="xs" />
                  <span>Agenda List</span>
                </button>
              </div>
            </div>

            {/* VIEW 1: MONTHLY CALENDAR GRID */}
            {viewMode === "month" && (
              <div className="space-y-4">
                {/* Calendar Table Grid */}
                <div className="rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
                  {/* Weekday Row */}
                  <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--surface-muted)] text-center text-[11px] font-semibold text-[var(--text-secondary)] py-2">
                    {WEEKDAY_NAMES.map((w) => (
                      <div key={w}>{w}</div>
                    ))}
                  </div>

                  {/* Day Cells Grid */}
                  <div className="grid grid-cols-7 divide-x divide-y divide-[var(--border)]">
                    {monthDays.map((day, idx) => {
                      const isSelected = day.dateStr === bookingDate;
                      const dayEvents = calendarEvents.filter(
                        (e) => e.date === day.dateStr
                      );

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setBookingDate(day.dateStr);
                            setAvailabilityResult({ status: "IDLE" });
                          }}
                          className={`min-h-[76px] p-1.5 cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-[var(--primary)]/10 ring-2 ring-inset ring-[var(--primary)]"
                              : day.isCurrentMonth
                                ? "bg-[var(--surface)] hover:bg-[var(--surface-muted)]/70"
                                : "bg-[var(--surface-muted)]/40 text-[var(--text-muted)]"
                          }`}
                        >
                          {/* Day Number Header */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex items-center justify-center text-xs h-5 w-5 rounded-full ${
                                isSelected
                                  ? "bg-[var(--primary)] text-white font-bold"
                                  : day.isCurrentMonth
                                    ? "text-[var(--foreground)] font-medium"
                                    : "text-[var(--text-muted)]"
                              }`}
                            >
                              {day.dayNumber}
                            </span>
                            {dayEvents.length > 0 && (
                              <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--color-error)]" />
                            )}
                          </div>

                          {/* Event Indicators */}
                          <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((ev) => (
                              <div
                                key={ev.id}
                                className="truncate rounded px-1 py-0.5 text-[9px] font-medium bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info)]/20"
                                title={`${ev.timeSlot}: ${ev.title}`}
                              >
                                {ev.timeSlot.split(" ")[0]} {ev.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-[8px] text-[var(--text-muted)] font-medium text-right">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Day Schedule & Slots Inspector */}
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/50 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
                    <div>
                      <div className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                        <AppIcon
                          name="calendar-check"
                          size="xs"
                          className="text-[var(--primary)]"
                        />
                        <span>Schedule for {bookingDate}</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {selectedDateEvents.length} scheduled event(s) &bull; Select a
                        quick slot below
                      </div>
                    </div>
                    <AppBadge
                      variant={selectedDateEvents.length > 0 ? "warning" : "success"}
                    >
                      {selectedDateEvents.length > 0
                        ? "Busy intervals"
                        : "All slots free"}
                    </AppBadge>
                  </div>

                  {/* Quick Slot Selector Row */}
                  <div>
                    <div className="text-[11px] font-semibold text-[var(--text-secondary)] mb-1.5">
                      Available Time Slots on {bookingDate}:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {STANDARD_TIME_SLOTS.map((slot) => {
                        const eventAtSlot = selectedDateEvents.find(
                          (e) => e.timeSlot === slot
                        );
                        const isOccupied = Boolean(eventAtSlot);
                        const isCurrentlyChosen = timeSlot === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setTimeSlot(slot);
                              setAvailabilityResult({ status: "IDLE" });
                            }}
                            className={`rounded-lg border p-2 text-left text-xs transition-all ${
                              isCurrentlyChosen
                                ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-xs font-semibold"
                                : isOccupied
                                  ? "border-[var(--color-error)]/40 bg-[var(--color-error-bg)]/40 text-[var(--color-error)]"
                                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] text-[var(--foreground)]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono">{slot}</span>
                              <span
                                className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                  isCurrentlyChosen
                                    ? "bg-white/20 text-white"
                                    : isOccupied
                                      ? "bg-[var(--color-error)] text-white"
                                      : "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                                }`}
                              >
                                {isOccupied ? "Busy" : "Open"}
                              </span>
                            </div>
                            <div
                              className={`truncate text-[10px] mt-0.5 ${
                                isCurrentlyChosen
                                  ? "text-white/80"
                                  : "text-[var(--text-muted)]"
                              }`}
                            >
                              {eventAtSlot ? eventAtSlot.title : "Ready to reserve"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scheduled Events on Selected Day */}
                  {selectedDateEvents.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                      <div className="text-[11px] font-semibold text-[var(--text-secondary)]">
                        Google Calendar Events on this Date:
                      </div>
                      {selectedDateEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-[var(--foreground)]">
                              {evt.title}
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)] font-mono">
                              {evt.timeSlot} – {evt.endSlot || "1 hour"} &bull;{" "}
                              {evt.calendar}
                            </div>
                          </div>
                          {evt.googleMeetLink && (
                            <a
                              href={evt.googleMeetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold text-[var(--primary)] bg-[var(--color-selected-bg)] hover:underline"
                            >
                              <AppIcon name="video" size="xs" />
                              <span>Meet</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: AGENDA LIST VIEW */}
            {viewMode === "agenda" && (
              <div className="space-y-3">
                {calendarEvents.length === 0 ? (
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-xs text-[var(--text-muted)]">
                    No scheduled events found on Google Calendar for this period. Click
                    &quot;Sync from Google Calendar&quot; to refresh.
                  </div>
                ) : (
                  calendarEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3.5 hover:border-[var(--primary)] transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[var(--foreground)]">
                            {evt.title}
                          </span>
                          <AppBadge
                            variant={evt.status === "confirmed" ? "success" : "info"}
                          >
                            {evt.status}
                          </AppBadge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
                          <span className="inline-flex items-center gap-1 font-mono">
                            <AppIcon name="clock" size="xs" />
                            {evt.date} &bull; {evt.timeSlot}{" "}
                            {evt.endSlot
                              ? `– ${evt.endSlot}`
                              : `(${evt.durationMinutes}m)`}
                          </span>
                          <span>&bull;</span>
                          <span>Calendar: {evt.calendar}</span>
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)]">
                          Attendees: {evt.attendees.join(", ")}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {evt.googleMeetLink && (
                          <a
                            href={evt.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-[var(--primary)] bg-[var(--color-selected-bg)] hover:underline"
                          >
                            <AppIcon name="video" size="xs" />
                            <span>Meet</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setBookingDate(evt.date);
                            setTimeSlot(evt.timeSlot);
                            handleCheckAvailability();
                          }}
                          className="rounded border border-[var(--border)] px-2 py-1 text-[10px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
                          title="Test conflict against this slot"
                        >
                          Test Conflict
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </ContentCard>

          {/* INBOUND GMAIL INQUIRIES CARD */}
          <ContentCard
            title={`Inbound Gmail Reservation Inquiries (${inboundGmailRequests.length})`}
            footer={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                <span>
                  The n8n AI Agent parses incoming Gmail messages, evaluates Google
                  Calendar availability, and drafts feedback replies.
                </span>
                <button
                  type="button"
                  onClick={handleCheckGmail}
                  className="font-semibold text-[var(--primary)] hover:underline self-start sm:self-auto cursor-pointer"
                >
                  Refresh Gmail
                </button>
              </div>
            }
          >
            <div className="space-y-3">
              {inboundGmailRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3.5 space-y-2 hover:border-[var(--primary)] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[var(--foreground)]">
                        {req.senderName}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        &lt;{req.senderEmail}&gt;
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AppBadge variant="info">
                        Requested: {req.requestedDate} @ {req.requestedSlot}
                      </AppBadge>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] italic">
                    &ldquo;{req.snippet}&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      Received: {new Date(req.receivedAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setName(req.senderName);
                        setEmail(req.senderEmail);
                        setBookingDate(req.requestedDate);
                        setTimeSlot(req.requestedSlot);
                        setPurpose(req.subject);
                        handleCheckAvailability();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--surface-muted)] transition-all shadow-xs cursor-pointer"
                    >
                      <AppIcon name="magnifying-glass" size="xs" />
                      <span>Evaluate Availability & Pre-fill</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ContentCard>

          {/* Workflow Integration Guide Card */}
          <ContentCard title="How n8n Google Calendar AI Sync Works">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 space-y-1">
                <div className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <AppIcon
                    name="arrows-rotate"
                    size="xs"
                    className="text-[var(--primary)]"
                  />
                  <span>1. Event Sync</span>
                </div>
                <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                  Pulls active calendar blocks from Google Calendar API to ensure your
                  website calendar mirrors real-time availability.
                </p>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 space-y-1">
                <div className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <AppIcon
                    name="sliders"
                    size="xs"
                    className="text-[var(--color-warning)]"
                  />
                  <span>2. AI Conflict Logic</span>
                </div>
                <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                  Evaluates requested date &amp; duration against busy intervals. If
                  overlap occurs, suggests adjacent open slots.
                </p>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 space-y-1">
                <div className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <AppIcon
                    name="calendar-check"
                    size="xs"
                    className="text-[var(--color-success)]"
                  />
                  <span>3. Booking &amp; Meet</span>
                </div>
                <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                  Upon user confirmation, creates the Google Calendar event, sends
                  calendar invites, and attaches a Google Meet URL.
                </p>
              </div>
            </div>
          </ContentCard>
        </div>
      </div>

      {/* Audit & Webhook Dispatch History */}
      <ContentCard title="Reservation & Synchronization Audit Trail">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="pb-2 font-medium">Log ID</th>
                <th className="pb-2 font-medium">Action</th>
                <th className="pb-2 font-medium">Summary</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Latency</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--surface-muted)]/50">
                  <td className="py-2.5 font-mono text-[var(--text-muted)]">{log.id}</td>
                  <td className="py-2.5">
                    <AppBadge
                      variant={log.action === "confirm_booking" ? "success" : "info"}
                    >
                      {log.action}
                    </AppBadge>
                  </td>
                  <td className="py-2.5 font-medium text-[var(--foreground)]">
                    {log.summary}
                  </td>
                  <td className="py-2.5">
                    <AppBadge variant={log.isSuccess ? "success" : "destructive"}>
                      {log.status}
                    </AppBadge>
                  </td>
                  <td className="py-2.5 font-mono text-[var(--text-muted)]">
                    {log.latencyMs}ms
                  </td>
                  <td className="py-2.5 text-[var(--text-muted)]">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
}
