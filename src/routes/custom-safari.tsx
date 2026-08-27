import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, PartyPopper } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/site/Section";
import {
  accommodationLevels,
  budgetRanges,
  destinations,
  interestOptions,
  transportOptions,
} from "@/data/site";
import { cn } from "@/lib/utils";
import { makeReference } from "@/lib/reference";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/cta-safari.jpg";

export const Route = createFileRoute("/custom-safari")({
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
  "Anything else?",
];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
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

function CustomSafariPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canContinue = () => {
    if (step === 0) return form.name.trim() && form.email.trim();
    if (step === 1) return Boolean(form.arrival) || form.flexible;
    if (step === 3) return form.interests.length > 0;
    if (step === 4) return Boolean(form.budget);
    if (step === 5) return Boolean(form.accommodation);
    if (step === 7) return form.destinations.length > 0;
    return true;
  };

  const submit = async () => {
    setSaving(true);
    const ref = makeReference("BT");
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("safari_requests").insert({
      reference: ref,
      user_id: auth.user?.id ?? null,
      full_name: form.name,
      email: form.email,
      phone: form.phone || null,
      country: form.country || null,
      destination_slugs: form.destinations.map((d) => d.toLowerCase()),
      start_date: form.arrival || null,
      end_date: form.departure || null,
      adults: form.adults,
      children: form.children + form.infants,
      budget_range: form.budget || null,
      accommodation_level: form.accommodation || null,
      transport: form.transport,
      interests: form.interests,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) {
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
              <span className="font-semibold text-foreground">{reference}</span>. A Berakah consultant
              will email {form.email || "you"} a day-by-day itinerary and full cost breakdown within
              24 hours.
            </p>
            <dl className="mt-6 space-y-2 rounded-lg bg-muted p-4 text-left text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Travellers</dt>
                <dd>
                  {form.adults} adults{form.children ? `, ${form.children} children` : ""}
                  {form.infants ? `, ${form.infants} infants` : ""}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Destinations</dt>
                <dd className="text-right">{form.destinations.join(", ") || "Flexible"}</dd>
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
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setForm(initial);
                setStep(0);
                setSubmitted(false);
              }}
            >
              Start another request
            </Button>
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
                  <Input id="name" className="mt-2" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" className="mt-2" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone / WhatsApp</Label>
                  <Input id="phone" className="mt-2" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="country">Country of residence</Label>
                  <Input id="country" className="mt-2" value={form.country} onChange={(e) => set("country", e.target.value)} />
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="arrival">Arrival date</Label>
                  <Input id="arrival" type="date" className="mt-2" value={form.arrival} onChange={(e) => set("arrival", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="departure">Departure date</Label>
                  <Input id="departure" type="date" className="mt-2" value={form.departure} onChange={(e) => set("departure", e.target.value)} />
                </div>
                <label className="flex items-center gap-3 sm:col-span-2">
                  <Checkbox checked={form.flexible} onCheckedChange={(v) => set("flexible", v === true)} />
                  <span className="text-sm">My dates are flexible — suggest the best season</span>
                </label>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-5 sm:grid-cols-3">
                {(["adults", "children", "infants"] as const).map((key) => (
                  <div key={key}>
                    <Label htmlFor={key} className="capitalize">
                      {key}
                    </Label>
                    <Input
                      id={key}
                      type="number"
                      min={key === "adults" ? 1 : 0}
                      className="mt-2"
                      value={form[key]}
                      onChange={(e) => set(key, Number(e.target.value))}
                    />
                  </div>
                ))}
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
                  <ChoiceChip key={b} label={`${b} per person`} selected={form.budget === b} onClick={() => set("budget", b)} />
                ))}
              </div>
            ) : null}

            {step === 5 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {accommodationLevels.map((a) => (
                  <ChoiceChip key={a} label={a} selected={form.accommodation === a} onClick={() => set("accommodation", a)} />
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
                {destinations.map((d) => (
                  <ChoiceChip
                    key={d.slug}
                    label={d.name}
                    selected={form.destinations.includes(d.name)}
                    onClick={() => set("destinations", toggle(form.destinations, d.name))}
                  />
                ))}
              </div>
            ) : null}

            {step === 8 ? (
              <div>
                <Label htmlFor="notes">Special requirements</Label>
                <Textarea
                  id="notes"
                  rows={6}
                  className="mt-2"
                  placeholder="Dietary needs, mobility, celebrations, must-see places, photography gear, anything at all."
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            {step < stepTitles.length - 1 ? (
              <Button variant="gold" size="lg" disabled={!canContinue()} onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button variant="hero" size="xl" onClick={() => void submit()} disabled={saving}>
                Request My Safari
              </Button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
