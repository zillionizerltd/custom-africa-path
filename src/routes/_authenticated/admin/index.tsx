import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Panel, StatusBadge, money, shortDate } from "@/components/dashboard/Shell";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const stats = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [requests, quotes, bookings, payments] = await Promise.all([
        supabase.from("safari_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("quotes").select("id,status,total_amount,currency"),
        supabase.from("bookings").select("id,status,total_amount,amount_paid,currency"),
        supabase.from("payments").select("amount,currency,status"),
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
  const openRequests = d?.requests.filter((r) => r.status === "new" || r.status === "reviewing").length ?? 0;
  const pendingQuotes = d?.quotes.filter((q) => q.status === "sent").length ?? 0;
  const activeBookings = d?.bookings.filter((b) => b.status === "confirmed" || b.status === "in_progress").length ?? 0;
  const collected = d?.payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0) ?? 0;

  const cards = [
    { label: "Open requests", value: String(openRequests) },
    { label: "Quotes awaiting reply", value: String(pendingQuotes) },
    { label: "Active bookings", value: String(activeBookings) },
    { label: "Payments collected", value: money(collected) },
  ];

  return (
    <div className="mt-8 space-y-8">
      <div>
        <p className="eyebrow">Operations</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">Dashboard overview</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <Panel
        title="Latest safari requests"
        actions={
          <Link to="/admin/requests" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        }
      >
        {d?.requests.length ? (
          <ul className="divide-y divide-border">
            {d.requests.slice(0, 6).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-foreground">
                    {r.reference} · {r.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {r.destination_slugs.join(", ") || "Destination TBC"} · {shortDate(r.start_date)} ·{" "}
                    {r.adults + (r.children ?? 0)} travellers
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No requests yet." />
        )}
      </Panel>
    </div>
  );
}
