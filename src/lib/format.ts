export function money(amount: number | string | null | undefined, currency = "USD") {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Date-only strings ("2026-12-12") are parsed as UTC midnight, so they are formatted in UTC too —
 * otherwise travellers west of Greenwich see the previous day.
 */
export function shortDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(DATE_ONLY.test(value) ? { timeZone: "UTC" } : {}),
  });
}

/** "Sat 12 Dec" — used for itinerary rows. */
export function dayLabel(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
