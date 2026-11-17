"use client";

import * as React from "react";
import { useTransition } from "react";
import { PageHeading } from "@/components/shared/page-heading";
import { ContentCard } from "@/components/shared/content-card";
import { AppButton } from "@/components/ui/app-button";
import { AppBadge } from "@/components/ui/app-badge";
import { AppIcon } from "@/components/ui/app-icon";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { AppDialog } from "@/components/ui/app-dialog";
import {
  dispatchWebhookAction,
  DispatchWebhookResult,
} from "../automations/actions/dispatch-webhook.action";
import { createPickleballReservationAction } from "./actions/create-reservation.action";
import { createCheckoutSessionAction } from "./actions/create-checkout-session.action";
import { cancelPickleballReservationAction } from "./actions/cancel-reservation.action";
import { getPickleballReservationsAction } from "./actions/get-reservations.action";
import { StripeEmbeddedCheckout } from "./components/stripe-embedded-checkout";

export interface PickleballCourt {
  id: string;
  name: string;
  subtitle: string;
  surface: string;
  isIndoor: boolean;
  hasLights: boolean;
  status: "ACTIVE" | "MAINTENANCE";
}

export interface CourtReservation {
  id: string;
  publicId?: string;
  courtId: string;
  courtName: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  playerName: string;
  playerEmail: string;
  playerPhone?: string;
  matchType:
    "Doubles Match" | "Singles Match" | "Open Play" | "Private Coaching" | "Tournament";
  rentals?: string[];
  pinCode?: string;
  totalAmount?: number;
  paymentStatus?: "pending" | "paid" | "refunded";
  paymentMethod?: string;
  googleCalendarEventId?: string;
  googleCalendarLink?: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
}

export interface SuggestedAlternative {
  courtId: string;
  courtName: string;
  date: string;
  timeSlot: string;
  label: string;
}

export interface InboundCourtEmailRequest {
  id: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  snippet: string;
  requestedCourtId: string;
  requestedCourtName: string;
  requestedDate: string;
  requestedSlot: string;
  receivedAt: string;
}

export interface PickleballAuditLog {
  id: string;
  action:
    | "update_config"
    | "get_court_schedule"
    | "check_availability"
    | "book_court"
    | "cancel_court"
    | "check_gmail";
  summary: string;
  status: string;
  latencyMs: number;
  time: string;
  isSuccess: boolean;
}

// Baseline initial reservations will be initialized dynamically below after date helpers

// Available time options for facility configuration (24hr format)
const TIME_OPTIONS_24 = [
  { value: "05:00", label: "05:00 AM" },
  { value: "06:00", label: "06:00 AM" },
  { value: "07:00", label: "07:00 AM (Default)" },
  { value: "08:00", label: "08:00 AM" },
  { value: "09:00", label: "09:00 AM" },
  { value: "19:00", label: "07:00 PM" },
  { value: "20:00", label: "08:00 PM" },
  { value: "21:00", label: "09:00 PM" },
  { value: "22:00", label: "10:00 PM (Default)" },
  { value: "23:00", label: "11:00 PM" },
];

// Helper to convert minutes from midnight to 12hr lowercase like "9:00am"
function formatMinutesToAmPm(totalMins: number): string {
  let hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minsStr = mins === 0 ? "00" : String(mins).padStart(2, "0");
  return `${hours}:${minsStr}${ampm}`;
}

// Convert slot to clean range string e.g. "9:00am-10:00am" with duration label "1 Hour"
function formatSlotRange(
  startMins: number,
  durMinutes: number = 60
): {
  slotStr: string; // "9:00am-10:00am"
  displayRange: string; // "9:00am - 10:00am"
  durationLabel: string; // "1 Hour"
} {
  const startStr = formatMinutesToAmPm(startMins);
  const endStr = formatMinutesToAmPm(startMins + durMinutes);
  const durationLabel =
    durMinutes === 60
      ? "1 Hour"
      : durMinutes % 60 === 0
        ? `${durMinutes / 60} Hours`
        : `${durMinutes} mins`;
  return {
    slotStr: `${startStr}-${endStr}`,
    displayRange: `${startStr} - ${endStr}`,
    durationLabel,
  };
}

// Helper to convert "HH:mm" 24hr string to total minutes
function time24ToMinutes(t24: string): number {
  const parts = t24.split(":");
  return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
}

// Generate court objects based on court count
function generateCourts(count: number): PickleballCourt[] {
  const surfaces = ["Pro Cushion Acrylic", "Post-Tension Concrete", "SportCourt Pro"];
  const list: PickleballCourt[] = [];
  for (let i = 1; i <= count; i++) {
    list.push({
      id: `court_${i}`,
      name: `Court ${i}`,
      subtitle:
        i === 1
          ? "Championship Stadium Court (Lighted)"
          : i % 2 === 0
            ? "Covered Pavilion Court"
            : "Outdoor Tournament Court",
      surface: surfaces[(i - 1) % surfaces.length],
      isIndoor: i % 2 === 0,
      hasLights: true,
      status: "ACTIVE",
    });
  }
  return list;
}

// Generate slot strings between openTime and closeTime presented as "9:00am-10:00am (1 Hour)"
function generateOperatingSlots(
  openTime24: string,
  closeTime24: string,
  durationMinutes: number
): {
  slotStr: string;
  displayRange: string;
  durationLabel: string;
  startMinutes: number;
  endMinutes: number;
  isPeak: boolean;
}[] {
  const openMins = time24ToMinutes(openTime24);
  const closeMins = time24ToMinutes(closeTime24);
  const slots = [];

  for (let m = openMins; m + durationMinutes <= closeMins; m += durationMinutes) {
    const { slotStr, displayRange, durationLabel } = formatSlotRange(m, durationMinutes);
    slots.push({
      slotStr,
      displayRange,
      durationLabel,
      startMinutes: m,
      endMinutes: m + durationMinutes,
      isPeak: m >= 17 * 60 && m <= 21 * 60,
    });
  }
  return slots;
}

// Extract local YYYY-MM-DD from ISO or date string
function extractLocalDate(dateTimeStr: string): string {
  if (!dateTimeStr) return "";
  if (!dateTimeStr.includes("T")) return dateTimeStr.trim();
  const d = new Date(dateTimeStr);
  if (isNaN(d.getTime())) return dateTimeStr.split("T")[0];
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Parse start minutes from any time slot string ("9:00am-10:00am", "09:00 AM", "9:00am", "09:00")
function parseStartMinutes(tStr?: string): number | null {
  if (!tStr) return null;
  const clean = tStr.trim().toLowerCase();
  const firstPart = clean.split("-")[0].trim();
  const isPm = firstPart.includes("pm");
  const isAm = firstPart.includes("am");
  const nums = firstPart
    .replace(/(am|pm)/g, "")
    .trim()
    .split(":");
  let h = parseInt(nums[0], 10);
  if (isNaN(h)) return null;
  const m = parseInt(nums[1], 10) || 0;
  if (isPm && h < 12) h += 12;
  if (isAm && h === 12) h = 0;
  return h * 60 + m;
}

// Compare two time slots with tolerance for both range formats ("9:00am-10:00am") and point formats ("09:00 AM")
function isMatchingTimeSlot(bSlot?: string, targetSlot?: string): boolean {
  if (!bSlot || !targetSlot) return false;
  if (bSlot.trim().toLowerCase() === targetSlot.trim().toLowerCase()) return true;
  const bMins = parseStartMinutes(bSlot);
  const targetMins = parseStartMinutes(targetSlot);
  if (bMins !== null && targetMins !== null) {
    return bMins === targetMins;
  }
  return false;
}

// Format Date object to RFC 3339 ISO string with the local timezone offset (prevents 7am registering as 4pm)
function formatIsoWithOffset(d: Date): string {
  const pad = (num: number) => String(num).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  const offsetMinutes = -d.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = pad(Math.floor(absOffset / 60));
  const offsetMins = pad(absOffset % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMins}`;
}

// Compute explicit ISO range with the client's local timezone
function computeSlotIsoRange(
  dateStr: string,
  timeSlotStr: string,
  durationMinutes: number = 60
): { startIso: string; endIso: string; timeZone: string } {
  const timeZone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";
  const startMins = parseStartMinutes(timeSlotStr) ?? 540;
  const h = Math.floor(startMins / 60);
  const m = startMins % 60;
  const parts = dateStr.split("-").map(Number);
  const startDate = new Date(parts[0], parts[1] - 1, parts[2], h, m, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  return {
    startIso: formatIsoWithOffset(startDate),
    endIso: formatIsoWithOffset(endDate),
    timeZone,
  };
}

// Compare two court identifiers with tolerance for "court_1", "Court 1", "1", etc.
function isMatchingCourt(
  bCourtId?: string,
  bCourtName?: string,
  targetCourtId?: string,
  targetCourtName?: string
): boolean {
  if (!targetCourtId) return false;
  const targetIdClean = targetCourtId.toLowerCase().trim();
  const targetNameClean = targetCourtName?.toLowerCase().trim() || "";
  const bIdClean = (bCourtId || "").toLowerCase().trim();
  const bNameClean = (bCourtName || "").toLowerCase().trim();

  if (bIdClean && bIdClean === targetIdClean) return true;
  if (bNameClean && bNameClean === targetNameClean) return true;

  const targetDigits = targetIdClean.replace(/[^0-9]/g, "");
  const bCombined = `${bIdClean} ${bNameClean}`;
  const bMatch = bCombined.match(/court[\s_-]*([0-9]+)/i);
  const bDigits = bMatch ? bMatch[1] : bCombined.replace(/[^0-9]/g, "");

  if (targetDigits && bDigits && targetDigits === bDigits) return true;
  return false;
}

// Compare two dates robustly
function isMatchingDate(bDate?: string, targetDate?: string): boolean {
  if (!bDate || !targetDate) return false;
  const cleanBDate = bDate.includes("T") ? extractLocalDate(bDate) : bDate.trim();
  const cleanTargetDate = targetDate.includes("T")
    ? extractLocalDate(targetDate)
    : targetDate.trim();
  return cleanBDate === cleanTargetDate;
}

// Step date forward or backward without timezone offset drifts
function stepDay(dateStr: string, delta: number): string {
  const parts = dateStr.split("-").map((p) => parseInt(p, 10));
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2] + delta);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return dateStr;
}

// Get today's local date as "YYYY-MM-DD" based on the user's system clock
function getTodayLocalDate(dateObj: Date = new Date()): string {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Check if a time slot on a given date is in the past compared to the current clock time
function isSlotInPast(
  dateStr: string,
  timeSlotStr: string,
  now: Date = new Date(),
  isMounted: boolean = true
): boolean {
  if (!isMounted) return false;
  if (!dateStr || !timeSlotStr) return false;
  const todayStr = getTodayLocalDate(now);

  // If the date is earlier than today, the slot is entirely in the past
  if (dateStr < todayStr) {
    return true;
  }
  // If the date is in the future, the slot is open / upcoming
  if (dateStr > todayStr) {
    return false;
  }

  // If dateStr === todayStr, compare the start time in minutes against current clock minutes
  const startMins = parseStartMinutes(timeSlotStr);
  if (startMins === null) return false;

  const currentMins = now.getHours() * 60 + now.getMinutes();
  return startMins <= currentMins;
}

// Return the first upcoming open slot from operating slots for a given date
function getFirstUpcomingSlot(
  dateStr: string,
  slots: { slotStr: string }[],
  now: Date = new Date(),
  isMounted: boolean = true
): string {
  for (const s of slots) {
    if (!isSlotInPast(dateStr, s.slotStr, now, isMounted)) {
      return s.slotStr;
    }
  }
  return slots[0]?.slotStr || "9:00am-10:00am";
}

// Initial sample baseline reservations for today and tomorrow
function generateInitialReservations(
  baseDateStr: string = getTodayLocalDate()
): CourtReservation[] {
  const tomorrowStr = stepDay(baseDateStr, 1);
  return [
    {
      id: `PB-${baseDateStr.replace(/-/g, "")}-1011`,
      courtId: "court_1",
      courtName: "Court 1",
      date: baseDateStr,
      timeSlot: "9:00am-10:00am",
      durationMinutes: 60,
      playerName: "Sarah Chen",
      playerEmail: "sarah.chen@delta.local",
      matchType: "Doubles Match",
      pinCode: "5912",
      status: "CONFIRMED",
    },
    {
      id: `PB-${baseDateStr.replace(/-/g, "")}-1012`,
      courtId: "court_2",
      courtName: "Court 2",
      date: baseDateStr,
      timeSlot: "10:00am-11:00am",
      durationMinutes: 60,
      playerName: "Marcus Vance",
      playerEmail: "marcus.vance@delta.local",
      matchType: "Private Coaching",
      pinCode: "8241",
      status: "CONFIRMED",
    },
    {
      id: `PB-${baseDateStr.replace(/-/g, "")}-1013`,
      courtId: "court_1",
      courtName: "Court 1",
      date: baseDateStr,
      timeSlot: "5:00pm-6:00pm",
      durationMinutes: 60,
      playerName: "Elena Rostova",
      playerEmail: "elena.r@delta.local",
      matchType: "Singles Match",
      pinCode: "3184",
      status: "CONFIRMED",
    },
    {
      id: `PB-${baseDateStr.replace(/-/g, "")}-1014`,
      courtId: "court_3",
      courtName: "Court 3",
      date: baseDateStr,
      timeSlot: "6:00pm-7:00pm",
      durationMinutes: 60,
      playerName: "Delta Executive League",
      playerEmail: "league@delta.local",
      matchType: "Tournament",
      pinCode: "9041",
      status: "CONFIRMED",
    },
    {
      id: `PB-${tomorrowStr.replace(/-/g, "")}-1015`,
      courtId: "court_2",
      courtName: "Court 2",
      date: tomorrowStr,
      timeSlot: "9:00am-10:00am",
      durationMinutes: 60,
      playerName: "Jordan Reed",
      playerEmail: "jreed@delta.local",
      matchType: "Open Play",
      pinCode: "4321",
      status: "CONFIRMED",
    },
  ];
}

// Inbound email inquiries anchored dynamically to today and tomorrow
function generateInitialInboundEmails(
  baseDateStr: string = getTodayLocalDate()
): InboundCourtEmailRequest[] {
  const tomorrowStr = stepDay(baseDateStr, 1);
  return [
    {
      id: "pb_mail_01",
      subject: "Pickleball Doubles Court Reservation Request for Tomorrow",
      senderName: "Liam O'Connor",
      senderEmail: "liam.oc@pickleball-hub.org",
      snippet: `Hi Delta, Looking to reserve Court 2 for our doubles tournament warmup on ${tomorrowStr} from 10:00am-11:00am.`,
      requestedCourtId: "court_2",
      requestedCourtName: "Court 2",
      requestedDate: tomorrowStr,
      requestedSlot: "10:00am-11:00am",
      receivedAt: `${baseDateStr}T09:30:00.000Z`,
    },
    {
      id: "pb_mail_02",
      subject: "Evening Court Booking & Ball Machine Rental",
      senderName: "Maya Lin",
      senderEmail: "maya.lin@delta-sports.net",
      snippet: `Hello, can we book Court 3 or Court 4 for open play rally on ${baseDateStr} from 7:00pm-8:00pm?`,
      requestedCourtId: "court_3",
      requestedCourtName: "Court 3",
      requestedDate: baseDateStr,
      requestedSlot: "7:00pm-8:00pm",
      receivedAt: `${baseDateStr}T10:00:00.000Z`,
    },
  ];
}

// Deterministic baseline date for SSR hydration safety (anchored to 2026-11-17)
const SSR_BASELINE_DATE = "2026-11-17";

const INITIAL_RESERVATIONS: CourtReservation[] =
  generateInitialReservations(SSR_BASELINE_DATE);

const INITIAL_INBOUND_EMAILS: InboundCourtEmailRequest[] =
  generateInitialInboundEmails(SSR_BASELINE_DATE);

// Map Google Calendar event to CourtReservation schema
function mapGoogleEventToCourtReservation(
  ev: {
    id?: string;
    title?: string;
    summary?: string;
    date?: string;
    timeSlot?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    location?: string;
    description?: string;
    attendees?: unknown[];
    status?: string;
    htmlLink?: string;
  },
  fallbackDate: string
): CourtReservation {
  const title = ev.title || ev.summary || "Pickleball Reservation";
  const desc = ev.description || "";
  const loc = ev.location || "";
  const combined = `${title} ${loc} ${desc}`;

  // Court ID detection
  const courtMatch = combined.match(/court[\s_-]*([1-9]|1[0-2])\b/i);
  const courtNum = courtMatch ? courtMatch[1] : "1";
  const courtId = `court_${courtNum}`;
  const courtName = `Court ${courtNum}`;

  // Date detection
  let date = ev.date || fallbackDate;
  const rawStart = ev.start?.dateTime || ev.start?.date;
  if (rawStart) {
    date = extractLocalDate(rawStart);
  }

  // Time slot detection formatted as "9:00am-10:00am"
  let timeSlot = ev.timeSlot || "9:00am-10:00am";
  let durMinutes = 60;
  if (ev.start?.dateTime) {
    const raw = ev.start.dateTime;
    const timeMatch = raw.match(/T(\d{2}):(\d{2})/);
    if (timeMatch) {
      const h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      if (ev.end?.dateTime) {
        const endMatch = ev.end.dateTime.match(/T(\d{2}):(\d{2})/);
        if (endMatch) {
          const endH = parseInt(endMatch[1], 10);
          const endM = parseInt(endMatch[2], 10);
          durMinutes = endH * 60 + endM - (h * 60 + m);
          if (durMinutes <= 0) durMinutes = 60;
        }
      }
      const { slotStr } = formatSlotRange(h * 60 + m, durMinutes);
      timeSlot = slotStr;
    }
  }

  // Player name detection
  let playerName = "Pickleball Player";
  const nameMatch = title.match(/-\s*([^()]+?)(?:\s*\(|$)/);
  if (nameMatch) {
    playerName = nameMatch[1].trim();
  } else if (Array.isArray(ev.attendees) && ev.attendees.length > 0) {
    const firstAtt = ev.attendees[0];
    if (typeof firstAtt === "string") {
      playerName = firstAtt.split("@")[0];
    } else if (
      firstAtt &&
      typeof firstAtt === "object" &&
      "email" in firstAtt &&
      typeof (firstAtt as { email?: string }).email === "string"
    ) {
      playerName = (firstAtt as { email: string }).email.split("@")[0];
    }
  }

  // Match format detection
  let matchType: CourtReservation["matchType"] = "Doubles Match";
  if (/singles/i.test(combined)) matchType = "Singles Match";
  else if (/tournament/i.test(combined)) matchType = "Tournament";
  else if (/coaching|lesson|clinic/i.test(combined)) matchType = "Private Coaching";
  else if (/open play|rally/i.test(combined)) matchType = "Open Play";

  // PIN code detection
  const pinMatch = desc.match(/(?:PIN|code|pass)[\s:]*([0-9]{4})/i);
  const pinCode = pinMatch ? pinMatch[1] : undefined;

  return {
    id: ev.id || `gcal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    courtId,
    courtName,
    date,
    timeSlot,
    durationMinutes: durMinutes,
    playerName,
    playerEmail:
      Array.isArray(ev.attendees) && typeof ev.attendees[0] === "string"
        ? ev.attendees[0]
        : (ev.attendees?.[0] as { email?: string })?.email || "player@delta.local",
    matchType,
    pinCode,
    googleCalendarEventId: ev.id,
    googleCalendarLink: ev.htmlLink,
    status: "CONFIRMED",
  };
}

const emptySubscribe = () => () => {};

function useIsMounted(): boolean {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function useTodayLocalDate(): string {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => getTodayLocalDate(),
    () => SSR_BASELINE_DATE
  );
}

export default function PickleballReservationPage() {
  const [isPending, startTransition] = useTransition();

  // n8n Webhook Target
  const [webhookUrl, setWebhookUrl] = React.useState(
    "https://ozephyrmor.app.n8n.cloud/webhook/delta-pickleball-reservation"
  );

  // Facility Configuration State
  const [courtCount, setCourtCount] = React.useState<number>(4);
  const [openTime, setOpenTime] = React.useState<string>("07:00");
  const [closeTime, setCloseTime] = React.useState<string>("22:00");
  const [slotDuration, setSlotDuration] = React.useState<number>(60);
  const [showConfigPanel, setShowConfigPanel] = React.useState<boolean>(false);

  // Active Courts List & Schedule Matrix
  const courts = React.useMemo(() => generateCourts(courtCount), [courtCount]);
  const operatingSlots = React.useMemo(
    () => generateOperatingSlots(openTime, closeTime, slotDuration),
    [openTime, closeTime, slotDuration]
  );

  // Client mount state and local date via useSyncExternalStore to guarantee 100% SSR hydration conformity
  const isMounted = useIsMounted();
  const clientToday = useTodayLocalDate();

  // Selected Date for Schedule Matrix View
  const [userSelectedDate, setUserSelectedDate] = React.useState<string | null>(null);
  const selectedDate = userSelectedDate ?? clientToday;
  const setSelectedDate = React.useCallback(
    (dateOrUpdater: string | ((prev: string) => string)) => {
      setUserSelectedDate((prev) => {
        const current = prev ?? clientToday;
        return typeof dateOrUpdater === "function"
          ? dateOrUpdater(current)
          : dateOrUpdater;
      });
    },
    [clientToday]
  );
  const [viewMode, setViewMode] = React.useState<"matrix" | "agenda">("matrix");

  // Bookings List State
  const [reservations, setReservations] =
    React.useState<CourtReservation[]>(INITIAL_RESERVATIONS);

  // Inbound Court Gmail Requests State
  const [inboundCourtEmails, setInboundCourtEmails] =
    React.useState<InboundCourtEmailRequest[]>(INITIAL_INBOUND_EMAILS);

  // Booking Form State
  const [playerName, setPlayerName] = React.useState("Alex Rivera");
  const [playerEmail, setPlayerEmail] = React.useState("alex.rivera@delta.local");
  const [playerPhone, setPlayerPhone] = React.useState("+1 (555) 392-1084");
  const [selectedCourtId, setSelectedCourtId] = React.useState<string>("court_1");
  const [userBookingDate, setUserBookingDate] = React.useState<string | null>(null);
  const bookingDate = userBookingDate ?? selectedDate;
  const setBookingDate = React.useCallback(
    (dateOrUpdater: string | ((prev: string) => string)) => {
      setUserBookingDate((prev) => {
        const current = prev ?? selectedDate;
        return typeof dateOrUpdater === "function"
          ? dateOrUpdater(current)
          : dateOrUpdater;
      });
    },
    [selectedDate]
  );
  const [bookingTimeSlot, setBookingTimeSlot] = React.useState<string>("9:00am-10:00am");
  const [matchType, setMatchType] =
    React.useState<CourtReservation["matchType"]>("Doubles Match");
  const [rentalPaddles, setRentalPaddles] = React.useState<boolean>(false);
  const [rentalBallMachine, setRentalBallMachine] = React.useState<boolean>(false);

  // Holding Slot (Soft Lock - 10-minute hold to prevent race conditions)
  const [holdingSlot, setHoldingSlot] = React.useState<{
    courtId: string;
    timeSlot: string;
    date: string;
    expiresAt: number;
  } | null>(null);

  // Payment Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<
    "Credit Card" | "Apple Pay" | "Google Pay" | "Club Account"
  >("Credit Card");
  const [cardNumber, setCardNumber] = React.useState("•••• •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = React.useState("12/28");
  const [cardCvc, setCardCvc] = React.useState("888");

  // Stripe Embedded Checkout State
  const [stripeClientSecret, setStripeClientSecret] = React.useState<string | null>(null);
  const [isStripeLive, setIsStripeLive] = React.useState(false);
  const [isCreatingSession, setIsCreatingSession] = React.useState(false);
  const [stripeSessionError, setStripeSessionError] = React.useState<string | null>(null);
  const [stripePublishableKey, setStripePublishableKey] = React.useState<
    string | undefined
  >(undefined);

  // Cancellation State
  const [cancellingBooking, setCancellingBooking] =
    React.useState<CourtReservation | null>(null);
  const [cancellationReason, setCancellationReason] =
    React.useState("Scheduling conflict");
  const [cancellationAlert, setCancellationAlert] = React.useState<string | null>(null);

  // Hydrate persistent reservations from PostgreSQL on mount
  React.useEffect(() => {
    getPickleballReservationsAction({ date: selectedDate }).then((res) => {
      if (res.success && res.data.length > 0) {
        setReservations((prev) => {
          const merged = [...prev];
          for (const item of res.data) {
            const idx = merged.findIndex(
              (m) =>
                m.id === item.bookingReference ||
                m.id === item.id ||
                (m.date === item.date &&
                  m.courtId === item.courtId &&
                  isMatchingTimeSlot(m.timeSlot, item.timeSlot))
            );
            const mapped: CourtReservation = {
              id: item.bookingReference || item.id,
              publicId: item.publicId,
              courtId: item.courtId,
              courtName: item.courtName,
              date: item.date,
              timeSlot: item.timeSlot,
              durationMinutes: item.durationMinutes,
              playerName: item.playerName,
              playerEmail: item.playerEmail,
              playerPhone: item.playerPhone,
              matchType: item.matchType as CourtReservation["matchType"],
              rentals: item.rentals,
              pinCode: item.pinCode,
              totalAmount: item.totalAmount,
              paymentStatus: item.paymentStatus,
              paymentMethod: item.paymentMethod,
              googleCalendarEventId: item.googleCalendarEventId || undefined,
              googleCalendarLink: item.googleCalendarLink || undefined,
              status: item.status === "cancelled" ? "CANCELLED" : "CONFIRMED",
            };
            if (idx >= 0) {
              merged[idx] = mapped;
            } else {
              merged.push(mapped);
            }
          }
          return merged;
        });
      }
    });
  }, [selectedDate]);

  // AI Availability Check State
  const [availabilityResult, setAvailabilityResult] = React.useState<{
    status: "IDLE" | "AVAILABLE" | "CONFLICT" | "OUT_OF_BOUNDS" | "BOOKED";
    isAvailable?: boolean;
    courtName?: string;
    conflictReason?: string;
    conflictWith?: string;
    aiEvaluation?: string;
    suggestedAlternatives?: SuggestedAlternative[];
    pricing?: {
      rate: number;
      isPeak: boolean;
      total: number;
    };
    bookedPass?: {
      id: string;
      courtName: string;
      pinCode: string;
      digitalPassUrl: string;
      googleCalendarLink?: string;
    };
  }>({ status: "IDLE" });

  const [latestDispatchResult, setLatestDispatchResult] =
    React.useState<DispatchWebhookResult | null>(null);

  const [auditLogs, setAuditLogs] = React.useState<PickleballAuditLog[]>([
    {
      id: "pb_init_01",
      action: "get_court_schedule",
      summary: "Loaded 4 courts baseline and initial reservations",
      status: "Ready",
      latencyMs: 24,
      time: "Initial Baseline",
      isSuccess: true,
    },
  ]);

  // Selected Court Object
  const selectedCourt = React.useMemo(() => {
    return courts.find((c) => c.id === selectedCourtId) || courts[0];
  }, [courts, selectedCourtId]);

  // Bookings on Selected Date (active confirmed only)
  const dateBookings = React.useMemo(() => {
    return reservations.filter(
      (r) => isMatchingDate(r.date, selectedDate) && r.status !== "CANCELLED"
    );
  }, [reservations, selectedDate]);

  // Statistics
  const dailyCapacity = courts.length * operatingSlots.length;
  const bookedSlotsCount = dateBookings.length;
  const occupancyPercentage =
    dailyCapacity > 0 ? Math.round((bookedSlotsCount / dailyCapacity) * 100) : 0;

  // Handle Date Navigation
  const handlePrevDay = () => {
    const newDateStr = stepDay(selectedDate, -1);
    setSelectedDate(newDateStr);
    setBookingDate(newDateStr);
    if (isSlotInPast(newDateStr, bookingTimeSlot, new Date(), isMounted)) {
      setBookingTimeSlot(
        getFirstUpcomingSlot(newDateStr, operatingSlots, new Date(), isMounted)
      );
    }
  };

  const handleNextDay = () => {
    const newDateStr = stepDay(selectedDate, 1);
    setSelectedDate(newDateStr);
    setBookingDate(newDateStr);
    if (isSlotInPast(newDateStr, bookingTimeSlot, new Date(), isMounted)) {
      setBookingTimeSlot(
        getFirstUpcomingSlot(newDateStr, operatingSlots, new Date(), isMounted)
      );
    }
  };

  const handleToday = () => {
    const todayStr = getTodayLocalDate();
    setSelectedDate(todayStr);
    setBookingDate(todayStr);
    if (isSlotInPast(todayStr, bookingTimeSlot, new Date(), isMounted)) {
      setBookingTimeSlot(
        getFirstUpcomingSlot(todayStr, operatingSlots, new Date(), isMounted)
      );
    }
  };

  // Handle Slot Selection from Court Matrix (past slots are unclickable)
  const handleSelectSlot = (courtId: string, slotStr: string) => {
    if (isSlotInPast(selectedDate, slotStr, new Date(), isMounted)) {
      return;
    }
    setSelectedCourtId(courtId);
    setBookingTimeSlot(slotStr);
    setBookingDate(selectedDate);
    // Reset availability result so user can re-evaluate
    setAvailabilityResult({ status: "IDLE" });
  };

  // Dispatch Facility Config Update
  const handleSaveFacilityConfig = () => {
    startTransition(async () => {
      const payload = {
        action: "update_config",
        courtCount,
        openTime,
        closeTime,
        slotDurationMinutes: slotDuration,
      };

      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestDispatchResult(result);

      const newLog: PickleballAuditLog = {
        id: `pb_cfg_${Date.now().toString(36)}`,
        action: "update_config",
        summary: result.success
          ? `Updated facility: ${courtCount} courts, ${openTime} – ${closeTime}`
          : `Config update error: ${result.error || "Failed to reach n8n"}`,
        status: result.success ? `${result.status || 200} OK` : result.error || "Failed",
        latencyMs: result.latencyMs,
        time: new Date().toLocaleTimeString(),
        isSuccess: result.success,
      };

      setAuditLogs((prev) => [newLog, ...prev.slice(0, 9)]);
      setShowConfigPanel(false);
    });
  };

  // Dispatch Schedule Sync with Google Calendar integration
  const handleSyncSchedule = React.useCallback(() => {
    startTransition(async () => {
      const payload = {
        action: "get_court_schedule",
        date: selectedDate,
        courtCount,
        openTime,
        closeTime,
        existingBookings: reservations,
      };

      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestDispatchResult(result);

      if (
        result.success &&
        result.responseBody &&
        typeof result.responseBody === "object"
      ) {
        const body = result.responseBody as {
          bookings?: CourtReservation[];
          events?: Parameters<typeof mapGoogleEventToCourtReservation>[0][];
        };

        const incomingBookings: CourtReservation[] = [];

        // 1. Direct court reservations from n8n
        if (Array.isArray(body.bookings)) {
          incomingBookings.push(...body.bookings);
        }

        // 2. Raw Google Calendar events synced from calendar API
        if (Array.isArray(body.events)) {
          const mapped = body.events.map((ev) =>
            mapGoogleEventToCourtReservation(ev, selectedDate)
          );
          incomingBookings.push(...mapped);
        }

        if (incomingBookings.length > 0) {
          setReservations((prev) => {
            const merged = [...prev];
            for (const b of incomingBookings) {
              const idx = merged.findIndex(
                (m) =>
                  (b.id && m.id === b.id) ||
                  (isMatchingDate(m.date, b.date) &&
                    isMatchingCourt(m.courtId, m.courtName, b.courtId, b.courtName) &&
                    isMatchingTimeSlot(m.timeSlot, b.timeSlot))
              );
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...b };
              } else {
                merged.unshift(b);
              }
            }
            return merged;
          });
        }
      }

      const newLog: PickleballAuditLog = {
        id: `pb_sync_${Date.now().toString(36)}`,
        action: "get_court_schedule",
        summary: result.success
          ? `Synchronized schedule with Google Calendar for ${selectedDate}`
          : `Sync error: ${result.error || "Failed to reach n8n"}`,
        status: result.success ? `${result.status || 200} OK` : result.error || "Failed",
        latencyMs: result.latencyMs,
        time: new Date().toLocaleTimeString(),
        isSuccess: result.success,
      };

      setAuditLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    });
  }, [selectedDate, courtCount, openTime, closeTime, reservations, webhookUrl]);

  // Check Gmail for inbound pickleball court inquiries
  const handleCheckCourtGmail = () => {
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
          inboundCourtRequests?: InboundCourtEmailRequest[];
        };
        if (
          Array.isArray(body.inboundCourtRequests) &&
          body.inboundCourtRequests.length > 0
        ) {
          setInboundCourtEmails(body.inboundCourtRequests);
        }
      }

      const reqCount =
        result.success &&
        result.responseBody &&
        typeof result.responseBody === "object" &&
        Array.isArray(
          (result.responseBody as { inboundCourtRequests?: unknown[] })
            .inboundCourtRequests
        )
          ? (
              result.responseBody as {
                inboundCourtRequests: unknown[];
              }
            ).inboundCourtRequests.length
          : null;

      const newLog: PickleballAuditLog = {
        id: `pb_gmail_${Date.now().toString(36)}`,
        action: "check_gmail",
        summary:
          reqCount !== null
            ? `Checked Gmail: Found ${reqCount} inbound court inquiry email${reqCount === 1 ? "" : "s"}`
            : result.success
              ? "Queried Gmail for pickleball court booking requests via n8n"
              : `Gmail query failed: ${result.error || "Webhook error"}`,
        status: result.success ? `${result.status || 200} OK` : result.error || "Failed",
        latencyMs: result.latencyMs,
        time: new Date().toLocaleTimeString(),
        isSuccess: result.success,
      };

      setAuditLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    });
  };

  // Dispatch AI Court Availability Check
  const handleCheckCourtAvailability = (
    overrideDate?: unknown,
    overrideSlot?: string,
    overrideCourtId?: string
  ) => {
    startTransition(async () => {
      const targetDate = typeof overrideDate === "string" ? overrideDate : bookingDate;
      const targetSlot =
        typeof overrideSlot === "string" ? overrideSlot : bookingTimeSlot;
      const targetCourtId =
        typeof overrideCourtId === "string" ? overrideCourtId : selectedCourtId;
      const targetCourt = courts.find((c) => c.id === targetCourtId) || selectedCourt;

      // Guard against past dates (earlier than today)
      if (targetDate < getTodayLocalDate()) {
        setAvailabilityResult({
          status: "OUT_OF_BOUNDS",
          isAvailable: false,
          courtName: targetCourt.name,
          conflictReason: "This date has already passed.",
          aiEvaluation:
            "Past dates cannot be booked retroactively. Please select today or an upcoming date.",
          suggestedAlternatives: [],
        });
        return;
      }

      const rentalsList: string[] = [];
      if (rentalPaddles) rentalsList.push("Carbon Pro Paddle (Pair)");
      if (rentalBallMachine) rentalsList.push("Lobster Ball Machine");

      const payload = {
        action: "check_availability",
        courtId: targetCourtId,
        courtName: targetCourt.name,
        date: targetDate,
        timeSlot: targetSlot,
        durationMinutes: slotDuration,
        courtCount,
        openTime,
        closeTime,
        playerName,
        playerEmail,
        playerPhone,
        matchType,
        rentals: rentalsList,
        existingBookings: reservations,
      };

      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestDispatchResult(result);

      if (
        result.success &&
        result.responseBody &&
        typeof result.responseBody === "object"
      ) {
        const body = result.responseBody as {
          status?: "AVAILABLE" | "CONFLICT" | "OUT_OF_BOUNDS";
          isAvailable?: boolean;
          courtName?: string;
          conflictWith?: string;
          reason?: string;
          aiEvaluation?: string;
          suggestedAlternatives?: SuggestedAlternative[];
          pricing?: {
            courtRatePerHour: number;
            isPeakHour: boolean;
            estimatedTotal: number;
          };
        };

        if (body.status === "CONFLICT") {
          setAvailabilityResult({
            status: "CONFLICT",
            isAvailable: false,
            courtName: body.courtName || selectedCourt.name,
            conflictReason: body.reason || "Court already occupied",
            conflictWith: body.conflictWith,
            aiEvaluation:
              body.aiEvaluation ||
              "AI Court Inspector detected a schedule collision. Please review alternatives.",
            suggestedAlternatives: body.suggestedAlternatives || [],
          });
        } else if (body.status === "OUT_OF_BOUNDS") {
          setAvailabilityResult({
            status: "OUT_OF_BOUNDS",
            isAvailable: false,
            courtName: body.courtName || selectedCourt.name,
            conflictReason: body.reason || "Time slot outside facility hours",
            aiEvaluation:
              body.aiEvaluation ||
              `Facility operates between ${openTime} and ${closeTime}.`,
            suggestedAlternatives: body.suggestedAlternatives || [],
          });
        } else {
          setHoldingSlot({
            courtId: selectedCourtId,
            timeSlot: bookingTimeSlot,
            date: bookingDate,
            expiresAt: Date.now() + 10 * 60 * 1000,
          });
          setAvailabilityResult({
            status: "AVAILABLE",
            isAvailable: true,
            courtName: body.courtName || selectedCourt.name,
            aiEvaluation:
              body.aiEvaluation ||
              `Court ${selectedCourt.name} is 100% available at ${bookingTimeSlot}. 10-minute hold placed for checkout.`,
            pricing: body.pricing
              ? {
                  rate: body.pricing.courtRatePerHour,
                  isPeak: body.pricing.isPeakHour,
                  total: body.pricing.estimatedTotal,
                }
              : {
                  rate: 25,
                  isPeak: false,
                  total: 25,
                },
          });
        }
      } else {
        // Fallback local evaluation if n8n is offline or unreachable
        const localCollision = reservations.find(
          (r) =>
            isMatchingDate(r.date, bookingDate) &&
            isMatchingCourt(
              r.courtId,
              r.courtName,
              selectedCourtId,
              selectedCourt.name
            ) &&
            isMatchingTimeSlot(r.timeSlot, bookingTimeSlot) &&
            r.status !== "CANCELLED"
        );

        if (localCollision) {
          // Find alternative courts
          const altCourts: SuggestedAlternative[] = courts
            .filter((c) => c.id !== selectedCourtId)
            .map((c) => ({
              courtId: c.id,
              courtName: c.name,
              date: bookingDate,
              timeSlot: bookingTimeSlot,
              label: `${bookingDate} at ${bookingTimeSlot} on ${c.name} (Alternate Court)`,
            }));

          setAvailabilityResult({
            status: "CONFLICT",
            isAvailable: false,
            courtName: selectedCourt.name,
            conflictReason: `Local detector: ${selectedCourt.name} is occupied by ${localCollision.playerName} (${localCollision.matchType})`,
            conflictWith: localCollision.playerName,
            aiEvaluation: `Schedule conflict detected locally. ${altCourts.length} alternative courts available at this hour.`,
            suggestedAlternatives: altCourts,
          });
        } else {
          setHoldingSlot({
            courtId: selectedCourtId,
            timeSlot: bookingTimeSlot,
            date: bookingDate,
            expiresAt: Date.now() + 10 * 60 * 1000,
          });
          setAvailabilityResult({
            status: "AVAILABLE",
            isAvailable: true,
            courtName: selectedCourt.name,
            aiEvaluation: `Court ${selectedCourt.name} is verified open on ${bookingDate} at ${bookingTimeSlot}. 10-minute hold placed for checkout.`,
            pricing: {
              rate: 25,
              isPeak: false,
              total: 25,
            },
          });
        }
      }

      const newLog: PickleballAuditLog = {
        id: `pb_chk_${Date.now().toString(36)}`,
        action: "check_availability",
        summary: `Checked availability: ${selectedCourt.name} @ ${bookingDate} ${bookingTimeSlot}`,
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

  // Open Stripe Checkout Modal and initialize embedded session
  const handleOpenCheckoutModal = () => {
    setIsCheckoutModalOpen(true);
    setIsCreatingSession(true);
    setStripeSessionError(null);
    setStripeClientSecret(null);

    const rentalsList: string[] = [];
    if (rentalPaddles) rentalsList.push("Carbon Pro Paddle (Pair)");
    if (rentalBallMachine) rentalsList.push("Lobster Ball Machine");

    const { startIso, endIso, timeZone } = computeSlotIsoRange(
      bookingDate,
      bookingTimeSlot,
      slotDuration
    );

    createCheckoutSessionAction({
      courtId: selectedCourtId,
      courtName: selectedCourt.name,
      date: bookingDate,
      timeSlot: bookingTimeSlot,
      durationMinutes: slotDuration,
      startIso,
      endIso,
      timeZone,
      playerName,
      playerEmail,
      playerPhone,
      matchType,
      rentals: rentalsList,
    })
      .then((res) => {
        if (res.success) {
          setIsStripeLive(res.data.isStripeLive);
          if (res.data.clientSecret) {
            setStripeClientSecret(res.data.clientSecret);
          }
          if (res.data.publishableKey) {
            setStripePublishableKey(res.data.publishableKey);
          }
        } else {
          setStripeSessionError(res.error.message);
        }
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to initialize payment session";
        setStripeSessionError(msg);
      })
      .finally(() => {
        setIsCreatingSession(false);
      });
  };

  // Confirm and Finalize Court Booking
  const handleConfirmCourtBooking = () => {
    startTransition(async () => {
      const rentalsList: string[] = [];
      if (rentalPaddles) rentalsList.push("Carbon Pro Paddle (Pair)");
      if (rentalBallMachine) rentalsList.push("Lobster Ball Machine");

      const { startIso, endIso, timeZone } = computeSlotIsoRange(
        bookingDate,
        bookingTimeSlot,
        slotDuration
      );

      const payload = {
        action: "book_court",
        courtId: selectedCourtId,
        courtName: selectedCourt.name,
        date: bookingDate,
        timeSlot: bookingTimeSlot,
        durationMinutes: slotDuration,
        startIso,
        endIso,
        timeZone,
        playerName,
        playerEmail,
        playerPhone,
        matchType,
        rentals: rentalsList,
        existingBookings: reservations,
      };

      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestDispatchResult(result);

      const generatedPin = String(Math.floor(1000 + Math.random() * 9000));
      const generatedId = `PB-${bookingDate.replace(/-/g, "")}-${generatedPin}`;

      // Clear soft hold and close checkout dialog
      setHoldingSlot(null);
      setIsCheckoutModalOpen(false);

      const isPeakHour = operatingSlots.find((s) =>
        isMatchingTimeSlot(s.slotStr, bookingTimeSlot)
      )?.isPeak;
      const baseCourtFee = isPeakHour ? 35 : 25;
      const rentalsFee = (rentalPaddles ? 10 : 0) + (rentalBallMachine ? 15 : 0);
      const computedTotal = baseCourtFee + rentalsFee;

      // Persist in PostgreSQL database via Server Action
      createPickleballReservationAction({
        courtId: selectedCourtId,
        courtName: selectedCourt.name,
        date: bookingDate,
        timeSlot: bookingTimeSlot,
        durationMinutes: slotDuration,
        startIso,
        endIso,
        timeZone,
        playerName,
        playerEmail,
        playerPhone,
        matchType,
        rentals: rentalsList,
        totalAmount: computedTotal,
        paymentMethod,
        webhookUrl,
        skipWebhook: true, // Prevent duplicate webhook dispatch to n8n and duplicate calendar event
      }).catch((err) => {
        console.warn("[PickleballReservation] Background DB action notice:", err);
      });

      if (
        result.success &&
        result.responseBody &&
        typeof result.responseBody === "object"
      ) {
        const body = result.responseBody as {
          bookingId?: string;
          accessCode?: string;
          booking?: CourtReservation;
          googleCalendarEventId?: string;
          googleCalendarLink?: string;
          receipt?: {
            court?: string;
            pinCode?: string;
            digitalPassUrl?: string;
            googleCalendarLink?: string;
          };
          message?: string;
        };

        const gcalLink =
          body.googleCalendarLink ||
          body.receipt?.googleCalendarLink ||
          `https://calendar.google.com/calendar/r/eventedit?text=Pickleball:+${encodeURIComponent(selectedCourt.name)}`;

        const finalBooking: CourtReservation = body.booking || {
          id: body.bookingId || generatedId,
          courtId: selectedCourtId,
          courtName: selectedCourt.name,
          date: bookingDate,
          timeSlot: bookingTimeSlot,
          durationMinutes: slotDuration,
          playerName,
          playerEmail,
          playerPhone,
          matchType,
          rentals: rentalsList,
          pinCode: body.accessCode || generatedPin,
          totalAmount: computedTotal,
          paymentStatus: "paid",
          paymentMethod,
          googleCalendarEventId: body.googleCalendarEventId,
          googleCalendarLink: gcalLink,
          status: "CONFIRMED",
        };

        // Always synchronize selectedDate to the booked date so it immediately renders on matrix
        setSelectedDate(finalBooking.date);

        setReservations((prev) => {
          const filtered = prev.filter(
            (r) =>
              !(
                isMatchingDate(r.date, finalBooking.date) &&
                isMatchingCourt(
                  r.courtId,
                  r.courtName,
                  finalBooking.courtId,
                  finalBooking.courtName
                ) &&
                isMatchingTimeSlot(r.timeSlot, finalBooking.timeSlot)
              )
          );
          return [finalBooking, ...filtered];
        });

        setAvailabilityResult({
          status: "BOOKED",
          bookedPass: {
            id: finalBooking.id,
            courtName: finalBooking.courtName,
            pinCode: finalBooking.pinCode || generatedPin,
            digitalPassUrl: `https://delta.local/pickleball/pass/${finalBooking.id}`,
            googleCalendarLink: gcalLink,
          },
          aiEvaluation:
            body.message ||
            `Payment confirmed ($${computedTotal}.00 via ${paymentMethod}). Court reserved for ${playerName} on ${selectedCourt.name}. Scheduled on Google Calendar. Access PIN generated.`,
        });
      } else {
        // Fallback local booking
        const fallbackGcalLink = `https://calendar.google.com/calendar/r/eventedit?text=Pickleball:+${encodeURIComponent(selectedCourt.name)}+-+${encodeURIComponent(matchType)}`;
        const fallbackBooking: CourtReservation = {
          id: generatedId,
          courtId: selectedCourtId,
          courtName: selectedCourt.name,
          date: bookingDate,
          timeSlot: bookingTimeSlot,
          durationMinutes: slotDuration,
          playerName,
          playerEmail,
          playerPhone,
          matchType,
          rentals: rentalsList,
          pinCode: generatedPin,
          totalAmount: computedTotal,
          paymentStatus: "paid",
          paymentMethod,
          googleCalendarLink: fallbackGcalLink,
          status: "CONFIRMED",
        };

        // Always synchronize selectedDate to the booked date so it immediately renders on matrix
        setSelectedDate(fallbackBooking.date);

        setReservations((prev) => {
          const filtered = prev.filter(
            (r) =>
              !(
                isMatchingDate(r.date, fallbackBooking.date) &&
                isMatchingCourt(
                  r.courtId,
                  r.courtName,
                  fallbackBooking.courtId,
                  fallbackBooking.courtName
                ) &&
                isMatchingTimeSlot(r.timeSlot, fallbackBooking.timeSlot)
              )
          );
          return [fallbackBooking, ...filtered];
        });

        setAvailabilityResult({
          status: "BOOKED",
          bookedPass: {
            id: generatedId,
            courtName: selectedCourt.name,
            pinCode: generatedPin,
            digitalPassUrl: `https://delta.local/pickleball/pass/${generatedId}`,
            googleCalendarLink: fallbackGcalLink,
          },
          aiEvaluation: `Payment confirmed ($${computedTotal}.00 via ${paymentMethod})! PIN ${generatedPin} assigned for ${selectedCourt.name}. Scheduled on Google Calendar.`,
        });
      }

      const newLog: PickleballAuditLog = {
        id: `pb_book_${Date.now().toString(36)}`,
        action: "book_court",
        summary: `Payment confirmed: Booked ${selectedCourt.name} for ${playerName} (${bookingTimeSlot}, $${computedTotal}.00 via ${paymentMethod})`,
        status: result.success
          ? `${result.status || 200} OK`
          : result.error || "Confirmed",
        latencyMs: result.latencyMs,
        time: new Date().toLocaleTimeString(),
        isSuccess: result.success,
      };

      setAuditLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    });
  };

  // Handle Cancellation of a Reservation
  const handleConfirmCancellation = () => {
    if (!cancellingBooking) return;
    const target = cancellingBooking;

    startTransition(async () => {
      const cancelResult = await cancelPickleballReservationAction({
        bookingReference: target.id,
        publicId: target.publicId,
        date: target.date,
        courtId: target.courtId,
        timeSlot: target.timeSlot,
        googleCalendarEventId: target.googleCalendarEventId,
        reason: cancellationReason,
        webhookUrl,
      });

      if (cancelResult.success) {
        if (cancelResult.data.dispatchResult) {
          setLatestDispatchResult(cancelResult.data.dispatchResult);
        }

        // Update local state to cancelled (so matrix slot becomes Open immediately)
        setReservations((prev) =>
          prev.map((r) =>
            r.id === target.id ||
            (isMatchingDate(r.date, target.date) &&
              isMatchingCourt(r.courtId, r.courtName, target.courtId, target.courtName) &&
              isMatchingTimeSlot(r.timeSlot, target.timeSlot))
              ? { ...r, status: "CANCELLED" as const, paymentStatus: "refunded" as const }
              : r
          )
        );

        if (availabilityResult.bookedPass?.id === target.id) {
          setAvailabilityResult({ status: "IDLE" });
        }

        const refundAmt = `$${target.totalAmount || 25}.00`;
        setCancellationAlert(
          `Reservation ${target.id} was successfully cancelled. 100% refund (${refundAmt}) credited to ${target.paymentMethod || "Credit Card"}. Access PIN ${target.pinCode || ""} revoked.`
        );

        const newLog: PickleballAuditLog = {
          id: `pb_cnc_${Date.now().toString(36)}`,
          action: "cancel_court",
          summary: `Cancelled reservation ${target.id} on ${target.courtName} (${target.timeSlot}). Refund: ${refundAmt}.`,
          status: "200 Cancelled",
          latencyMs: cancelResult.data.dispatchResult?.latencyMs || 25,
          time: new Date().toLocaleTimeString(),
          isSuccess: true,
        };
        setAuditLogs((prev) => [newLog, ...prev.slice(0, 9)]);
      }

      setCancellingBooking(null);
    });
  };

  // Handle Rescheduling a Reservation
  const handleReschedule = (res: CourtReservation) => {
    setSelectedCourtId(res.courtId);
    setBookingDate(res.date);
    setSelectedDate(res.date);
    if (isSlotInPast(res.date, res.timeSlot, new Date(), isMounted)) {
      setBookingTimeSlot(
        getFirstUpcomingSlot(res.date, operatingSlots, new Date(), isMounted)
      );
    } else {
      setBookingTimeSlot(res.timeSlot);
    }
    setPlayerName(res.playerName);
    setPlayerEmail(res.playerEmail);
    if (res.playerPhone) setPlayerPhone(res.playerPhone);
    setMatchType(res.matchType);
    setViewMode("matrix");
    setAvailabilityResult({ status: "IDLE" });
  };

  // Compute checkout breakdown
  const isSelectedSlotPeak = operatingSlots.find((s) =>
    isMatchingTimeSlot(s.slotStr, bookingTimeSlot)
  )?.isPeak;
  const courtBaseFee = isSelectedSlotPeak ? 35 : 25;
  const rentalsCost = (rentalPaddles ? 10 : 0) + (rentalBallMachine ? 15 : 0);
  const checkoutTotal = courtBaseFee + rentalsCost;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeading
        title="Pickleball Court Reservation & Facility Manager"
        subtitle="Configure courts, operating hours, schedule matches, and dispatch bookings to n8n AI agent"
      >
        <div className="flex flex-wrap items-center gap-2">
          <AppButton
            variant="outline"
            size="sm"
            onClick={() => setShowConfigPanel((prev) => !prev)}
            aria-label="Toggle Facility Configuration"
          >
            <AppIcon name="sliders" size="xs" />
            <span>Facility Settings</span>
          </AppButton>
          <AppButton
            variant="outline"
            size="sm"
            onClick={handleCheckCourtGmail}
            disabled={isPending}
            aria-label="Check Gmail for Court Requests"
          >
            <AppIcon name="envelope" size="xs" />
            <span>Check Gmail Requests</span>
          </AppButton>
          <AppButton
            variant="primary"
            size="sm"
            onClick={handleSyncSchedule}
            disabled={isPending}
            aria-label="Sync Court Schedule"
          >
            <AppIcon
              name="arrows-rotate"
              size="xs"
              className={isPending ? "animate-spin" : ""}
            />
            <span>{isPending ? "Syncing..." : "Sync Schedule"}</span>
          </AppButton>
        </div>
      </PageHeading>

      {/* METRICS DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ContentCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)]">
                Active Courts
              </p>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mt-1">
                {courts.length} Courts
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Championship, Pavilion & Tournament
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--primary)] border border-[var(--border)]">
              <AppIcon name="table-tennis-paddle-ball" size="md" />
            </div>
          </div>
        </ContentCard>

        <ContentCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)]">
                Operating Hours
              </p>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mt-1">
                {openTime} – {closeTime}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {operatingSlots.length} slots / court ({slotDuration}m blocks)
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--primary)] border border-[var(--border)]">
              <AppIcon name="clock" size="md" />
            </div>
          </div>
        </ContentCard>

        <ContentCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p
                suppressHydrationWarning
                className="text-xs font-medium text-[var(--text-muted)]"
              >
                Bookings for {selectedDate}
              </p>
              <h3
                suppressHydrationWarning
                className="text-2xl font-bold text-[var(--foreground)] mt-1"
              >
                {bookedSlotsCount} Confirmed
              </h3>
              <p
                suppressHydrationWarning
                className="text-[11px] text-[var(--text-secondary)] mt-0.5"
              >
                {dailyCapacity - bookedSlotsCount} open slots remaining
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--primary)] border border-[var(--border)]">
              <AppIcon name="calendar-check" size="md" />
            </div>
          </div>
        </ContentCard>

        <ContentCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)]">
                Facility Occupancy
              </p>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mt-1">
                {occupancyPercentage}%
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Capacity: {dailyCapacity} total match slots
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--primary)] border border-[var(--border)]">
              <AppIcon name="chart-pie" size="md" />
            </div>
          </div>
        </ContentCard>
      </div>

      {/* FACILITY CONFIGURATION DRAWER / PANEL (Collapsible) */}
      {showConfigPanel && (
        <ContentCard
          title="Facility Hours & Court Layout Configuration"
          className="border-2 border-[var(--primary)]/30 bg-[var(--surface)]"
        >
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-muted)]">
              Configure total active courts, daily opening and closing hours, and match
              slot duration. Changes update the interactive reservation matrix and sync to
              n8n.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {/* COURT COUNT */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <AppIcon name="table-tennis-paddle-ball" size="xs" />
                  <span>Number of Courts</span>
                </label>
                <AppSelect
                  value={String(courtCount)}
                  onChange={(e) => setCourtCount(parseInt(e.target.value, 10))}
                  aria-label="Select Number of Courts"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                    <option key={num} value={String(num)}>
                      {num} {num === 1 ? "Court" : "Courts"}
                    </option>
                  ))}
                </AppSelect>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Supports 1 to 12 competition courts
                </p>
              </div>

              {/* OPENING TIME */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <AppIcon name="clock" size="xs" />
                  <span>Facility Opening Time</span>
                </label>
                <AppSelect
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  aria-label="Select Facility Opening Time"
                >
                  {TIME_OPTIONS_24.slice(0, 5).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </AppSelect>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Courts open for morning play
                </p>
              </div>

              {/* CLOSING TIME */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <AppIcon name="moon" size="xs" />
                  <span>Facility Closing Time</span>
                </label>
                <AppSelect
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  aria-label="Select Facility Closing Time"
                >
                  {TIME_OPTIONS_24.slice(5).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </AppSelect>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Floodlights turn off at closing
                </p>
              </div>

              {/* SLOT DURATION */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <AppIcon name="stopwatch" size="xs" />
                  <span>Slot Duration</span>
                </label>
                <AppSelect
                  value={String(slotDuration)}
                  onChange={(e) => setSlotDuration(parseInt(e.target.value, 10))}
                  aria-label="Select Slot Duration"
                >
                  <option value="60">60 Minutes (Standard)</option>
                  <option value="90">90 Minutes (Extended Match)</option>
                </AppSelect>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Matrix grid row granularity
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <div className="text-xs text-[var(--text-muted)]">
                Configured:{" "}
                <strong className="text-[var(--foreground)]">{courtCount} Courts</strong>{" "}
                | Hours:{" "}
                <strong className="text-[var(--foreground)]">
                  {openTime} – {closeTime}
                </strong>{" "}
                ({operatingSlots.length} slots/day)
              </div>
              <div className="flex items-center gap-2">
                <AppButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfigPanel(false)}
                >
                  Cancel
                </AppButton>
                <AppButton
                  variant="primary"
                  size="sm"
                  onClick={handleSaveFacilityConfig}
                  disabled={isPending}
                >
                  <AppIcon name="check" size="xs" />
                  <span>Apply & Save Configuration</span>
                </AppButton>
              </div>
            </div>
          </div>
        </ContentCard>
      )}

      {/* DATE SELECTOR & VIEW CONTROLS */}
      <ContentCard className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* DATE CONTROLS */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <AppButton
              variant="outline"
              size="sm"
              onClick={handlePrevDay}
              aria-label="Previous Day"
            >
              <AppIcon name="chevron-left" size="xs" />
            </AppButton>
            <AppButton
              variant="outline"
              size="sm"
              onClick={handleToday}
              aria-label="Jump to Today"
            >
              Today
            </AppButton>
            <AppButton
              variant="outline"
              size="sm"
              onClick={handleNextDay}
              aria-label="Next Day"
            >
              <AppIcon name="chevron-right" size="xs" />
            </AppButton>
            <div className="relative">
              <AppInput
                suppressHydrationWarning
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setSelectedDate(newDate);
                  setBookingDate(newDate);
                  if (isSlotInPast(newDate, bookingTimeSlot, new Date(), isMounted)) {
                    setBookingTimeSlot(
                      getFirstUpcomingSlot(newDate, operatingSlots, new Date(), isMounted)
                    );
                  }
                }}
                className="w-40 font-mono text-xs py-1.5"
                aria-label="Select Date for Court Schedule"
              />
            </div>
            <span
              suppressHydrationWarning
              className="text-xs font-semibold text-[var(--foreground)] ml-1 flex items-center gap-1.5"
            >
              <span suppressHydrationWarning>
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {isMounted && selectedDate === getTodayLocalDate() && (
                <AppBadge variant="info" className="text-[10px] px-1.5 py-0 font-normal">
                  Today
                </AppBadge>
              )}
            </span>
          </div>

          {/* VIEW SWITCHER & SYNC BUTTON */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <AppButton
              variant="outline"
              size="sm"
              onClick={handleSyncSchedule}
              disabled={isPending}
              aria-label="Refresh & Sync Google Calendar"
              className="text-xs py-1"
            >
              <AppIcon
                name="arrows-rotate"
                size="xs"
                className={isPending ? "animate-spin" : ""}
              />
              <span>Sync Calendar</span>
            </AppButton>
            <div className="inline-flex rounded-lg border border-[var(--border)] p-1 bg-[var(--surface-muted)]">
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  viewMode === "matrix"
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <AppIcon name="table" size="xs" />
                <span>Court Matrix Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("agenda")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  viewMode === "agenda"
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <AppIcon name="list-check" size="xs" />
                <span>Confirmed Agenda ({dateBookings.length})</span>
              </button>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* VIEW 1: INTERACTIVE COURT MATRIX GRID */}
      {viewMode === "matrix" && (
        <ContentCard
          title={`Court Availability Matrix — ${selectedDate}`}
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>Available / Open Slot</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span>Reserved / Match Booked</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span>Selected for Booking</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border)]" />
                  <span className="text-[var(--text-muted)]">
                    Past / Concluded (Unavailable)
                  </span>
                </span>
              </div>
              <div>Click any open cell to auto-populate the reservation form below.</div>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                  <th className="p-3 font-semibold text-[var(--foreground)] w-28 whitespace-nowrap">
                    Time Slot
                  </th>
                  {courts.map((court) => (
                    <th
                      key={court.id}
                      className="p-3 font-semibold text-[var(--foreground)] min-w-[170px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <AppIcon name="table-tennis-paddle-ball" size="xs" />
                        <span className="font-bold">{court.name}</span>
                        {court.isIndoor && (
                          <AppBadge variant="info" className="text-[10px] px-1 py-0">
                            Covered
                          </AppBadge>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] font-normal mt-0.5">
                        {court.surface}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {operatingSlots.map((slot) => {
                  const isRowInPast = isSlotInPast(
                    selectedDate,
                    slot.slotStr,
                    new Date(),
                    isMounted
                  );
                  return (
                    <tr
                      key={slot.slotStr}
                      className={`transition-colors ${
                        isRowInPast
                          ? "bg-[var(--surface-muted)]/20 hover:bg-[var(--surface-muted)]/30"
                          : "hover:bg-[var(--surface-muted)]/50"
                      }`}
                    >
                      {/* TIME SLOT CELL */}
                      <td className="p-3 font-mono text-[11px] font-semibold text-[var(--foreground)] whitespace-nowrap bg-[var(--surface-muted)]/30">
                        <div className="flex items-center gap-1">
                          <AppIcon
                            name="clock"
                            size="xs"
                            className={
                              isRowInPast
                                ? "text-[var(--text-muted)] opacity-60"
                                : "text-[var(--text-muted)]"
                            }
                          />
                          <span
                            className={
                              isRowInPast
                                ? "text-[var(--text-muted)] line-through opacity-75"
                                : ""
                            }
                          >
                            {slot.slotStr}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] px-1 py-0.2 rounded font-sans font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]">
                            1 Hour
                          </span>
                          {isRowInPast ? (
                            <AppBadge
                              variant="outline"
                              className="text-[9px] px-1 py-0 font-sans opacity-80"
                            >
                              Past
                            </AppBadge>
                          ) : slot.isPeak ? (
                            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">
                              Peak ($35)
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* COURT CELLS */}
                      {courts.map((court) => {
                        const booking = dateBookings.find(
                          (b) =>
                            isMatchingCourt(
                              b.courtId,
                              b.courtName,
                              court.id,
                              court.name
                            ) && isMatchingTimeSlot(b.timeSlot, slot.slotStr)
                        );
                        const isSlotPast = isSlotInPast(
                          selectedDate,
                          slot.slotStr,
                          new Date(),
                          isMounted
                        );
                        const isSelected =
                          isMatchingCourt(
                            selectedCourtId,
                            selectedCourt.name,
                            court.id,
                            court.name
                          ) &&
                          isMatchingTimeSlot(bookingTimeSlot, slot.slotStr) &&
                          isMatchingDate(bookingDate, selectedDate);

                        if (booking) {
                          return (
                            <td key={court.id} className="p-2">
                              <div
                                className={`rounded-md border p-2.5 space-y-1 ${
                                  isSlotPast
                                    ? "border-[var(--border)] bg-[var(--surface-muted)]/70 opacity-75"
                                    : "border-blue-500/40 bg-blue-500/10"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className={`font-semibold text-[11px] truncate ${
                                      isSlotPast
                                        ? "text-[var(--text-muted)]"
                                        : "text-blue-900 dark:text-blue-200"
                                    }`}
                                  >
                                    {booking.playerName}
                                  </span>
                                  <AppBadge
                                    variant={isSlotPast ? "outline" : "info"}
                                    className="text-[9px] px-1 py-0"
                                  >
                                    {isSlotPast
                                      ? "Concluded"
                                      : booking.matchType.replace(" Match", "")}
                                  </AppBadge>
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)] flex items-center justify-between">
                                  <span>{booking.timeSlot} &bull; 1 Hour</span>
                                  {booking.pinCode ? (
                                    <span className="font-mono text-[9px] text-[var(--text-secondary)] flex items-center gap-1">
                                      <span>PIN: {booking.pinCode}</span>
                                      {isSlotPast && (
                                        <span className="text-[var(--text-muted)]">
                                          (Ended)
                                        </span>
                                      )}
                                    </span>
                                  ) : booking.googleCalendarEventId ||
                                    booking.googleCalendarLink ? (
                                    <span className="inline-flex items-center gap-1 font-mono text-[9px] text-blue-600 dark:text-blue-400">
                                      <AppIcon name="calendar-check" size="xs" />
                                      <span>Google Cal</span>
                                    </span>
                                  ) : isSlotPast ? (
                                    <span className="text-[9px] font-mono text-[var(--text-muted)]">
                                      Ended
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                          );
                        }

                        // Soft Lock Holding State
                        const isHeld =
                          holdingSlot &&
                          holdingSlot.expiresAt > Date.now() &&
                          isMatchingCourt(
                            holdingSlot.courtId,
                            "",
                            court.id,
                            court.name
                          ) &&
                          isMatchingTimeSlot(holdingSlot.timeSlot, slot.slotStr) &&
                          isMatchingDate(holdingSlot.date, selectedDate);

                        if (isSelected && (!isSlotPast || isHeld)) {
                          return (
                            <td key={court.id} className="p-2">
                              <div className="rounded-md border-2 border-emerald-500 bg-emerald-500/10 p-2.5 flex items-center justify-between shadow-xs">
                                <div>
                                  <span className="font-bold text-emerald-900 dark:text-emerald-200 text-[11px] flex items-center gap-1">
                                    <AppIcon name="circle-check" size="xs" />
                                    <span>Selected</span>
                                    {isHeld && (
                                      <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                                        {" "}
                                        • In Checkout
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)] block">
                                    {court.name} &bull; {slot.slotStr} &bull; 1 Hour
                                  </span>
                                </div>
                                <span className="font-mono font-semibold text-xs text-emerald-700 dark:text-emerald-300">
                                  {slot.isPeak ? "$35" : "$25"}
                                </span>
                              </div>
                            </td>
                          );
                        }

                        if (isHeld) {
                          return (
                            <td key={court.id} className="p-2">
                              <div className="rounded-md border border-amber-500/60 bg-amber-500/10 p-2.5 flex items-center justify-between shadow-xs">
                                <div>
                                  <span className="font-semibold text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-1">
                                    <AppIcon name="lock" size="xs" />
                                    <span>In Checkout</span>
                                  </span>
                                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-mono">
                                    10m Soft Hold
                                  </span>
                                </div>
                                <AppBadge
                                  variant="warning"
                                  className="text-[9px] px-1 py-0"
                                >
                                  Holding
                                </AppBadge>
                              </div>
                            </td>
                          );
                        }

                        // Past Open Slot: Strictly unclickable and visually indicated as unavailable
                        if (isSlotPast) {
                          return (
                            <td key={court.id} className="p-2">
                              <div
                                className="w-full rounded-md border border-dashed border-[var(--border)]/60 bg-[var(--surface-muted)]/30 p-2 text-left opacity-50 select-none cursor-not-allowed"
                                title={`${court.name} at ${slot.slotStr} has passed and is no longer available`}
                                aria-disabled="true"
                                data-testid={`past-slot-${court.id}-${slot.slotStr}`}
                              >
                                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                                  <span className="flex items-center gap-1 font-medium">
                                    <AppIcon name="ban" size="xs" />
                                    <span>Passed &bull; Unavailable</span>
                                  </span>
                                  <span className="font-mono text-[10px] line-through opacity-60">
                                    {slot.isPeak ? "$35" : "$25"}
                                  </span>
                                </div>
                              </div>
                            </td>
                          );
                        }

                        // Available Open Upcoming Slot
                        return (
                          <td key={court.id} className="p-2">
                            <button
                              type="button"
                              onClick={() => handleSelectSlot(court.id, slot.slotStr)}
                              className="w-full rounded-md border border-dashed border-[var(--border)] hover:border-emerald-500 hover:bg-emerald-500/5 p-2 text-left transition-all group cursor-pointer"
                              title={`Click to book ${court.name} at ${slot.slotStr}`}
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[var(--text-muted)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-medium">
                                  Open (1h)
                                </span>
                                <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                                  {slot.isPeak ? "$35" : "$25"}
                                </span>
                              </div>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ContentCard>
      )}

      {/* VIEW 2: CONFIRMED AGENDA LIST */}
      {viewMode === "agenda" && (
        <ContentCard title={`Confirmed Court Reservations — ${selectedDate}`}>
          <div className="space-y-3">
            {dateBookings.length === 0 ? (
              <div
                suppressHydrationWarning
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-xs text-[var(--text-muted)]"
              >
                No court bookings registered for {selectedDate}. All courts are currently
                open!
              </div>
            ) : (
              dateBookings.map((res) => (
                <div
                  key={res.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3.5 hover:border-[var(--primary)] transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[var(--foreground)]">
                        {res.playerName}
                      </span>
                      <AppBadge variant="success">Confirmed</AppBadge>
                      <AppBadge variant="outline">{res.matchType}</AppBadge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1 font-mono">
                        <AppIcon name="table-tennis-paddle-ball" size="xs" />
                        {res.courtName}
                      </span>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1 font-mono">
                        <AppIcon name="clock" size="xs" />
                        {res.date} &bull; {res.timeSlot} &bull; 1 Hour
                      </span>
                      <span>&bull;</span>
                      <span>Player Email: {res.playerEmail}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    {res.googleCalendarLink && (
                      <a
                        href={res.googleCalendarLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded bg-[var(--surface-muted)] px-2.5 py-1 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 border border-[var(--border)] hover:bg-[var(--surface)] transition-all"
                      >
                        <AppIcon name="calendar-check" size="xs" />
                        <span>Google Calendar</span>
                      </a>
                    )}
                    {res.pinCode && (
                      <span className="rounded bg-[var(--surface-muted)] px-2.5 py-1 font-mono text-xs font-bold text-[var(--primary)] border border-[var(--border)]">
                        PIN: {res.pinCode}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleReschedule(res)}
                      className="inline-flex items-center gap-1 rounded bg-[var(--surface-muted)] px-2 py-1 text-xs font-medium text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface)] transition-all cursor-pointer"
                      title="Reschedule court time"
                    >
                      <AppIcon name="arrows-rotate" size="xs" />
                      <span>Reschedule</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancellingBooking(res)}
                      className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all cursor-pointer"
                      title="Cancel reservation & process refund"
                    >
                      <AppIcon name="trash" size="xs" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ContentCard>
      )}

      {/* INBOUND GMAIL COURT INQUIRIES CARD */}
      <ContentCard
        title={`Inbound Gmail Court Inquiries (${inboundCourtEmails.length})`}
        footer={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
            <span>
              The n8n AI Agent parses incoming emails for court booking requests,
              evaluates active schedule collisions, and issues automated gate passes.
            </span>
            <button
              type="button"
              onClick={handleCheckCourtGmail}
              className="font-semibold text-[var(--primary)] hover:underline self-start sm:self-auto cursor-pointer"
            >
              Refresh Gmail
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          {inboundCourtEmails.map((req) => (
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
                    {req.requestedCourtName} &bull; {req.requestedDate} @{" "}
                    {req.requestedSlot} (1 Hour)
                  </AppBadge>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] italic">
                &ldquo;{req.snippet}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
                <span
                  suppressHydrationWarning
                  className="text-[10px] text-[var(--text-muted)] font-mono"
                >
                  Received: {new Date(req.receivedAt).toLocaleDateString("en-US")}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPlayerName(req.senderName);
                    setPlayerEmail(req.senderEmail);
                    setSelectedCourtId(req.requestedCourtId);
                    setBookingDate(req.requestedDate);
                    setSelectedDate(req.requestedDate);
                    setBookingTimeSlot(req.requestedSlot);
                    handleCheckCourtAvailability(
                      req.requestedDate,
                      req.requestedSlot,
                      req.requestedCourtId
                    );
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--surface-muted)] transition-all shadow-xs cursor-pointer"
                >
                  <AppIcon name="magnifying-glass" size="xs" />
                  <span>Evaluate Court Availability & Pre-fill</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </ContentCard>

      {/* TWO-COLUMN LAYOUT: BOOKING FORM + AI EVALUATOR & AUDIT DISPATCH CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMN 1: BOOKING FORM & AI AVAILABILITY EVALUATOR */}
        <div className="lg:col-span-7 space-y-4">
          <ContentCard title="Book a Pickleball Court">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* PLAYER NAME */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Player / Team Name
                  </label>
                  <AppInput
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                  />
                </div>

                {/* PLAYER EMAIL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Player Email
                  </label>
                  <AppInput
                    type="email"
                    value={playerEmail}
                    onChange={(e) => setPlayerEmail(e.target.value)}
                    placeholder="player@delta.local"
                  />
                </div>

                {/* PLAYER PHONE */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Mobile Phone (Gate PIN SMS)
                  </label>
                  <AppInput
                    type="tel"
                    value={playerPhone}
                    onChange={(e) => setPlayerPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* COURT SELECT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Court Selection
                  </label>
                  <AppSelect
                    aria-label="Court Selection"
                    value={selectedCourtId}
                    onChange={(e) => setSelectedCourtId(e.target.value)}
                  >
                    {courts.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name} ({court.surface})
                      </option>
                    ))}
                  </AppSelect>
                </div>

                {/* DATE SELECT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Date
                  </label>
                  <AppInput
                    type="date"
                    value={bookingDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setBookingDate(newDate);
                      setSelectedDate(newDate);
                      if (isSlotInPast(newDate, bookingTimeSlot, new Date(), isMounted)) {
                        setBookingTimeSlot(
                          getFirstUpcomingSlot(
                            newDate,
                            operatingSlots,
                            new Date(),
                            isMounted
                          )
                        );
                      }
                    }}
                  />
                </div>

                {/* TIME SLOT SELECT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Time Slot
                  </label>
                  <AppSelect
                    aria-label="Time Slot Selection"
                    value={bookingTimeSlot}
                    onChange={(e) => setBookingTimeSlot(e.target.value)}
                  >
                    {operatingSlots.map((slot) => {
                      const isPast = isSlotInPast(
                        bookingDate,
                        slot.slotStr,
                        new Date(),
                        isMounted
                      );
                      return (
                        <option
                          key={slot.slotStr}
                          value={slot.slotStr}
                          disabled={isPast}
                          className={isPast ? "text-[var(--text-muted)] opacity-50" : ""}
                        >
                          {slot.slotStr} (1 Hour) {slot.isPeak ? "(Peak $35)" : "($25)"}
                          {isPast ? " — (Past / Unavailable)" : ""}
                        </option>
                      );
                    })}
                  </AppSelect>
                </div>
              </div>

              {/* MATCH FORMAT & EQUIPMENT ADDONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Match Format
                  </label>
                  <AppSelect
                    value={matchType}
                    onChange={(e) =>
                      setMatchType(e.target.value as CourtReservation["matchType"])
                    }
                  >
                    <option value="Doubles Match">Doubles Match (4 Players)</option>
                    <option value="Singles Match">Singles Match (2 Players)</option>
                    <option value="Open Play">Open Play Rally</option>
                    <option value="Private Coaching">Private Coaching Clinic</option>
                    <option value="Tournament">Tournament Round</option>
                  </AppSelect>
                </div>

                {/* EQUIPMENT RENTALS */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Equipment Rentals
                  </label>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rentalPaddles}
                        onChange={(e) => setRentalPaddles(e.target.checked)}
                        className="rounded border-[var(--border)] text-[var(--primary)]"
                      />
                      <span>Pair of Carbon Pro Paddles (+$5)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rentalBallMachine}
                        onChange={(e) => setRentalBallMachine(e.target.checked)}
                        className="rounded border-[var(--border)] text-[var(--primary)]"
                      />
                      <span>Lobster Ball Machine (+$15)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="pt-2">
                <AppButton
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => handleCheckCourtAvailability()}
                  disabled={isPending}
                >
                  <AppIcon
                    name="magnifying-glass"
                    size="xs"
                    className={isPending ? "animate-spin" : ""}
                  />
                  <span>
                    {isPending
                      ? "Evaluating with AI Agent..."
                      : "Check Availability with AI Agent"}
                  </span>
                </AppButton>
              </div>

              {/* CANCELLATION SUCCESS NOTIFICATION */}
              {cancellationAlert && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-900 dark:text-emerald-200 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AppIcon
                      name="circle-check"
                      size="sm"
                      className="text-emerald-600 mt-0.5"
                    />
                    <span>{cancellationAlert}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCancellationAlert(null)}
                    className="text-sm font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* AI AGENT EVALUATION FEEDBACK */}
              {availabilityResult.status === "CONFLICT" && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 space-y-3">
                  <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                    <AppIcon
                      name="triangle-exclamation"
                      size="sm"
                      className="mt-0.5 text-amber-600"
                    />
                    <div>
                      <h4 className="text-xs font-bold">Schedule Conflict Detected</h4>
                      <p className="text-xs mt-0.5">
                        {availabilityResult.conflictReason}
                      </p>
                    </div>
                  </div>

                  {availabilityResult.aiEvaluation && (
                    <div className="rounded bg-[var(--surface)] p-2.5 text-xs text-[var(--foreground)] border border-[var(--border)]">
                      <p className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">
                        n8n AI Evaluation:
                      </p>
                      <p>{availabilityResult.aiEvaluation}</p>
                    </div>
                  )}

                  {/* AI SUGGESTED ALTERNATIVE COURTS */}
                  {availabilityResult.suggestedAlternatives &&
                    availabilityResult.suggestedAlternatives.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-semibold text-[var(--foreground)]">
                          Recommended Available Alternatives:
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {availabilityResult.suggestedAlternatives.map((alt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedCourtId(alt.courtId);
                                setBookingTimeSlot(alt.timeSlot);
                                setBookingDate(alt.date);
                                setSelectedDate(alt.date);
                                handleCheckCourtAvailability();
                              }}
                              className="text-left rounded border border-[var(--border)] bg-[var(--surface)] p-2 text-xs hover:border-[var(--primary)] hover:bg-[var(--surface-muted)] transition-all flex items-center justify-between cursor-pointer"
                            >
                              <span>{alt.label}</span>
                              <span className="font-semibold text-[var(--primary)] text-[11px]">
                                Switch & Check &rarr;
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {availabilityResult.status === "OUT_OF_BOUNDS" && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 space-y-2">
                  <div className="flex items-start gap-2 text-red-900 dark:text-red-200">
                    <AppIcon
                      name="circle-exclamation"
                      size="sm"
                      className="mt-0.5 text-red-600"
                    />
                    <div>
                      <h4 className="text-xs font-bold">Outside Operating Hours</h4>
                      <p className="text-xs mt-0.5">
                        {availabilityResult.conflictReason}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Facility operates strictly between {openTime} and {closeTime}. Please
                    select a time slot within these hours.
                  </p>
                </div>
              )}

              {availabilityResult.status === "AVAILABLE" && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                      <AppIcon
                        name="circle-check"
                        size="sm"
                        className="text-emerald-600"
                      />
                      <div>
                        <h4 className="text-xs font-bold">Court is 100% Available!</h4>
                        <p className="text-xs mt-0.5">
                          {selectedCourt.name} is open on {bookingDate} at{" "}
                          {bookingTimeSlot} (1 Hour)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-emerald-800 dark:text-emerald-300 block">
                        Total: ${checkoutTotal}.00
                      </span>
                      <AppBadge
                        variant="warning"
                        className="text-[9px] px-1.5 py-0 mt-0.5"
                      >
                        10m Soft Hold Active
                      </AppBadge>
                    </div>
                  </div>

                  {/* PAYMENT METHOD SELECTION */}
                  <div className="rounded bg-[var(--surface)] p-3 text-xs border border-[var(--border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--foreground)] text-[11px] uppercase tracking-wider">
                        Select Payment Method:
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        ${checkoutTotal}.00
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {(
                        [
                          "Credit Card",
                          "Apple Pay",
                          "Google Pay",
                          "Club Account",
                        ] as const
                      ).map((pm) => (
                        <button
                          key={pm}
                          type="button"
                          onClick={() => setPaymentMethod(pm)}
                          className={`rounded border p-2 text-xs font-medium text-center transition-all cursor-pointer ${
                            paymentMethod === pm
                              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-xs"
                              : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:bg-[var(--surface)]"
                          }`}
                        >
                          {pm}
                        </button>
                      ))}
                    </div>
                  </div>

                  {availabilityResult.aiEvaluation && (
                    <div className="rounded bg-[var(--surface)] p-2.5 text-xs text-[var(--foreground)] border border-[var(--border)]">
                      <p className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">
                        AI Availability Report:
                      </p>
                      <p>{availabilityResult.aiEvaluation}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <AppButton
                      variant="primary"
                      className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={handleConfirmCourtBooking}
                      disabled={isPending}
                    >
                      <AppIcon name="check" size="xs" />
                      <span>Confirm & Finalize Court Booking</span>
                    </AppButton>
                    <AppButton
                      variant="outline"
                      className="w-full sm:w-auto justify-center whitespace-nowrap"
                      onClick={handleOpenCheckoutModal}
                      disabled={isPending}
                    >
                      <AppIcon name="credit-card" size="xs" />
                      <span>Checkout Receipt</span>
                    </AppButton>
                  </div>
                </div>
              )}

              {availabilityResult.status === "BOOKED" &&
                availabilityResult.bookedPass && (
                  <div className="rounded-lg border-2 border-emerald-500 bg-emerald-500/10 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <AppIcon
                          name="circle-check"
                          size="sm"
                          className="text-emerald-600"
                        />
                        <span>Court Reserved Successfully!</span>
                      </span>
                      <AppBadge variant="success">Confirmed & Paid</AppBadge>
                    </div>

                    <div className="rounded-lg bg-[var(--surface)] p-3 border border-[var(--border)] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">
                          Booking Reference:
                        </span>
                        <span className="font-mono font-bold text-[var(--foreground)]">
                          {availabilityResult.bookedPass.id}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Assigned Court:</span>
                        <span className="font-bold text-[var(--foreground)]">
                          {availabilityResult.bookedPass.courtName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Time & Duration:</span>
                        <span className="font-semibold text-[var(--foreground)]">
                          {bookingDate} &bull; {bookingTimeSlot} (1 Hour)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Payment:</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          Paid (${checkoutTotal}.00 via {paymentMethod})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">
                          Gate / Court Access PIN:
                        </span>
                        <span className="font-mono font-extrabold text-sm text-[var(--primary)] bg-[var(--surface-muted)] px-2 py-0.5 rounded">
                          {availabilityResult.bookedPass.pinCode}
                        </span>
                      </div>
                      {availabilityResult.bookedPass.googleCalendarLink && (
                        <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
                          <span className="text-[var(--text-muted)]">
                            Calendar Entry:
                          </span>
                          <a
                            href={availabilityResult.bookedPass.googleCalendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
                          >
                            <AppIcon name="calendar-check" size="xs" />
                            <span>Google Calendar Synced</span>
                          </a>
                        </div>
                      )}

                      {/* ACTIONS: RESCHEDULE & CANCEL */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                        <button
                          type="button"
                          onClick={() => {
                            const found = reservations.find(
                              (r) => r.id === availabilityResult.bookedPass?.id
                            );
                            if (found) handleReschedule(found);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface)] transition-all cursor-pointer"
                        >
                          <AppIcon name="arrows-rotate" size="xs" />
                          <span>Reschedule</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const found = reservations.find(
                              (r) => r.id === availabilityResult.bookedPass?.id
                            );
                            if (found) setCancellingBooking(found);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all cursor-pointer"
                        >
                          <AppIcon name="trash" size="xs" />
                          <span>Cancel Booking</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)]">
                      A confirmation pass and PIN have been dispatched to {playerEmail}.
                      Present this PIN at Court Access Gate 2.
                    </p>
                  </div>
                )}
            </div>
          </ContentCard>
        </div>

        {/* COLUMN 2: WEBHOOK CONSOLE & AUDIT DISPATCH LOGS */}
        <div className="lg:col-span-5 space-y-4">
          {/* WEBHOOK CONFIG */}
          <ContentCard title="n8n Booking Webhook Integration">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">
                  Webhook Target URL
                </label>
                <AppInput
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://ozephyrmor.app.n8n.cloud/webhook/delta-pickleball-reservation"
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <AppBadge variant="info">Production Active</AppBadge>
                <span className="text-[11px] text-[var(--text-muted)]">
                  delta-pickleball-reservation
                </span>
              </div>

              {latestDispatchResult && (
                <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">
                      Last Dispatch Latency:
                    </span>
                    <span className="font-mono font-semibold text-[var(--foreground)]">
                      {latestDispatchResult.latencyMs}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">HTTP Status:</span>
                    <span
                      className={`font-mono font-bold ${
                        latestDispatchResult.success ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {latestDispatchResult.status ||
                        (latestDispatchResult.success ? "200 OK" : "Failed")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ContentCard>

          {/* AUDIT TRAIL LOGS */}
          <ContentCard title="Facility Dispatch Audit Trail">
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs hover:border-[var(--primary)] transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[var(--foreground)]">
                        {log.action}
                      </span>
                      <AppBadge variant={log.isSuccess ? "success" : "error"}>
                        {log.status}
                      </AppBadge>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[260px]">
                      {log.summary}
                    </p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-[var(--text-secondary)]">
                    <div>{log.latencyMs}ms</div>
                    <div>{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </ContentCard>

          {/* FACILITY RULES & INFO */}
          <ContentCard title="Court Policies & Guidelines">
            <div className="space-y-2 text-xs text-[var(--text-muted)]">
              <div className="flex items-start gap-2">
                <AppIcon
                  name="circle-info"
                  size="xs"
                  className="mt-0.5 text-[var(--primary)]"
                />
                <span>
                  <strong>Standard Duration:</strong> 60 or 90 minute match slots.
                  15-minute grace period before open slots are recycled.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AppIcon
                  name="clock"
                  size="xs"
                  className="mt-0.5 text-[var(--primary)]"
                />
                <span>
                  <strong>Peak Hours:</strong> 05:00 PM to 09:00 PM ($35/hr, includes
                  high-power LED floodlights). Morning & afternoon hours are $25/hr.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AppIcon
                  name="shield-halved"
                  size="xs"
                  className="mt-0.5 text-[var(--primary)]"
                />
                <span>
                  <strong>Access PIN:</strong> Digital pass PIN works on automated court
                  entry gates starting 10 minutes prior to scheduled start time.
                </span>
              </div>
            </div>
          </ContentCard>
        </div>
      </div>

      {/* CHECKOUT & PAYMENT MODAL */}
      <AppDialog
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <AppIcon name="credit-card" size="sm" className="text-[var(--primary)]" />
            <span>Court Reservation Checkout & Payment</span>
          </div>
        }
        description="Complete payment to secure your court reservation and receive your automated gate access PIN."
        footer={
          <div className="flex items-center justify-between w-full">
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => setIsCheckoutModalOpen(false)}
              disabled={isPending}
            >
              Back
            </AppButton>
            {!stripeClientSecret && (
              <AppButton
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={handleConfirmCourtBooking}
                disabled={isPending || isCreatingSession}
              >
                <AppIcon name="lock" size="xs" />
                <span>Confirm & Finalize Court Booking (${checkoutTotal}.00)</span>
              </AppButton>
            )}
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          {/* COMPACT SUMMARY & PRICING BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/70 p-2.5 space-y-1">
              <div className="flex items-center justify-between font-semibold text-[var(--foreground)]">
                <span className="truncate">{selectedCourt.name}</span>
                <AppBadge variant="info" className="text-[10px] py-0">
                  {matchType}
                </AppBadge>
              </div>
              <div className="text-[var(--text-muted)] flex items-center gap-1.5 text-[11px]">
                <AppIcon name="clock" size="xs" />
                <span>
                  {bookingDate} &bull; {bookingTimeSlot}
                </span>
              </div>
              <div className="text-[var(--text-muted)] text-[11px] truncate">
                {playerName} &bull; {playerEmail}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 flex flex-col justify-between">
              <div className="space-y-1 text-[11px] text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <span>Court ({isSelectedSlotPeak ? "Peak" : "Standard"})</span>
                  <span className="font-mono">${courtBaseFee}.00</span>
                </div>
                {rentalsCost > 0 && (
                  <div className="flex justify-between">
                    <span>Equipment Rentals</span>
                    <span className="font-mono">+${rentalsCost}.00</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between font-bold text-xs text-[var(--foreground)] pt-1 border-t border-[var(--border)] mt-1">
                <span>Total Payment Due</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  ${checkoutTotal}.00
                </span>
              </div>
            </div>
          </div>

          {/* STRIPE EMBEDDED CHECKOUT OR STATUS */}
          {isCreatingSession ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-lg">
              <AppIcon
                name="spinner"
                size="md"
                className="animate-spin text-[var(--primary)]"
              />
              <span className="text-xs font-medium">
                Initializing secure Stripe Checkout session...
              </span>
            </div>
          ) : stripeClientSecret ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
                <AppIcon name="lock" size="xs" className="text-emerald-600" />
                <span>Stripe Secure Embedded Checkout</span>
              </div>
              <StripeEmbeddedCheckout
                clientSecret={stripeClientSecret}
                publishableKey={stripePublishableKey}
                onComplete={handleConfirmCourtBooking}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {stripeSessionError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-500">
                  <AppIcon name="circle-exclamation" size="xs" />
                  <span>{stripeSessionError}</span>
                </div>
              )}
              <div className="flex items-start gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2.5 text-xs">
                <AppIcon
                  name="credit-card"
                  size="sm"
                  className="text-indigo-400 mt-0.5 flex-shrink-0"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold block text-[var(--foreground)]">
                    {isStripeLive
                      ? "Stripe Live Mode Active"
                      : "Stripe Local Test Simulation"}
                  </span>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    {isStripeLive ? (
                      <>
                        Connected to Stripe account (<code>acct_1UcOCcLNLeiY9TUh</code>).
                        Embedded payment elements are active.
                      </>
                    ) : (
                      <>
                        Running in local simulation mode. If you recently saved keys to{" "}
                        <code className="font-mono">.env.local</code>, restart your dev
                        server (
                        <code className="font-mono bg-[var(--surface)] px-1 rounded">
                          pnpm dev
                        </code>
                        ) to load environment variables into the process.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTOR (FALLBACK / TEST MODE) */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[var(--foreground)] block text-xs">
                  Simulated Payment Method (Test Mode)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    ["Credit Card", "Apple Pay", "Google Pay", "Club Account"] as const
                  ).map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`rounded-md border p-1.5 text-xs font-medium text-center transition-all cursor-pointer ${
                        paymentMethod === pm
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-xs"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* MOCK CARD DETAILS */}
              {paymentMethod === "Credit Card" && (
                <div className="space-y-2 rounded-lg border border-[var(--border)] p-2.5 bg-[var(--surface)]">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[var(--text-muted)]">
                      Card Number
                    </label>
                    <AppInput
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="font-mono text-xs h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-muted)]">
                        Expires
                      </label>
                      <AppInput
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="font-mono text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-muted)]">
                        CVC
                      </label>
                      <AppInput
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="font-mono text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-[10.5px] text-[var(--text-muted)] pt-0.5">
            <strong>Cancellation Policy:</strong> Free cancellation with full 100% refund
            up to 24 hours prior to match time.
          </p>
        </div>
      </AppDialog>

      {/* CANCELLATION & REFUND MODAL */}
      <AppDialog
        isOpen={cancellingBooking !== null}
        onClose={() => setCancellingBooking(null)}
        title={
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AppIcon name="triangle-exclamation" size="sm" />
            <span>Cancel Court Reservation & Process Refund</span>
          </div>
        }
        description={`Cancel booking ${cancellingBooking?.id} on ${cancellingBooking?.courtName}?`}
        footer={
          <div className="flex items-center justify-between w-full">
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => setCancellingBooking(null)}
              disabled={isPending}
            >
              Keep Reservation
            </AppButton>
            <AppButton
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancellation}
              disabled={isPending}
            >
              <AppIcon name="trash" size="xs" />
              <span>
                Confirm Cancellation & Refund (${cancellingBooking?.totalAmount || 25}.00)
              </span>
            </AppButton>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 space-y-1 text-red-900 dark:text-red-200">
            <div className="font-bold">Refund Summary</div>
            <p>
              A 100% refund of <strong>${cancellingBooking?.totalAmount || 25}.00</strong>{" "}
              will be credited back to {cancellingBooking?.paymentMethod || "Credit Card"}
              .
            </p>
            <p className="text-[11px] text-red-700 dark:text-red-300">
              Your gate access PIN ({cancellingBooking?.pinCode || ""}) will be
              deactivated immediately and the calendar entry removed.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[var(--foreground)] block">
              Reason for Cancellation
            </label>
            <AppSelect
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            >
              <option value="Scheduling conflict">Scheduling conflict</option>
              <option value="Inclement weather / rain">Inclement weather / rain</option>
              <option value="Player injury or illness">Player injury or illness</option>
              <option value="Other">Other</option>
            </AppSelect>
          </div>
        </div>
      </AppDialog>
    </div>
  );
}
