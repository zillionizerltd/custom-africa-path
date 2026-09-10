import { bookingTerms } from "@/data/site";

const DAY_MS = 86_400_000;

/** Today as "YYYY-MM-DD" in the viewer's own calendar. */
export function todayISO(now = new Date()) {
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

function toUTC(date: string) {
  return Date.UTC(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
  );
}

export function addDays(date: string, days: number) {
  return new Date(toUTC(date) + days * DAY_MS).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  return Math.round((toUTC(to) - toUTC(from)) / DAY_MS);
}

export function balanceOf(total: number | string, paid: number | string) {
  return Math.max(0, Number(total) - Number(paid));
}

/** Per the booking terms, the balance falls due a fixed number of days before arrival. */
export function balanceDeadline(start: string) {
  return addDays(start, -bookingTerms.balanceDueDays);
}

export type TripTiming =
  | { kind: "unscheduled" }
  | { kind: "upcoming"; days: number }
  | { kind: "ongoing" }
  | { kind: "past" };

export function tripTiming(
  start: string | null,
  end: string | null,
  today = todayISO(),
): TripTiming {
  if (!start) return { kind: "unscheduled" };
  const days = daysBetween(today, start);
  if (days >= 0) return { kind: "upcoming", days };
  if (daysBetween(today, end ?? start) >= 0) return { kind: "ongoing" };
  return { kind: "past" };
}

export function timingLabel(timing: TripTiming) {
  switch (timing.kind) {
    case "unscheduled":
      return "Dates TBC";
    case "ongoing":
      return "On trip";
    case "past":
      return "Returned";
    case "upcoming":
      if (timing.days === 0) return "Today";
      return timing.days === 1 ? "Tomorrow" : `${timing.days} days`;
  }
}

/** Flags an unpaid balance that is past its deadline, or will be within two weeks. */
export function balanceAlert(timing: TripTiming, balance: number): "overdue" | "due-soon" | null {
  if (balance <= 0 || timing.kind === "unscheduled") return null;
  if (timing.kind !== "upcoming") return "overdue";
  const daysToDeadline = timing.days - bookingTerms.balanceDueDays;
  if (daysToDeadline < 0) return "overdue";
  return daysToDeadline <= 14 ? "due-soon" : null;
}
