import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { DashboardShell, EmptyState, Panel, StatusBadge } from "@/components/dashboard/Shell";
import { QuoteDetailsView } from "@/components/dashboard/QuoteDetails";
import { bookingTerms } from "@/data/site";
import { money, shortDate } from "@/lib/format";
import { countryNames, hasDetails, parseQuoteDetails } from "@/lib/quote";
import { balanceDeadline, balanceOf, timingLabel, tripTiming } from "@/lib/trip";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: CustomerDashboard,
});

type TripSummary = {
  reference: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  status: string;
  currency: string;
  total_amount: number;
  amount_paid: number;
};

function paymentNote(b: TripSummary) {
  const balance = balanceOf(b.total_amount, b.amount_paid);
  if (balance <= 0) return "Paid in full — thank you.";
  if (Number(b.amount_paid) <= 0) {
    return `A ${Math.round(bookingTerms.depositRate * 100)}% deposit secures permits and lodges.`;
  }
  return b.start_date
    ? `${money(balance, b.currency)} balance due by ${shortDate(balanceDeadline(b.start_date))}.`
    : `${money(balance, b.currency)} balance outstanding.`;
}

function NextTrip({ booking }: { booking: TripSummary }) {
  const timing = tripTiming(booking.start_date, booking.end_date);
  const total = Number(booking.total_amount);
  const paid = Number(booking.amount_paid);
  const countdown =
    timing.kind === "upcoming" && timing.days > 1 ? (
      <>
        <span className="font-display text-5xl font-semibold tabular-nums text-accent">
          {timing.days}
        </span>
        <span className="text-sm text-ink-foreground/70">days to go</span>
      </>
    ) : (
      <span className="font-display text-3xl font-semibold text-accent">
        {timing.kind === "ongoing" ? "On safari now" : timingLabel(timing)}
      </span>
    );

  return (
    <section className="surface-ink rounded-2xl p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="eyebrow text-accent">Your next trip</p>
          <h2 className="mt-2 text-2xl text-ink-foreground md:text-3xl">{booking.title}</h2>
          <p className="mt-2 text-sm text-ink-foreground/75">
            {shortDate(booking.start_date)} → {shortDate(booking.end_date)} · {booking.travelers}{" "}
            travellers · {booking.reference}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 md:items-end">{countdown}</div>
      </div>
      <div className="mt-6 max-w-xl">
        <div className="flex justify-between text-sm text-ink-foreground/80">
          <span>
            {money(paid, booking.currency)} paid of {money(total, booking.currency)}
          </span>
          <span className="capitalize">{booking.status.replace("_", " ")}</span>
        </div>
        <Progress
          value={total > 0 ? Math.min(100, (paid / total) * 100) : 0}
          className="mt-2 bg-ink-foreground/15"
        />
        <p className="mt-2 text-sm text-ink-foreground/70">{paymentNote(booking)}</p>
      </div>
    </section>
  );
}

function ConfirmResponse({
  label,
  title,
  description,
  variant,
  disabled,
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  variant: "gold" | "outline";
  disabled: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant={variant} disabled={disabled}>
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{label}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CustomerDashboard() {
  const { user, profile, signOut } = useAuth();
  const qc = useQueryClient();

  const requests = useQuery({
    queryKey: ["my-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safari_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const quotes = useQuery({
    queryKey: ["my-quotes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const bookings = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, payments(*)")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const respond = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "rejected" }) => {
      const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(
        v.status === "accepted"
          ? "Quote accepted — our team will confirm shortly."
          : "Quote declined.",
      );
      void qc.invalidateQueries({ queryKey: ["my-quotes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const next = (bookings.data ?? []).find((b) => {
    if (b.status === "cancelled" || b.status === "completed") return false;
    const kind = tripTiming(b.start_date, b.end_date).kind;
    return kind === "upcoming" || kind === "ongoing";
  });
  const depositPct = Math.round(bookingTerms.depositRate * 100);

  return (
    <DashboardShell
      eyebrow="My account"
      title={`Hello, ${profile?.full_name || user?.email || "traveller"}`}
      description="Track your safari requests, review quotes from our team and follow your confirmed trips."
      actions={
        <div className="flex gap-2">
          <Button asChild variant="gold">
            <Link to="/custom-safari">Plan a new safari</Link>
          </Button>
          <Button variant="outline" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      }
    >
      {next ? <NextTrip booking={next} /> : null}

      <Panel
        title="Quotes"
        description="Review the itinerary and costs, then accept to move to booking."
      >
        {quotes.data?.length ? (
          <ul className="divide-y divide-border">
            {quotes.data.map((q) => {
              const details = parseQuoteDetails(q.items);
              return (
                <li key={q.id} className="py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {q.reference} · {q.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {money(q.total_amount, q.currency)}
                        {hasDetails(details)
                          ? ` · ${money(Number(q.total_amount) / details.travelers, q.currency)} per person`
                          : ""}{" "}
                        · valid until {shortDate(q.valid_until)}
                      </p>
                      {q.summary ? (
                        <p className="mt-1 max-w-xl text-sm text-muted-foreground">{q.summary}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={q.status} />
                      {q.status === "sent" ? (
                        <>
                          <ConfirmResponse
                            label="Accept"
                            variant="gold"
                            title="Accept this quote?"
                            description={`We'll confirm availability and send payment details. A ${depositPct}% deposit secures permits and lodges.`}
                            disabled={respond.isPending}
                            onConfirm={() => respond.mutate({ id: q.id, status: "accepted" })}
                          />
                          <Button asChild size="sm" variant="ghost">
                            <Link
                              to="/contact"
                              search={{ subject: `Changes to quote ${q.reference}` }}
                            >
                              Request changes
                            </Link>
                          </Button>
                          <ConfirmResponse
                            label="Decline"
                            variant="outline"
                            title="Decline this quote?"
                            description="Your consultant can rework it instead — use “Request changes” to tell them what to adjust."
                            disabled={respond.isPending}
                            onConfirm={() => respond.mutate({ id: q.id, status: "rejected" })}
                          />
                        </>
                      ) : null}
                    </div>
                  </div>
                  {hasDetails(details) ? (
                    <Collapsible className="mt-3" defaultOpen={q.status === "sent"}>
                      <CollapsibleTrigger className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        Itinerary &amp; costs
                        <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <QuoteDetailsView details={details} currency={q.currency} />
                      </CollapsibleContent>
                    </Collapsible>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState message="No quotes yet — once a consultant prices your request, it appears here." />
        )}
      </Panel>

      <Panel title="Bookings" description="Confirmed trips, balances and payment history.">
        {bookings.data?.length ? (
          <ul className="divide-y divide-border">
            {bookings.data.map((b) => {
              const timing = tripTiming(b.start_date, b.end_date);
              return (
                <li key={b.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {b.reference} · {b.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {shortDate(b.start_date)} → {shortDate(b.end_date)} · {b.travelers}{" "}
                        travellers · {money(b.amount_paid, b.currency)} paid of{" "}
                        {money(b.total_amount, b.currency)}
                        {timing.kind === "upcoming" && b.status !== "cancelled"
                          ? ` · starts in ${timingLabel(timing).toLowerCase()}`
                          : ""}
                      </p>
                      {b.status !== "cancelled" ? (
                        <p className="text-sm text-muted-foreground">{paymentNote(b)}</p>
                      ) : null}
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  {b.payments?.length ? (
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {b.payments.map((p) => (
                        <li key={p.id}>
                          {shortDate(p.paid_at ?? p.created_at)} · {money(p.amount, p.currency)} ·{" "}
                          {p.method} · {p.status}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState message="No bookings yet." />
        )}
      </Panel>

      <Panel title="Safari requests" description="Everything you have asked us to plan.">
        {requests.data?.length ? (
          <ul className="divide-y divide-border">
            {requests.data.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium text-foreground">
                    {r.reference} · {countryNames(r.destination_slugs) || "Enquiry"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {r.start_date
                      ? `${shortDate(r.start_date)} → ${shortDate(r.end_date)} · ${r.adults} adults${r.children ? `, ${r.children} children` : ""}`
                      : `Received ${shortDate(r.created_at)}`}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No requests yet — build your safari and we'll come back with a quote." />
        )}
      </Panel>
    </DashboardShell>
  );
}
