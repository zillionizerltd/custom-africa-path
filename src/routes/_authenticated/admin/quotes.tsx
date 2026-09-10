import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { money, shortDate } from "@/lib/format";
import { hasDetails, parseQuoteDetails, quoteEndDate, type QuoteDetails } from "@/lib/quote";
import { makeReference } from "@/lib/reference";
import { todayISO } from "@/lib/trip";

export const Route = createFileRoute("/_authenticated/admin/quotes")({
  component: AdminQuotes,
});

const statuses = ["draft", "sent", "accepted", "rejected", "expired"] as const;
const EDITABLE = new Set<string>(["draft", "sent", "expired"]);

function AdminQuotes() {
  const qc = useQueryClient();

  const quotes = useQuery({
    queryKey: ["admin-quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select(
          "*, safari_requests(reference, full_name, email, start_date, end_date, adults, children), bookings(id, reference)",
        )
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

  const today = todayISO();

  return (
    <div className="mt-8 space-y-8">
      <PageTitle
        eyebrow="Quotes"
        title="Quote management"
        description="Build quotes from requests, track replies and convert accepted quotes into bookings."
      />

      <Panel title="All quotes">
        {quotes.data?.length ? (
          <ul className="divide-y divide-border">
            {quotes.data.map((q) => {
              const details = parseQuoteDetails(q.items);
              const planned = hasDetails(details);
              const lapsed = q.status === "sent" && q.valid_until !== null && q.valid_until < today;
              const booking = q.bookings[0];
              return (
                <li key={q.id} className="py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <p className="font-medium text-foreground">
                        {q.reference} · {q.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {money(q.total_amount, q.currency)}
                        {planned
                          ? ` · ${money(Number(q.total_amount) / details.travelers, q.currency)} pp · ${details.travelers} travellers`
                          : ""}{" "}
                        · valid until {shortDate(q.valid_until)}
                        {lapsed ? (
                          <span className="font-medium text-amber-700"> (lapsed)</span>
                        ) : null}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {q.safari_requests?.full_name ?? "—"} ({q.safari_requests?.email ?? "—"})
                        {details.consultant ? ` · Consultant: ${details.consultant}` : ""}
                      </p>
                      {q.summary ? (
                        <p className="mt-1 text-sm text-muted-foreground">{q.summary}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={q.status} />
                      <Select
                        value={q.status}
                        onValueChange={(v) =>
                          setStatus.mutate({ id: q.id, status: v as (typeof statuses)[number] })
                        }
                      >
                        <SelectTrigger className="w-32" aria-label={`Status for ${q.reference}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {EDITABLE.has(q.status) ? (
                        <Button asChild size="sm" variant="outline">
                          <Link to="/admin/quote-builder" search={{ quote: q.id }}>
                            Edit
                          </Link>
                        </Button>
                      ) : null}
                      {booking ? (
                        <Button asChild size="sm" variant="ghost">
                          <Link to="/admin/bookings">Booked · {booking.reference}</Link>
                        </Button>
                      ) : q.status === "accepted" ? (
                        <ConvertDialog quote={q} details={details} />
                      ) : null}
                    </div>
                  </div>
                  {planned ? (
                    <Collapsible className="mt-3">
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
          <EmptyState message="No quotes yet — build one from a safari request." />
        )}
      </Panel>
    </div>
  );
}

type ConvertibleQuote = {
  id: string;
  request_id: string | null;
  user_id: string | null;
  title: string;
  currency: string;
  total_amount: number;
  safari_requests: {
    full_name: string;
    email: string;
    start_date: string | null;
    end_date: string | null;
    adults: number;
    children: number | null;
  } | null;
};

function ConvertDialog({ quote, details }: { quote: ConvertibleQuote; details: QuoteDetails }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const req = quote.safari_requests;
  const planned = hasDetails(details);
  const [start, setStart] = useState(details.startDate || req?.start_date || "");
  const [end, setEnd] = useState(quoteEndDate(details) || req?.end_date || "");
  const [travelers, setTravelers] = useState(
    planned ? details.travelers : (req?.adults ?? 2) + (req?.children ?? 0),
  );
  // Terms: a booking is confirmed once the deposit lands.
  const [status, setStatus] = useState<"pending" | "confirmed">("pending");

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
        travelers,
        currency: quote.currency,
        total_amount: quote.total_amount,
        status,
      });
      if (error) throw error;
      if (quote.request_id) {
        await supabase
          .from("safari_requests")
          .update({ status: "converted" })
          .eq("id", quote.request_id);
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
          <DialogDescription>
            {quote.title} · {money(quote.total_amount, quote.currency)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="b-start">Start date</Label>
            <Input
              id="b-start"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="b-end">End date</Label>
            <Input
              id="b-end"
              type="date"
              min={start}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="b-trav">Travellers</Label>
            <Stepper
              id="b-trav"
              label="travellers"
              value={travelers}
              min={1}
              max={60}
              onChange={setTravelers}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="b-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "pending" | "confirmed")}>
              <SelectTrigger id="b-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending — awaiting deposit</SelectItem>
                <SelectItem value="confirmed">Confirmed — deposit received</SelectItem>
              </SelectContent>
            </Select>
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
