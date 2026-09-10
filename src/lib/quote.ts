import type { Json } from "@/integrations/supabase/types";
import { destinationLinks } from "@/data/site";
import { addDays } from "@/lib/trip";

/**
 * Quote details live in the `quotes.items` JSONB column (its default is `[]`, so older quotes
 * parse to an empty plan). Totals are always derived from the lines, never stored per line.
 */
export type LineBasis = "person" | "group";

export type QuoteLine = {
  category: string;
  label: string;
  basis: LineBasis;
  unitPrice: number;
  /** Only used for per-group lines; per-person lines multiply by the traveller count. */
  quantity: number;
};

export type PlanDay = {
  location: string;
  activity: string;
  accommodation: string;
  meals: string;
  notes: string;
};

export type QuoteDetails = {
  consultant: string;
  countries: string[];
  startDate: string;
  travelers: number;
  lines: QuoteLine[];
  discount: number;
  days: PlanDay[];
};

export function blankDay(): PlanDay {
  return { location: "", activity: "", accommodation: "", meals: "", notes: "" };
}

export function blankLine(category = "Other", basis: LineBasis = "person"): QuoteLine {
  return { category, label: "", basis, unitPrice: 0, quantity: 1 };
}

export function templateLines(): QuoteLine[] {
  return [
    blankLine("Accommodation", "person"),
    blankLine("Transport", "group"),
    blankLine("Guide", "group"),
    blankLine("Park fees & permits", "person"),
    blankLine("Activities", "person"),
    blankLine("Meals", "person"),
  ];
}

export function lineQuantity(line: QuoteLine, travelers: number) {
  return line.basis === "person" ? travelers : line.quantity;
}

export function lineAmount(line: QuoteLine, travelers: number) {
  return line.unitPrice * lineQuantity(line, travelers);
}

export function quoteSubtotal(d: QuoteDetails) {
  return d.lines.reduce((sum, line) => sum + lineAmount(line, d.travelers), 0);
}

export function quoteTotal(d: QuoteDetails) {
  return Math.max(0, quoteSubtotal(d) - d.discount);
}

export function quoteEndDate(d: QuoteDetails) {
  return d.startDate && d.days.length ? addDays(d.startDate, d.days.length - 1) : "";
}

export function hasDetails(d: QuoteDetails) {
  return d.days.length > 0 || d.lines.length > 0;
}

export function countryNames(slugs: string[]) {
  return slugs.map((s) => destinationLinks.find((d) => d.slug === s)?.name ?? s).join(", ");
}

export function isBlankDay(day: PlanDay) {
  return Object.values(day).every((v) => !v.trim());
}

/** Drops untouched template lines and trailing empty days before saving. */
export function compactDetails(d: QuoteDetails): QuoteDetails {
  const days = [...d.days];
  while (days.length > 1 && isBlankDay(days[days.length - 1]!)) days.pop();
  return {
    ...d,
    consultant: d.consultant.trim(),
    days,
    lines: d.lines.filter((l) => l.label.trim() || l.unitPrice > 0),
  };
}

export function toJson(d: QuoteDetails): Json {
  return d;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function parseQuoteDetails(items: Json | null | undefined): QuoteDetails {
  const src = isRecord(items) ? items : {};
  const lines: unknown[] = Array.isArray(src["lines"]) ? src["lines"] : [];
  const days: unknown[] = Array.isArray(src["days"]) ? src["days"] : [];
  const countries: unknown[] = Array.isArray(src["countries"]) ? src["countries"] : [];
  return {
    consultant: str(src["consultant"]),
    countries: countries.filter((c): c is string => typeof c === "string"),
    startDate: str(src["startDate"]),
    travelers: Math.max(1, num(src["travelers"]) || 1),
    discount: Math.max(0, num(src["discount"])),
    lines: lines.filter(isRecord).map((l) => ({
      category: str(l["category"]) || "Other",
      label: str(l["label"]),
      basis: l["basis"] === "person" ? "person" : "group",
      unitPrice: num(l["unitPrice"]),
      quantity: Math.max(1, num(l["quantity"]) || 1),
    })),
    days: days.filter(isRecord).map((d) => ({
      location: str(d["location"]),
      activity: str(d["activity"]),
      accommodation: str(d["accommodation"]),
      meals: str(d["meals"]),
      notes: str(d["notes"]),
    })),
  };
}
