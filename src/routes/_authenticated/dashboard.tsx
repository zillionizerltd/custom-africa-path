import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DashboardShell,
  EmptyState,
  Panel,
  StatusBadge,
  money,
  shortDate,
} from "@/components/dashboard/Shell";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: CustomerDashboard,
});

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
      const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
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
        .order("created_at", { ascending: false });
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
      toast.success(v.status === "accepted" ? "Quote accepted — our team will confirm shortly." : "Quote declined.");
      void qc.invalidateQueries({ queryKey: ["my-quotes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardShell
      eyebrow="My account"
      title={`Hello, ${profile?.full_name ?? user?.email ?? "traveller"}`}
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
      <Panel title="Safari requests" description="Everything you have asked us to plan.">
        {requests.data?.length ? (
          <ul className="divide-y divide-border">
            {requests.data.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium text-foreground">
                    {r.reference} · {r.destination_slugs.join(", ") || "Destination TBC"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shortDate(r.start_date)} → {shortDate(r.end_date)} · {r.adults} adults
                    {r.children ? `, ${r.children} children` : ""}
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

      <Panel title="Quotes" description="Accept a quote to move it to booking.">
        {quotes.data?.length ? (
          <ul className="divide-y divide-border">
            {quotes.data.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium text-foreground">
                    {q.reference} · {q.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {money(q.total_amount, q.currency)} · valid until {shortDate(q.valid_until)}
                  </p>
                  {q.summary ? <p className="mt-1 max-w-xl text-sm text-muted-foreground">{q.summary}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={q.status} />
                  {q.status === "sent" ? (
                    <>
                      <Button size="sm" variant="gold" onClick={() => respond.mutate({ id: q.id, status: "accepted" })}>
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respond.mutate({ id: q.id, status: "rejected" })}
                      >
                        Decline
                      </Button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No quotes yet." />
        )}
      </Panel>

      <Panel title="Bookings" description="Confirmed trips and payment history.">
        {bookings.data?.length ? (
          <ul className="divide-y divide-border">
            {bookings.data.map((b) => (
              <li key={b.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {b.reference} · {b.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {shortDate(b.start_date)} → {shortDate(b.end_date)} · {b.travelers} travellers ·{" "}
                      {money(b.amount_paid, b.currency)} paid of {money(b.total_amount, b.currency)}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                {b.payments?.length ? (
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {b.payments.map((p) => (
                      <li key={p.id}>
                        {shortDate(p.paid_at ?? p.created_at)} · {money(p.amount, p.currency)} · {p.method ?? "—"} ·{" "}
                        {p.status}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No bookings yet." />
        )}
      </Panel>
    </DashboardShell>
  );
}
