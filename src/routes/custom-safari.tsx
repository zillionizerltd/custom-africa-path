import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, PartyPopper, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/site/Section";
import { Stepper } from "@/components/site/Stepper";
import {
  accommodationLevels,
  addOns,
  budgetRanges,
  destinationLinks,
  interestOptions,
  transportOptions,
} from "@/data/site";
import { useAuth } from "@/hooks/useAuth";
import { siteContentQueryOptions } from "@/lib/content-query";
import type { SafariPackage } from "@/lib/content-types";
import { money, shortDate } from "@/lib/format";
import { leadPrefix, makeReference } from "@/lib/reference";
import { addDays, daysBetween, todayISO } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/cta-safari.jpg";

/** Prefill from a package page ("Request this safari") or a destination page. */
type BuilderSearch = {
  safari?: string | undefined;
  destination?: string | undefined;
  travellers?: number | undefined;
  start?: string | undefined;
  addons?: string | undefined;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Route = createFileRoute("/custom-safari")({
  validateSearch: (search: Record<string, unknown>): BuilderSearch => {
    const travellers = Number(search["travellers"]);
    const start = search["start"];
    return {
      safari: typeof search["safari"] === "string" ? search["safari"] : undefined,
      destination: typeof search["destination"] === "string" ? search["destination"] : undefined,
      travellers:
        Number.isInteger(travellers) && travellers >= 1 && travellers <= 30
          ? travellers
          : undefined,
      start: typeof start === "string" && ISO_DATE.test(start) ? start : undefined,
      addons: typeof search["addons"] === "string" ? search["addons"] : undefined,
    };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQueryOptions),
  head: () => ({
    meta: [
      { title: "Build Your Safari — Custom Itineraries | Berakah Tours" },
      {
        name: "description",
        content:
          "Tell us your dates, interests, group size, budget and lodge preference. A Berakah consultant designs a private African safari itinerary and quote within 24 hours.",
      },
      { property: "og:title", content: "Build Your Safari — Custom Itineraries | Berakah Tours" },
      {
        property: "og:description",
        content: "Nine questions and we design a safari around you.",
      },
      { property: "og:url", content: "/custom-safari" },
    ],
    links: [{ rel: "canonical", href: "/custom-safari" }],
  }),
  component: CustomSafariPage,
});

type FormState = {
  name: string;
  email: string;
  phone: string;
  country: string;
  arrival: string;
  departure: string;
  flexible: boolean;
  adults: number;
  children: number;
  infants: number;
  interests: string[];
  budget: string;
  accommodation: string;
  transport: string[];
  /** Destination slugs. */
  destinations: string[];
  notes: string;
};

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  country: "",
  arrival: "",
  departure: "",
  flexible: false,
  adults: 2,
  children: 0,
  infants: 0,
  interests: [],
  budget: "",
  accommodation: "",
  transport: [],
  destinations: [],
  notes: "",
};

const stepTitles = [
  "Traveller information",
  "Travel dates",
  "Your group",
  "Interests",
  "Budget",
  "Accommodation",
  "Transportation",
  "Destinations",
  "Review & anything else",
];

function initialForm(search: BuilderSearch, pkg: SafariPackage | undefined): FormState {
  const known = new Set(destinationLinks.map((d) => d.slug));
  const wanted = pkg?.destinationSlugs ?? (search.destination ? [search.destination] : []);
  const extras = (search.addons ?? "")
    .split(",")
    .map((id) => addOns.find((a) => a.id === id)?.label)
    .filter((label): label is string => Boolean(label));
  const arrival = search.start ?? "";
  return {
    ...initial,
    adults: search.travellers ?? initial.adults,
    arrival,
    departure: arrival && pkg ? addDays(arrival, pkg.days - 1) : "",
    destinations: wanted.filter((slug) => known.has(slug)),
    notes: pkg
      ? `I'd like to start from "${pkg.title}"${extras.length ? `, adding: ${extras.join(", ")}` : ""}.`
      : "",
  };
}

/** Returns why the traveller can't continue from a step, or null when they can. */
function stepError(step: number, form: FormState): string | null {
  switch (step) {
    case 0:
      if (!form.name.trim()) return "Add your name to continue.";
      if (!EMAIL.test(form.email.trim())) return "Add a valid email so we can send your itinerary.";
      return null;
    case 1:
      if (!form.arrival && !form.flexible) return "Choose an arrival date, or tick flexible dates.";
      if (form.arrival && form.departure && form.departure < form.arrival)
        return "Departure needs to be on or after arrival.";
      return null;
    case 3:
      return form.interests.length ? null : "Pick at least one interest.";
    case 4:
      return form.budget ? null : "Choose a budget range.";
    case 5:
      return form.accommodation ? null : "Choose an accommodation level.";
    case 7:
      return form.destinations.length ? null : "Pick at least one destination.";
    default:
      return null;
  }
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function destinationNames(slugs: string[]) {
  return slugs.map((s) => destinationLinks.find((d) => d.slug === s)?.name ?? s).join(", ");
}

function groupText(form: FormState) {
  return [
    `${form.adults} ${form.adults === 1 ? "adult" : "adults"}`,
    form.children ? `${form.children} ${form.children === 1 ? "child" : "children"}` : "",
    form.infants ? `${form.infants} ${form.infants === 1 ? "infant" : "infants"}` : "",
  ]
    .filter(Boolean)
    .join(", ");
}

function datesText(form: FormState) {
  if (!form.arrival) return form.flexible ? "Flexible — suggest the best season" : "—";
  const range = form.departure
    ? `${shortDate(form.arrival)} → ${shortDate(form.departure)}`
    : `From ${shortDate(form.arrival)}`;
  return form.flexible ? `${range} (flexible)` : range;
}

function ChoiceChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
        selected
          ? "border-accent bg-accent/15 text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-accent/60 hover:text-foreground",
      )}
    >
      <span className="flex items-center justify-between gap-3">
        {label}
        {selected ? <Check className="size-4 text-accent" /> : null}
      </span>
    </button>
  );
}

function ReviewRow({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="flex-1">{children}</dd>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
      >
        Edit
      </button>
    </div>
  );
}

function CustomSafariPage() {
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(siteContentQueryOptions);
  const basePackage = search.safari
    ? data.packages.find((p) => p.slug === search.safari)
    : undefined;
  const { user, profile } = useAuth();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => initialForm(search, basePackage));
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);

  // Signed-in travellers shouldn't have to retype their details.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: f.name || profile?.full_name || "",
      email: f.email || user.email || "",
      phone: f.phone || profile?.phone || "",
      country: f.country || profile?.country || "",
    }));
  }, [user, profile]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const today = todayISO();
  const error = stepError(step, form);
  const tripDays =
    form.arrival && form.departure && form.departure >= form.arrival
      ? daysBetween(form.arrival, form.departure) + 1
      : null;

  const submit = async () => {
    setSaving(true);
    const ref = makeReference(leadPrefix.builder);
    const { data: auth } = await supabase.auth.getUser();
    // The table has no columns for these, so they travel with the notes.
    const notes = [
      form.infants ? `Infants (under 2): ${form.infants}` : "",
      form.flexible ? "Dates are flexible — please suggest the best season." : "",
      form.notes.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");
    const { error: insertError } = await supabase.from("safari_requests").insert({
      reference: ref,
      user_id: auth.user?.id ?? null,
      full_name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      country: form.country.trim() || null,
      destination_slugs: form.destinations,
      start_date: form.arrival || null,
      end_date: form.departure || null,
      adults: form.adults,
      children: form.children + form.infants,
      budget_range: form.budget || null,
      accommodation_level: form.accommodation || null,
      transport: form.transport,
      interests: form.interests,
      notes: notes || null,
    });
    setSaving(false);
    if (insertError) {
      toast.error("We couldn't submit your request. Please try again.");
      return;
    }
    setReference(ref);
    setSubmitted(true);
    toast.success("Safari request received", {
      description: "A consultant will reply with a costed itinerary within 24 hours.",
    });
  };

  if (submitted) {
    return (
      <>
        <PageHero eyebrow="Request received" title="We're on it." image={heroImage} />
        <section className="container-page py-16">
          <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center">
            <PartyPopper className="mx-auto size-10 text-accent" />
            <h2 className="mt-4 text-2xl">Thank you, {form.name.split(" ")[0] || "traveller"}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your custom safari request has been logged as{" "}
              <span className="font-semibold text-foreground">{reference}</span>. A Berakah
              consultant will email {form.email || "you"} a day-by-day itinerary and full cost
              breakdown within 24 hours.
            </p>
            <dl className="mt-6 space-y-2 rounded-lg bg-muted p-4 text-left text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Travellers</dt>
                <dd className="text-right">{groupText(form)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Dates</dt>
                <dd className="text-right">{datesText(form)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Destinations</dt>
                <dd className="text-right">{destinationNames(form.destinations) || "Flexible"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Budget</dt>
                <dd>{form.budget || "To discuss"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Accommodation</dt>
                <dd>{form.accommodation || "To discuss"}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {user ? (
                <Button asChild variant="gold">
                  <Link to="/dashboard">Track it in your account</Link>
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={() => {
                  setForm(initial);
                  setStep(0);
                  setSubmitted(false);
                }}
              >
                Start another request
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Custom safari builder"
        title="Plan Your Safari"
        description="Tell us how you want to travel. We'll build the safari around you — no fixed packages, no pressure."
        image={heroImage}
      />

      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          {basePackage ? (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
              <span className="flex items-center gap-2">
                <Sparkles className="size-4 shrink-0" />
                Starting from{" "}
                <Link
                  to="/safaris/$slug"
                  params={{ slug: basePackage.slug }}
                  className="font-semibold underline-offset-4 hover:underline"
                >
                  {basePackage.title}
                </Link>
                · from {money(basePackage.priceFrom, basePackage.currency)} pp
              </span>
              <span className="text-muted-foreground">Change anything you like.</span>
            </div>
          ) : null}

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">
                Step {step + 1} of {stepTitles.length}
              </p>
              <h2 className="mt-2 text-2xl">{stepTitles[step]}</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {Math.round(((step + 1) / stepTitles.length) * 100)}%
            </span>
          </div>
          <Progress value={((step + 1) / stepTitles.length) * 100} className="mt-4" />

          <div className="mt-8 rounded-xl border border-border bg-card p-6 md:p-8">
            {step === 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full name *</Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    className="mt-2"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="mt-2"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone / WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    className="mt-2"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country of residence</Label>
                  <Input
                    id="country"
                    autoComplete="country-name"
                    className="mt-2"
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="arrival">Arrival date</Label>
                  <Input
                    id="arrival"
                    type="date"
                    min={today}
                    className="mt-2"
                    value={form.arrival}
                    onChange={(e) => set("arrival", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="departure">Departure date</Label>
                  <Input
                    id="departure"
                    type="date"
                    min={form.arrival || today}
                    className="mt-2"
                    value={form.departure}
                    onChange={(e) => set("departure", e.target.value)}
                  />
                </div>
                {tripDays ? (
                  <p className="text-sm text-muted-foreground sm:col-span-2">
                    {tripDays} {tripDays === 1 ? "day" : "days"} / {tripDays - 1}{" "}
                    {tripDays - 1 === 1 ? "night" : "nights"} in Africa
                  </p>
                ) : null}
                <label className="flex items-center gap-3 sm:col-span-2">
                  <Checkbox
                    checked={form.flexible}
                    onCheckedChange={(v) => set("flexible", v === true)}
                  />
                  <span className="text-sm">My dates are flexible — suggest the best season</span>
                </label>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="adults">Adults</Label>
                  <Stepper
                    id="adults"
                    label="adults"
                    value={form.adults}
                    min={1}
                    max={30}
                    onChange={(v) => set("adults", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="children">Children</Label>
                  <Stepper
                    id="children"
                    label="children"
                    value={form.children}
                    max={20}
                    onChange={(v) => set("children", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="infants">Infants (under 2)</Label>
                  <Stepper
                    id="infants"
                    label="infants"
                    value={form.infants}
                    max={10}
                    onChange={(v) => set("infants", v)}
                  />
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-3">
                  Gorilla trekking has a minimum age of 15 — we plan family-friendly alternatives
                  for younger travellers.
                </p>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {interestOptions.map((i) => (
                  <ChoiceChip
                    key={i}
                    label={i}
                    selected={form.interests.includes(i)}
                    onClick={() => set("interests", toggle(form.interests, i))}
                  />
                ))}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {budgetRanges.map((b) => (
                  <ChoiceChip
                    key={b}
                    label={`${b} per person`}
                    selected={form.budget === b}
                    onClick={() => set("budget", b)}
                  />
                ))}
              </div>
            ) : null}

            {step === 5 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {accommodationLevels.map((a) => (
                  <ChoiceChip
                    key={a}
                    label={a}
                    selected={form.accommodation === a}
                    onClick={() => set("accommodation", a)}
                  />
                ))}
              </div>
            ) : null}

            {step === 6 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {transportOptions.map((t) => (
                  <ChoiceChip
                    key={t}
                    label={t}
                    selected={form.transport.includes(t)}
                    onClick={() => set("transport", toggle(form.transport, t))}
                  />
                ))}
              </div>
            ) : null}

            {step === 7 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {destinationLinks.map((d) => (
                  <ChoiceChip
                    key={d.slug}
                    label={d.name}
                    selected={form.destinations.includes(d.slug)}
                    onClick={() => set("destinations", toggle(form.destinations, d.slug))}
                  />
                ))}
              </div>
            ) : null}

            {step === 8 ? (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="notes">Special requirements</Label>
                  <Textarea
                    id="notes"
                    rows={5}
                    className="mt-2"
                    placeholder="Dietary needs, mobility, celebrations, must-see places, photography gear, anything at all."
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-semibold tracking-normal">Your request</h3>
                  <dl className="mt-2 divide-y divide-border rounded-lg border border-border px-4 text-sm">
                    <ReviewRow label="Lead traveller" onEdit={() => setStep(0)}>
                      {form.name} · {form.email}
                    </ReviewRow>
                    <ReviewRow label="Dates" onEdit={() => setStep(1)}>
                      {datesText(form)}
                    </ReviewRow>
                    <ReviewRow label="Group" onEdit={() => setStep(2)}>
                      {groupText(form)}
                    </ReviewRow>
                    <ReviewRow label="Interests" onEdit={() => setStep(3)}>
                      {form.interests.join(", ")}
                    </ReviewRow>
                    <ReviewRow label="Budget" onEdit={() => setStep(4)}>
                      {form.budget} per person
                    </ReviewRow>
                    <ReviewRow label="Accommodation" onEdit={() => setStep(5)}>
                      {form.accommodation}
                    </ReviewRow>
                    <ReviewRow label="Transport" onEdit={() => setStep(6)}>
                      {form.transport.join(", ") || "Your recommendation"}
                    </ReviewRow>
                    <ReviewRow label="Destinations" onEdit={() => setStep(7)}>
                      {destinationNames(form.destinations)}
                    </ReviewRow>
                  </dl>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            <div className="flex flex-wrap items-center justify-end gap-3">
              {error ? (
                <p className="text-sm text-muted-foreground" role="status">
                  {error}
                </p>
              ) : null}
              {step < stepTitles.length - 1 ? (
                <Button
                  variant="gold"
                  size="lg"
                  disabled={Boolean(error)}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Continue <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button variant="hero" size="xl" onClick={() => void submit()} disabled={saving}>
                  {saving ? "Sending…" : "Request My Safari"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
