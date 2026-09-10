export function makeReference(prefix: string): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${yy}${mm}-${rand}`;
}

/**
 * Every lead lands in `safari_requests`; the reference prefix records where it came from:
 * BT = safari builder, EN = contact form, NL = newsletter sign-up.
 */
export const leadPrefix = { builder: "BT", enquiry: "EN", newsletter: "NL" } as const;

export type LeadSource = keyof typeof leadPrefix;

export const leadSourceLabel: Record<LeadSource, string> = {
  builder: "Safari builder",
  enquiry: "Contact enquiry",
  newsletter: "Newsletter",
};

export function leadSource(reference: string): LeadSource {
  if (reference.startsWith(`${leadPrefix.enquiry}-`)) return "enquiry";
  if (reference.startsWith(`${leadPrefix.newsletter}-`)) return "newsletter";
  return "builder";
}
