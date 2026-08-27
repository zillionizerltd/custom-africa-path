import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, Panel, StatusBadge, money, shortDate } from "@/components/dashboard/Shell";
import { makeReference } from "@/lib/reference";

export const Route = createFileRoute("/_authenticated/admin/quotes")({
  component: AdminQuotes,
});

const statuses = ["draft", "sent", "accepted", "rejected", "expired"] as const;

function AdminQuotes() {
  const qc = useQueryClient();

  const quotes = useQuery({
    queryKey: ["admin-quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*, safari_requests(reference, full_name, email, start_date, end_date, adults, children)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: (typeof statuses)[number] }) => {
      const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Quote updated");
      void qc.invalidateQueries({ queryKey: ["admin-quotes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-8 space-y-8">
      <div>
        <p className="eyebrow">Quotes</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">Quote management</h1>
      </div>

      <Panel title="All quotes" description="Send, track and convert accepted quotes into bookings.">
        {quotes.data?.length ? (
          <ul className="divide-y divide-border">
            {quotes.data.map((q) => (
              <li key={q.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div className="max-w-2xl">
                  <p className="font-medium text-foreground">
                    {q.reference} · {q.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {money(q.total_amount, q.currency)} · valid until {shortDate(q.valid_until)} ·{" "}
                    {q.safari_requests?.full_name ?? "—"} ({q.safari_requests?.email ?? "—"})
                  </p>
                  {q.summary ? <p className="mt-1 text-sm text-muted-foreground">{q.summary}</p> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={q.status} />
                  <Select
                    value={q.status}
                    onValueChange={(v) => setStatus.mutate({ id: q.id, status: v as (typeof statuses)[number] })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {q.status === "accepted" ? <ConvertDialog quote={q} /> : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No quotes yet — create one from a safari request." />
        )}
      </Panel>
    </div>
  );
}

type QuoteRow = {
  id: string;
  request_id: string | null;
  user_id: string | null;
  title: string;
  currency: string;
  total_amount: number;
  safari_requests?: {
    full_name: string;
    email: string;
    start_date: string | null;
    end_date: string | null;
    adults: number;
    children: number | null;
  } | null;
};

function ConvertDialog({ quote }: { quote: QuoteRow }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const req = quote.safari_requests;
  const [start, setStart] = useState(req?.start_date ?? "");
  const [end, setEnd] = useState(req?.end_date ?? "");
  const [travelers, setTravelers] = useState(String((req?.adults ?? 2) + (req?.children ?? 0)));

  const convert = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("bookings").insert({
        reference: makeReference("BK"),
        user_id: quote.user_id,
        request_id: quote.request_id,
        quote_id: quote.id,
        title: quote.title,
        lead_name: req?.full_name ?? "",
        lead_email: req?.email ?? "",
        start_date: start || null,
        end_date: end || null,
        travelers: Number(travelers || 1),
        currency: quote.currency,
        total_amount: quote.total_amount,
        status: "confirmed",
      });
      if (error) throw error;
      if (quote.request_id) {
        await supabase.from("safari_requests").update({ status: "converted" }).eq("id", quote.request_id);
      }
    },
    onSuccess: () => {
      toast.success("Booking created");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      void qc.invalidateQueries({ queryKey: ["admin-quotes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="gold">
          Convert to booking
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create booking</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="b-start">Start date</Label>
            <Input id="b-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="b-end">End date</Label>
            <Input id="b-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="b-trav">Travellers</Label>
            <Input id="b-trav" type="number" value={travelers} onChange={(e) => setTravelers(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="gold" onClick={() => convert.mutate()} disabled={convert.isPending}>
            {convert.isPending ? "Creating…" : "Create booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
