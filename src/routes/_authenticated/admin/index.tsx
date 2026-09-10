import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { EmptyState, PageTitle, Panel, StatCard, StatusBadge } from "@/components/dashboard/Shell";
import { money, shortDate } from "@/lib/format";
import { countryNames } from "@/lib/quote";
import { leadSource, leadSourceLabel } from "@/lib/reference";
import { balanceAlert, balanceOf, timingLabel, tripTiming } from "@/lib/trip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const stats = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [requests, quotes, bookings, payments] = await Promise.all([
        supabase.from("safari_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("quotes").select("id,status"),
        supabase
          .from("bookings")
          .select(
            "id,reference,title,lead_name,start_date,end_date,travelers,status,total_amount,amount_paid,currency",
          )
          .order("start_date", { ascending: true }),
        supabase.from("payments").select("amount,status"),
      ]);
      return {
        requests: requests.data ?? [],
        quotes: quotes.data ?? [],
        bookings: bookings.data ?? [],
        payments: payments.data ?? [],
      };
    },
  });

  const d = stats.data;
  const leads = d?.requests.filter((r) => leadSource(r.reference) !== "newsletter") ?? [];
  const openRequests = leads.filter((r) => r.status === "new" || r.status === "reviewing").length;
  const pendingQuotes = d?.quotes.filter((q) => q.status === "sent").length ?? 0;
  const activeBookings =
    d?.bookings.filter((b) => b.status === "confirmed" || b.status === "in_progress").length ?? 0;
  const collected =
    d?.payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0) ?? 0;

  const tracked = (d?.bookings ?? [])
    .filter((b) => b.status !== "cancelled")
    .map((b) => ({
      ...b,
      balance: balanceOf(b.total_amount, b.amount_paid),
      timing: tripTiming(b.start_date, b.end_date),
    }));
  const outstanding = tracked.reduce((s, b) => s + b.balance, 0);
  const departures = tracked.filter(
    (b) =>
      b.status !== "completed" &&
      (b.timing.kind === "ongoing" || (b.timing.kind === "upcoming" && b.timing.days <= 60)),
  );
  const departingSoon = departures.filter(
    (b) => b.timing.kind === "upcoming" && b.timing.days <= 30,
  );

  return (
    <div className="mt-8 space-y-8">
      <PageTitle eyebrow="Operations" title="Dashboard overview" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Open requests" value={String(openRequests)} hint="New or under review" />
        <StatCard label="Quotes awaiting reply" value={String(pendingQuotes)} />
        <StatCard
          label="Active bookings"
          value={String(activeBookings)}
          hint="Confirmed or on trip"
        />
        <StatCard label="Payments collected" value={money(collected)} />
        <StatCard
          label="Outstanding balance"
          value={money(outstanding)}
          hint="Across non-cancelled bookings"
        />
        <StatCard label="Departing in 30 days" value={String(departingSoon.length)} />
      </div>

      <Panel
        title="Upcoming departures"
        description="On trip now or starting within 60 days."
        actions={
          <Link to="/admin/bookings" className="text-sm font-medium text-primary hover:underline">
            Open trip tracker
          </Link>
        }
      >
        {departures.length ? (
          <ul className="divide-y divide-border">
            {departures.map((b) => {
              const alert = balanceAlert(b.timing, b.balance);
              return (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {b.reference} · {b.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {b.lead_name || "—"} · {shortDate(b.start_date)} → {shortDate(b.end_date)} ·{" "}
                      {b.travelers} pax
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="outline" className="font-normal tabular-nums">
                      {timingLabel(b.timing)}
                    </Badge>
                    <span
                      className={cn(
                        "tabular-nums",
                        alert === "overdue" && "font-semibold text-destructive",
                        alert === "due-soon" && "font-semibold text-amber-700",
                        !alert && "text-muted-foreground",
                      )}
                    >
                      {b.balance > 0 ? `${money(b.balance, b.currency)} due` : "Paid in full"}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState message="No departures in the next 60 days." />
        )}
      </Panel>

      <Panel
        title="Latest leads"
        actions={
          <Link to="/admin/requests" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        }
      >
        {leads.length ? (
          <ul className="divide-y divide-border">
            {leads.slice(0, 6).map((r) => {
              const source = leadSource(r.reference);
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {r.reference} · {r.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {leadSourceLabel[source]} ·{" "}
                      {source === "builder"
                        ? `${countryNames(r.destination_slugs) || "Destination TBC"} · ${shortDate(r.start_date)} · ${r.adults + (r.children ?? 0)} travellers`
                        : shortDate(r.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState message="No requests yet." />
        )}
      </Panel>
    </div>
  );
}
