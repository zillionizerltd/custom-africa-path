import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stepper } from "@/components/site/Stepper";
import { EmptyState, PageTitle, Panel, StatusBadge } from "@/components/dashboard/Shell";
import { QuoteDetailsView } from "@/components/dashboard/QuoteDetails";
import { bookingTerms, destinationLinks, mealPlans, quoteCategories } from "@/data/site";
import { useAuth } from "@/hooks/useAuth";
import { packageOptionsQuery } from "@/lib/admin-queries";
import { dayLabel, money, shortDate } from "@/lib/format";
import {
  blankDay,
  blankLine,
  compactDetails,
  hasDetails,
  isBlankDay,
  lineAmount,
  parseQuoteDetails,
  quoteEndDate,
  quoteSubtotal,
  quoteTotal,
  templateLines,
  toJson,
  type LineBasis,
  type PlanDay,
  type QuoteDetails,
  type QuoteLine,
} from "@/lib/quote";
import { makeReference } from "@/lib/reference";
import { addDays, daysBetween, todayISO } from "@/lib/trip";
import { cn } from "@/lib/utils";

type QuoteRow = Database["public"]["Tables"]["quotes"]["Row"];
type RequestRow = Database["public"]["Tables"]["safari_requests"]["Row"];

type BuilderSearch = { request?: string | undefined; quote?: string | undefined };

export const Route = createFileRoute("/_authenticated/admin/quote-builder")({
  validateSearch: (search: Record<string, unknown>): BuilderSearch => ({
    request: typeof search["request"] === "string" ? search["request"] : undefined,
    quote: typeof search["quote"] === "string" ? search["quote"] : undefined,
  }),
  component: QuoteBuilderPage,
});

/** Once a client has accepted or declined, the quote is a record and can't be changed. */
const EDITABLE = new Set(["draft", "sent", "expired"]);

// Shaded = a field the consultant fills in; plain = calculated.
const shaded = "bg-sand/50";

function QuoteBuilderPage() {
  const search = Route.useSearch();

  const source = useQuery({
    queryKey: ["quote-builder", search.quote ?? null, search.request ?? null],
    enabled: Boolean(search.quote || search.request),
    queryFn: async () => {
      let quote: QuoteRow | null = null;
      let requestId = search.request ?? null;
      if (search.quote) {
        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .eq("id", search.quote)
          .maybeSingle();
        if (error) throw error;
        quote = data;
        requestId = data?.request_id ?? null;
      }
      let request: RequestRow | null = null;
      if (requestId) {
        const { data, error } = await supabase
          .from("safari_requests")
          .select("*")
          .eq("id", requestId)
          .maybeSingle();
        if (error) throw error;
        request = data;
      }
      return { quote, request };
    },
  });

  if (!search.quote && !search.request) {
    return (
      <div className="mt-8">
        <EmptyState message="Open the quote builder from a safari request or an existing quote." />
      </div>
    );
  }
  if (source.isLoading) {
    return <p className="mt-8 text-sm text-muted-foreground">Loading…</p>;
  }
  const found = source.data && (source.data.quote || source.data.request);
  if (source.error || !source.data || !found || (search.quote && !source.data.quote)) {
    return (
      <div className="mt-8">
        <EmptyState message="We couldn't find that request or quote." />
      </div>
    );
  }

  const { quote, request } = source.data;
  return <QuoteBuilder key={quote?.id ?? request?.id} quote={quote} request={request} />;
}

function defaultTitle(request: RequestRow | null) {
  if (!request) return "Safari quote";
  const places = request.destination_slugs
    .map((s) => destinationLinks.find((d) => d.slug === s)?.name ?? s)
    .join(" & ");
  return `${places || "Custom"} safari for ${request.full_name}`;
}

function initialDetails(
  quote: QuoteRow | null,
  request: RequestRow | null,
  consultant: string,
): QuoteDetails {
  if (quote) {
    const parsed = parseQuoteDetails(quote.items);
    if (hasDetails(parsed)) return parsed;
  }
  // New quote, or one written before the builder existed: seed the plan from the request.
  const length =
    request?.start_date && request.end_date
      ? Math.min(30, Math.max(1, daysBetween(request.start_date, request.end_date) + 1))
      : 7;
  return {
    consultant,
    countries: request?.destination_slugs ?? [],
    startDate: request?.start_date ?? "",
    travelers: request ? Math.max(1, request.adults + (request.children ?? 0)) : 2,
    lines: templateLines(),
    discount: 0,
    days: Array.from({ length }, blankDay),
  };
}

/** Package itineraries are stored as `{ day, title, details[] }[]`. */
function packageDays(json: Json): PlanDay[] {
  if (!Array.isArray(json)) return [];
  return json.flatMap((day) => {
    if (!day || typeof day !== "object" || Array.isArray(day)) return [];
    const details = Array.isArray(day["details"]) ? day["details"] : [];
    return [
      {
        ...blankDay(),
        location: typeof day["title"] === "string" ? day["title"] : "",
        activity: details.filter((d): d is string => typeof d === "string").join("; "),
      },
    ];
  });
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {htmlFor ? (
        <Label htmlFor={htmlFor}>{label}</Label>
      ) : (
        <p className="text-sm font-medium leading-none">{label}</p>
      )}
      {children}
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function QuoteBuilder({ quote, request }: { quote: QuoteRow | null; request: RequestRow | null }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, profile } = useAuth();
  const readOnly = quote ? !EDITABLE.has(quote.status) : false;
  const currency = quote?.currency ?? "USD";
  const fmt = (n: number) => money(n, currency);

  const [title, setTitle] = useState(quote?.title ?? defaultTitle(request));
  const [summary, setSummary] = useState(quote?.summary ?? "");
  const [validUntil, setValidUntil] = useState(quote?.valid_until ?? addDays(todayISO(), 14));
  const [basePackage, setBasePackage] = useState("");
  const [details, setDetails] = useState<QuoteDetails>(() =>
    initialDetails(quote, request, profile?.full_name ?? ""),
  );

  // The profile can arrive after the first render; default the consultant once it does.
  const profileName = profile?.full_name ?? "";
  useEffect(() => {
    if (profileName) setDetails((d) => (d.consultant ? d : { ...d, consultant: profileName }));
  }, [profileName]);

  const packages = useQuery(packageOptionsQuery);
  const lodges = useQuery({
    queryKey: ["ops", "accommodations"],
    queryFn: async () =>
      (await supabase.from("accommodations").select("*").order("name")).data ?? [],
  });

  const patch = (next: Partial<QuoteDetails>) => setDetails((d) => ({ ...d, ...next }));
  const setDay = (index: number, field: keyof PlanDay, value: string) =>
    setDetails((d) => ({
      ...d,
      days: d.days.map((day, i) => (i === index ? { ...day, [field]: value } : day)),
    }));
  const setLine = (index: number, next: Partial<QuoteLine>) =>
    setDetails((d) => ({
      ...d,
      lines: d.lines.map((line, i) => (i === index ? { ...line, ...next } : line)),
    }));

  const applyPackage = (id: string) => {
    const pkg = packages.data?.find((p) => p.id === id);
    if (!pkg) return;
    const planned = packageDays(pkg.itinerary);
    setDetails((d) => ({
      ...d,
      countries: [...new Set([...d.countries, ...pkg.destination_slugs])],
      // Price per person × travellers, recalculated whenever the traveller count changes.
      lines: [
        {
          category: "Package",
          label: pkg.title,
          basis: "person",
          unitPrice: Number(pkg.price_from),
          quantity: 1,
        },
        ...d.lines.filter((l) => l.category !== "Package"),
      ],
      days: d.days.every(isBlankDay) && planned.length ? planned : d.days,
    }));
    toast.success(`Pulled in ${pkg.title}`, {
      description: "Price added per person; the itinerary fills any empty plan.",
    });
  };

  const subtotal = quoteSubtotal(details);
  const total = quoteTotal(details);
  const end = quoteEndDate(details);
  const deposit = Math.round(total * bookingTerms.depositRate);

  const save = useMutation({
    mutationFn: async (status: "draft" | "sent") => {
      const clean = compactDetails(details);
      const amount = quoteTotal(clean);
      if (!title.trim()) throw new Error("Give the quote a title.");
      if (status === "sent" && amount <= 0)
        throw new Error("Add at least one priced line before sending.");
      const payload = {
        title: title.trim(),
        summary: summary.trim() || null,
        items: toJson(clean),
        total_amount: amount,
        valid_until: validUntil || null,
        status,
      };
      if (quote) {
        const { error } = await supabase.from("quotes").update(payload).eq("id", quote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quotes").insert({
          ...payload,
          reference: makeReference("QT"),
          request_id: request?.id ?? null,
          user_id: request?.user_id ?? null,
          created_by: user?.id ?? null,
        });
        if (error) throw error;
      }
      if (
        status === "sent" &&
        request &&
        (request.status === "new" || request.status === "reviewing")
      ) {
        await supabase.from("safari_requests").update({ status: "quoted" }).eq("id", request.id);
      }
    },
    onSuccess: (_data, status) => {
      toast.success(status === "sent" ? "Quote sent to the client" : "Draft saved");
      void qc.invalidateQueries({ queryKey: ["admin-quotes"] });
      void qc.invalidateQueries({ queryKey: ["admin-requests"] });
      void qc.invalidateQueries({ queryKey: ["quote-builder"] });
      void navigate({ to: "/admin/quotes" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to="/admin/quotes"
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> All quotes
          </Link>
          <PageTitle
            eyebrow={quote ? `Quote ${quote.reference}` : "New quote"}
            title="Itinerary & quote builder"
            {...(request
              ? { description: `For ${request.full_name} · request ${request.reference}` }
              : {})}
          />
        </div>
        {quote ? <StatusBadge status={quote.status} /> : null}
      </div>

      {readOnly && quote ? (
        <>
          <p className="rounded-xl border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
            The client has {quote.status === "accepted" ? "accepted" : "declined"} this quote, so it
            is kept as a record and can no longer be edited.
          </p>
          <Panel title={quote.title} {...(quote.summary ? { description: quote.summary } : {})}>
            <QuoteDetailsView details={details} currency={currency} />
          </Panel>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className={cn("size-3 rounded-sm border border-input", shaded)} /> Shaded fields
              are yours to fill in
            </span>
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-sm border border-border bg-card" /> Day numbers, dates
              and totals calculate automatically
            </span>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1fr_20rem]">
            <div className="min-w-0 space-y-8">
              <Panel title="Trip summary">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Quote title" htmlFor="q-title" className="sm:col-span-2">
                    <Input
                      id="q-title"
                      className={shaded}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </Field>
                  <Field label="Client">
                    <p className="text-sm">
                      {request ? `${request.full_name} · ${request.email}` : "—"}
                    </p>
                  </Field>
                  <Field label="Consultant" htmlFor="q-consultant">
                    <Input
                      id="q-consultant"
                      className={shaded}
                      value={details.consultant}
                      onChange={(e) => patch({ consultant: e.target.value })}
                    />
                  </Field>
                  <Field label="Start date" htmlFor="q-start">
                    <Input
                      id="q-start"
                      type="date"
                      className={shaded}
                      value={details.startDate}
                      onChange={(e) => patch({ startDate: e.target.value })}
                    />
                  </Field>
                  <Field label="End date">
                    <p className="text-sm">
                      {end
                        ? `${shortDate(end)} · ${details.days.length} days / ${details.days.length - 1} nights`
                        : "Set a start date"}
                    </p>
                  </Field>
                  <Field label="Travellers" htmlFor="q-travellers">
                    <Stepper
                      id="q-travellers"
                      label="travellers"
                      value={details.travelers}
                      min={1}
                      max={60}
                      onChange={(v) => patch({ travelers: v })}
                    />
                  </Field>
                  <Field label="Quote valid until" htmlFor="q-valid">
                    <Input
                      id="q-valid"
                      type="date"
                      className={shaded}
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                    />
                  </Field>
                  <Field label="Countries" className="sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {destinationLinks.map((d) => {
                        const on = details.countries.includes(d.slug);
                        return (
                          <button
                            key={d.slug}
                            type="button"
                            aria-pressed={on}
                            onClick={() =>
                              patch({
                                countries: on
                                  ? details.countries.filter((c) => c !== d.slug)
                                  : [...details.countries, d.slug],
                              })
                            }
                            className={cn(
                              "rounded-full border px-3 py-1 text-sm transition-colors",
                              on
                                ? "border-accent bg-accent/15 text-foreground"
                                : "border-border text-muted-foreground hover:border-accent/60",
                            )}
                          >
                            {d.name}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field label="Note to the client" htmlFor="q-summary" className="sm:col-span-2">
                    <Textarea
                      id="q-summary"
                      rows={3}
                      className={shaded}
                      placeholder="What makes this trip: pacing, why these lodges, what to expect."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                    />
                  </Field>
                </div>
                {request ? (
                  <p className="mt-5 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                    Client asked for:{" "}
                    {request.budget_range ? `${request.budget_range} pp` : "no budget given"} ·{" "}
                    {request.accommodation_level ?? "any accommodation level"}
                    {request.interests.length ? ` · ${request.interests.join(", ")}` : ""}
                  </p>
                ) : null}
              </Panel>

              <Panel
                title="Day-by-day itinerary"
                description="One row per day. Dates follow the trip start date."
                actions={
                  <Select
                    value={basePackage}
                    onValueChange={(v) => {
                      setBasePackage(v);
                      applyPackage(v);
                    }}
                  >
                    <SelectTrigger className="h-9 w-60" aria-label="Start from a package">
                      <SelectValue placeholder="Start from a package…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(packages.data ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                }
              >
                <div className="max-h-144 overflow-auto rounded-lg border border-border">
                  <table className="w-full min-w-5xl text-sm">
                    <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-card [&_th]:px-3 [&_th]:py-2 [&_th]:font-medium [&_th]:shadow-[inset_0_-1px_0_var(--color-border)]">
                      <tr>
                        <th className="w-12">Day</th>
                        <th className="w-28">Date</th>
                        <th>Location</th>
                        <th>Activity</th>
                        <th>Accommodation</th>
                        <th className="w-32">Meals</th>
                        <th>Notes</th>
                        <th className="w-12">
                          <span className="sr-only">Remove</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.days.map((day, i) => (
                        <tr key={i} className="border-t border-border even:bg-muted/30">
                          <td className="px-3 py-2 font-semibold tabular-nums">{i + 1}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                            {details.startDate ? dayLabel(addDays(details.startDate, i)) : "—"}
                          </td>
                          {(["location", "activity", "accommodation"] as const).map((field) => (
                            <td key={field} className="p-1.5">
                              <Input
                                aria-label={`Day ${i + 1} ${field}`}
                                className={cn("h-8", shaded)}
                                value={day[field]}
                                onChange={(e) => setDay(i, field, e.target.value)}
                                {...(field === "accommodation" ? { list: "lodge-options" } : {})}
                              />
                            </td>
                          ))}
                          <td className="p-1.5">
                            <Select value={day.meals} onValueChange={(v) => setDay(i, "meals", v)}>
                              <SelectTrigger
                                className={cn("h-8", shaded)}
                                aria-label={`Day ${i + 1} meals`}
                              >
                                <SelectValue placeholder="—" />
                              </SelectTrigger>
                              <SelectContent>
                                {mealPlans.map((m) => (
                                  <SelectItem key={m} value={m}>
                                    {m}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-1.5">
                            <Input
                              aria-label={`Day ${i + 1} notes`}
                              className={cn("h-8", shaded)}
                              value={day.notes}
                              onChange={(e) => setDay(i, "notes", e.target.value)}
                            />
                          </td>
                          <td className="p-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove day ${i + 1}`}
                              disabled={details.days.length === 1}
                              onClick={() =>
                                setDetails((d) => ({
                                  ...d,
                                  days: d.days.filter((_, j) => j !== i),
                                }))
                              }
                            >
                              <Trash2 />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <datalist id="lodge-options">
                  {(lodges.data ?? []).map((l) => (
                    <option key={l.id} value={l.name} />
                  ))}
                </datalist>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDetails((d) => ({ ...d, days: [...d.days, blankDay()] }))}
                  >
                    <Plus /> Add day
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Meals: B = breakfast, L = lunch, D = dinner.
                  </p>
                </div>
              </Panel>

              <Panel
                title="Cost breakdown"
                description="Per-person lines multiply by the traveller count automatically."
              >
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-3xl text-sm">
                    <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground [&_th]:px-3 [&_th]:py-2 [&_th]:font-medium">
                      <tr>
                        <th className="w-44">Category</th>
                        <th>Description</th>
                        <th className="w-36">Basis</th>
                        <th className="w-32 text-right">Unit price</th>
                        <th className="w-24 text-right">Qty</th>
                        <th className="w-28 text-right">Amount</th>
                        <th className="w-12">
                          <span className="sr-only">Remove</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.lines.map((line, i) => (
                        <tr key={i} className="border-t border-border even:bg-muted/30">
                          <td className="p-1.5">
                            <Select
                              value={line.category}
                              onValueChange={(v) => setLine(i, { category: v })}
                            >
                              <SelectTrigger
                                className={cn("h-8", shaded)}
                                aria-label={`Line ${i + 1} category`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {quoteCategories.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-1.5">
                            <Input
                              aria-label={`Line ${i + 1} description`}
                              className={cn("h-8", shaded)}
                              placeholder={line.category}
                              value={line.label}
                              onChange={(e) => setLine(i, { label: e.target.value })}
                            />
                          </td>
                          <td className="p-1.5">
                            <Select
                              value={line.basis}
                              onValueChange={(v) => setLine(i, { basis: v as LineBasis })}
                            >
                              <SelectTrigger
                                className={cn("h-8", shaded)}
                                aria-label={`Line ${i + 1} basis`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="person">Per person</SelectItem>
                                <SelectItem value="group">Per group</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-1.5">
                            <Input
                              type="number"
                              min={0}
                              step={10}
                              placeholder="0"
                              aria-label={`Line ${i + 1} unit price`}
                              className={cn("h-8 text-right tabular-nums", shaded)}
                              value={line.unitPrice || ""}
                              onChange={(e) =>
                                setLine(i, { unitPrice: Math.max(0, Number(e.target.value) || 0) })
                              }
                            />
                          </td>
                          <td className="p-1.5">
                            {line.basis === "person" ? (
                              <span
                                className="block px-3 text-right tabular-nums text-muted-foreground"
                                title="Follows the traveller count"
                              >
                                {details.travelers}
                              </span>
                            ) : (
                              <Input
                                type="number"
                                min={1}
                                aria-label={`Line ${i + 1} quantity`}
                                className={cn("h-8 text-right tabular-nums", shaded)}
                                value={line.quantity}
                                onChange={(e) =>
                                  setLine(i, {
                                    quantity: Math.max(1, Math.round(Number(e.target.value)) || 1),
                                  })
                                }
                              />
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-medium tabular-nums">
                            {fmt(lineAmount(line, details.travelers))}
                          </td>
                          <td className="p-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove line ${i + 1}`}
                              onClick={() =>
                                setDetails((d) => ({
                                  ...d,
                                  lines: d.lines.filter((_, j) => j !== i),
                                }))
                              }
                            >
                              <Trash2 />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDetails((d) => ({ ...d, lines: [...d.lines, blankLine()] }))}
                  >
                    <Plus /> Add line
                  </Button>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="q-discount" className="text-sm">
                      Discount ({currency})
                    </Label>
                    <Input
                      id="q-discount"
                      type="number"
                      min={0}
                      step={10}
                      placeholder="0"
                      className={cn("h-9 w-32 text-right tabular-nums", shaded)}
                      value={details.discount || ""}
                      onChange={(e) =>
                        patch({ discount: Math.max(0, Number(e.target.value) || 0) })
                      }
                    />
                  </div>
                </div>
              </Panel>
            </div>

            <aside className="xl:sticky xl:top-24 xl:h-fit">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h2 className="font-display text-lg font-semibold">Quote total</h2>
                <dl className="mt-4 space-y-2 text-sm" aria-live="polite">
                  <TotalRow label="Subtotal" value={fmt(subtotal)} />
                  {details.discount > 0 ? (
                    <TotalRow label="Discount" value={`−${fmt(details.discount)}`} />
                  ) : null}
                  <div className="flex items-baseline justify-between gap-4 border-t border-dashed border-border pt-3">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-display text-3xl font-semibold tabular-nums">
                      {fmt(total)}
                    </dd>
                  </div>
                  <TotalRow label="Per person" value={fmt(total / details.travelers)} />
                  <TotalRow
                    label={`Deposit (${Math.round(bookingTerms.depositRate * 100)}%)`}
                    value={fmt(deposit)}
                  />
                  <TotalRow label="Balance" value={fmt(total - deposit)} />
                </dl>
                {request?.budget_range ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Client budget: {request.budget_range} per person
                  </p>
                ) : null}
                <div className="mt-5 space-y-2">
                  <Button
                    variant="gold"
                    className="w-full"
                    disabled={save.isPending}
                    onClick={() => save.mutate("sent")}
                  >
                    {quote?.status === "sent" ? "Save changes" : "Send to client"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={save.isPending}
                    onClick={() => save.mutate("draft")}
                  >
                    {quote?.status === "sent" ? "Move back to draft" : "Save as draft"}
                  </Button>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {request?.user_id
                    ? "Sent quotes appear in the client's account, where they can accept or decline."
                    : "This client has no account — once sent, email them the itinerary and total."}
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
