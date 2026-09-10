import { Fragment, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Plus, Search, UserPlus, Wallet } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stepper } from "@/components/site/Stepper";
import { EmptyState, PageTitle, Panel, StatCard } from "@/components/dashboard/Shell";
import { bookingTerms, paymentMethods } from "@/data/site";
import { packageOptionsQuery } from "@/lib/admin-queries";
import { money, shortDate } from "@/lib/format";
import { parseQuoteDetails } from "@/lib/quote";
import { makeReference } from "@/lib/reference";
import { statusClass, statusLabel } from "@/lib/status";
import {
  addDays,
  balanceAlert,
  balanceDeadline,
  balanceOf,
  timingLabel,
  tripTiming,
  type TripTiming,
} from "@/lib/trip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: AdminBookings,
});

const statuses = ["pending", "confirmed", "in_progress", "completed", "cancelled"] as const;
type BookingStatus = (typeof statuses)[number];

async function fetchBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, payments(*), assignments(*, guides(full_name), vehicles(name)), quotes(items)")
    .order("start_date", { ascending: true });
  if (error) throw error;
  return data;
}

type Booking = Awaited<ReturnType<typeof fetchBookings>>[number];
type TrackedBooking = Booking & {
  total: number;
  paid: number;
  balance: number;
  timing: TripTiming;
  consultant: string;
};

// On trip first, then soonest departures, undated, and finally past trips (most recent first).
const timelineRank: Record<TripTiming["kind"], number> = {
  ongoing: 0,
  upcoming: 1,
  unscheduled: 2,
  past: 3,
};

function byTimeline(a: TrackedBooking, b: TrackedBooking) {
  const rank = timelineRank[a.timing.kind] - timelineRank[b.timing.kind];
  if (rank !== 0) return rank;
  const order = (a.start_date ?? "").localeCompare(b.start_date ?? "");
  return a.timing.kind === "past" ? -order : order;
}

function track(b: Booking): TrackedBooking {
  const total = Number(b.total_amount);
  const paid = Number(b.amount_paid);
  return {
    ...b,
    total,
    paid,
    balance: balanceOf(total, paid),
    timing: tripTiming(b.start_date, b.end_date),
    consultant: b.quotes ? parseQuoteDetails(b.quotes.items).consultant : "",
  };
}

async function recordPayment(input: {
  bookingId: string;
  currentPaid: number;
  currency: string;
  amount: number;
  method: string;
  reference: string;
}) {
  if (!(input.amount > 0)) throw new Error("Enter an amount above zero.");
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("payments").insert({
    booking_id: input.bookingId,
    amount: input.amount,
    currency: input.currency,
    method: input.method,
    reference: input.reference.trim() || null,
    status: "paid",
    paid_at: new Date().toISOString(),
    recorded_by: auth.user?.id ?? null,
  });
  if (error) throw error;
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ amount_paid: input.currentPaid + input.amount })
    .eq("id", input.bookingId);
  if (updateError) throw updateError;
}

function AdminBookings() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"all" | BookingStatus>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [dialog, setDialog] = useState<{
    kind: "payment" | "crew";
    booking: TrackedBooking;
  } | null>(null);
  const [creating, setCreating] = useState(false);

  const bookings = useQuery({ queryKey: ["admin-bookings"], queryFn: fetchBookings });
  const guides = useQuery({
    queryKey: ["guides"],
    queryFn: async () => (await supabase.from("guides").select("*").eq("active", true)).data ?? [],
  });
  const vehicles = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () =>
      (await supabase.from("vehicles").select("*").eq("active", true)).data ?? [],
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking updated");
      void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const rows = (bookings.data ?? []).map(track).sort(byTimeline);
  const q = query.trim().toLowerCase();
  const visible = rows.filter(
    (b) =>
      (tab === "all" || b.status === tab) &&
      (!q ||
        [b.reference, b.lead_name, b.lead_email, b.title].some((v) => v.toLowerCase().includes(q))),
  );
  // Cancelled trips stay listed but don't count towards value or balances.
  const counted = visible.filter((b) => b.status !== "cancelled");
  const totals = counted.reduce(
    (t, b) => ({ total: t.total + b.total, paid: t.paid + b.paid, balance: t.balance + b.balance }),
    { total: 0, paid: 0, balance: 0 },
  );
  const needingAttention = counted.filter((b) => balanceAlert(b.timing, b.balance) !== null).length;
  const countFor = (s: "all" | BookingStatus) =>
    s === "all" ? rows.length : rows.filter((b) => b.status === s).length;
  const depositPct = Math.round(bookingTerms.depositRate * 100);

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          eyebrow="Bookings"
          title="Trip tracker"
          description="Every booking with balances, countdowns and crew in one table."
        />
        <Button variant="gold" onClick={() => setCreating(true)}>
          <Plus /> New booking
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Booking value"
          value={money(totals.total)}
          hint={`${counted.length} bookings in view`}
        />
        <StatCard label="Collected" value={money(totals.paid)} />
        <StatCard label="Balance outstanding" value={money(totals.balance)} />
        <StatCard
          label="Balances needing attention"
          value={String(needingAttention)}
          hint={`Balance is due ${bookingTerms.balanceDueDays} days before arrival`}
        />
      </div>

      <Panel
        title="Bookings"
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ID, client or trip"
              aria-label="Search bookings"
              className="pl-9"
            />
          </div>
        }
      >
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "all" | BookingStatus)}
          className="mb-4"
        >
          <TabsList className="h-auto flex-wrap justify-start">
            <TabsTrigger value="all">All ({countFor("all")})</TabsTrigger>
            {statuses.map((s) => (
              <TabsTrigger key={s} value={s} className="capitalize">
                {statusLabel(s)} ({countFor(s)})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {bookings.isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading bookings…</p>
        ) : visible.length ? (
          <>
            <div className="rounded-lg border border-border">
              <Table className="min-w-6xl">
                <TableHeader>
                  <TableRow className="bg-muted/60 hover:bg-muted/60">
                    <TableHead className="w-8">
                      <span className="sr-only">Details</span>
                    </TableHead>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Trip</TableHead>
                    <TableHead>Travel dates</TableHead>
                    <TableHead className="text-right">Pax</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Starts in</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Consultant</TableHead>
                    <TableHead className="w-20">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((b, i) => {
                    const open = expanded.has(b.id);
                    const cancelled = b.status === "cancelled";
                    const alert = cancelled ? null : balanceAlert(b.timing, b.balance);
                    return (
                      <Fragment key={b.id}>
                        <TableRow
                          className={cn(
                            i % 2 === 1 && "bg-muted/25",
                            cancelled && "text-muted-foreground",
                          )}
                        >
                          <TableCell>
                            <button
                              type="button"
                              aria-expanded={open}
                              aria-label={
                                open
                                  ? `Hide details for ${b.reference}`
                                  : `Show details for ${b.reference}`
                              }
                              onClick={() => toggleExpanded(b.id)}
                              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                            >
                              {open ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium">
                            {b.reference}
                          </TableCell>
                          <TableCell>
                            <span className="block font-medium">{b.lead_name || "—"}</span>
                            <span className="block text-xs text-muted-foreground">
                              {b.lead_email}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-56">
                            <span className="line-clamp-2">{b.title}</span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {shortDate(b.start_date)} → {shortDate(b.end_date)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{b.travelers}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {money(b.total, b.currency)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {money(b.paid, b.currency)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right tabular-nums",
                              alert === "overdue" && "font-semibold text-destructive",
                              alert === "due-soon" && "font-semibold text-amber-700",
                            )}
                          >
                            {money(b.balance, b.currency)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap tabular-nums">
                            {cancelled ? "—" : timingLabel(b.timing)}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={b.status}
                              onValueChange={(v) =>
                                setStatus.mutate({ id: b.id, status: v as BookingStatus })
                              }
                            >
                              <SelectTrigger
                                className={cn(
                                  "h-8 w-34 border-transparent capitalize",
                                  statusClass(b.status),
                                )}
                                aria-label={`Status for ${b.reference}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map((s) => (
                                  <SelectItem key={s} value={s} className="capitalize">
                                    {statusLabel(s)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{b.consultant || "—"}</TableCell>
                          <TableCell>
                            <div className="flex">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Record payment"
                                aria-label={`Record payment for ${b.reference}`}
                                onClick={() => setDialog({ kind: "payment", booking: b })}
                              >
                                <Wallet />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Assign crew"
                                aria-label={`Assign crew for ${b.reference}`}
                                onClick={() => setDialog({ kind: "crew", booking: b })}
                              >
                                <UserPlus />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {open ? (
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableCell />
                            <TableCell colSpan={12} className="py-4">
                              <div className="grid gap-6 text-sm md:grid-cols-3">
                                <div>
                                  <p className="font-medium">Payments</p>
                                  {b.payments.length ? (
                                    <ul className="mt-2 space-y-1 text-muted-foreground">
                                      {b.payments.map((p) => (
                                        <li key={p.id}>
                                          {shortDate(p.paid_at ?? p.created_at)} ·{" "}
                                          {money(p.amount, p.currency)} · {p.method}
                                          {p.reference ? ` · ${p.reference}` : ""} · {p.status}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="mt-2 text-muted-foreground">
                                      No payments recorded yet.
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">Crew</p>
                                  {b.assignments.length ? (
                                    <ul className="mt-2 space-y-1 text-muted-foreground">
                                      {b.assignments.map((a) => (
                                        <li key={a.id}>
                                          {a.guides?.full_name ?? "Guide TBC"} ·{" "}
                                          {a.vehicles?.name ?? "Vehicle TBC"} ·{" "}
                                          {a.status.replace("_", " ")}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="mt-2 text-muted-foreground">Not assigned yet.</p>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">Payment schedule</p>
                                  <p className="mt-2 text-muted-foreground">
                                    Deposit ({depositPct}%):{" "}
                                    {money(
                                      Math.round(b.total * bookingTerms.depositRate),
                                      b.currency,
                                    )}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {b.start_date
                                      ? `Balance due by ${shortDate(balanceDeadline(b.start_date))}`
                                      : "Add travel dates to schedule the balance."}
                                  </p>
                                  {b.notes ? (
                                    <p className="mt-2 whitespace-pre-line">{b.notes}</p>
                                  ) : null}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="font-semibold">
                      Totals{" "}
                      <span className="font-normal text-muted-foreground">
                        · excluding cancelled
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {money(totals.total)}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {money(totals.paid)}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {money(totals.balance)}
                    </TableCell>
                    <TableCell colSpan={4} />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500" /> Confirmed / completed
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-amber-500" /> Pending
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-destructive" /> Cancelled
              </span>
              <span>
                <span className="font-semibold text-amber-700">Amber balance</span> — due within 14
                days
              </span>
              <span>
                <span className="font-semibold text-destructive">Red balance</span> — past the{" "}
                {bookingTerms.balanceDueDays}-day deadline
              </span>
            </div>
          </>
        ) : (
          <EmptyState
            message={rows.length ? "No bookings match these filters." : "No bookings yet."}
          />
        )}
      </Panel>

      {dialog?.kind === "payment" ? (
        <PaymentDialog booking={dialog.booking} onClose={() => setDialog(null)} />
      ) : null}
      {dialog?.kind === "crew" ? (
        <AssignDialog
          booking={dialog.booking}
          guides={guides.data ?? []}
          vehicles={vehicles.data ?? []}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {creating ? <NewBookingDialog onClose={() => setCreating(false)} /> : null}
    </div>
  );
}

function PaymentDialog({ booking, onClose }: { booking: TrackedBooking; onClose: () => void }) {
  const qc = useQueryClient();
  // Suggest the deposit for a first payment, otherwise whatever is left.
  const suggested =
    booking.paid === 0
      ? Math.min(booking.balance, Math.round(booking.total * bookingTerms.depositRate))
      : booking.balance;
  const [amount, setAmount] = useState(suggested > 0 ? String(suggested) : "");
  const [method, setMethod] = useState<string>(paymentMethods[0] ?? "Bank transfer");
  const [reference, setReference] = useState("");
  const value = Number(amount);
  const over = value > booking.balance ? value - booking.balance : 0;

  const record = useMutation({
    mutationFn: () =>
      recordPayment({
        bookingId: booking.id,
        currentPaid: booking.paid,
        currency: booking.currency,
        amount: value,
        method,
        reference,
      }),
    onSuccess: () => {
      toast.success("Payment recorded");
      void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            {booking.reference} · {money(booking.paid, booking.currency)} paid of{" "}
            {money(booking.total, booking.currency)} · balance{" "}
            {money(booking.balance, booking.currency)}
          </DialogDescription>
        </DialogHeader>
        <form
          id="payment-form"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            record.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="p-amount">Amount ({booking.currency})</Label>
            <Input
              id="p-amount"
              type="number"
              min={1}
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {over > 0 ? (
              <p className="text-xs text-amber-700">
                This is {money(over, booking.currency)} more than the balance.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-method">Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="p-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-ref">Transaction reference</Label>
            <Input
              id="p-ref"
              placeholder="Bank ref, mobile money ID or receipt number"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="payment-form"
            variant="gold"
            disabled={record.isPending || !(value > 0)}
          >
            {record.isPending ? "Saving…" : "Save payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({
  booking,
  guides,
  vehicles,
  onClose,
}: {
  booking: TrackedBooking;
  guides: { id: string; full_name: string }[];
  vehicles: { id: string; name: string }[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [guideId, setGuideId] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const assign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("assignments").insert({
        booking_id: booking.id,
        guide_id: guideId || null,
        vehicle_id: vehicleId || null,
        start_date: booking.start_date,
        end_date: booking.end_date,
        status: "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Crew assigned");
      void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign guide &amp; vehicle</DialogTitle>
          <DialogDescription>
            {booking.reference} · {shortDate(booking.start_date)} → {shortDate(booking.end_date)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="a-guide">Guide</Label>
            <Select value={guideId} onValueChange={setGuideId}>
              <SelectTrigger id="a-guide">
                <SelectValue placeholder="Select a guide" />
              </SelectTrigger>
              <SelectContent>
                {guides.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-vehicle">Vehicle</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger id="a-vehicle">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="gold"
            onClick={() => assign.mutate()}
            disabled={assign.isPending || (!guideId && !vehicleId)}
          >
            Save assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Direct bookings (walk-ins, phone bookings, fixed packages) that skip the quote step. */
function NewBookingDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const packages = useQuery(packageOptionsQuery);

  const [packageId, setPackageId] = useState("custom");
  const [title, setTitle] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [manualTotal, setManualTotal] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "confirmed">("pending");
  const [deposit, setDeposit] = useState("");
  const [method, setMethod] = useState<string>(paymentMethods[0] ?? "Bank transfer");

  const pkg = packages.data?.find((p) => p.id === packageId);
  const currency = pkg?.currency ?? "USD";
  // Package price × travellers until the total is typed over by hand.
  const autoTotal = pkg ? Number(pkg.price_from) * travelers : null;
  const total = manualTotal ?? (autoTotal !== null ? String(autoTotal) : "");
  const endDate = end || (pkg && start ? addDays(start, pkg.days - 1) : "");

  const create = useMutation({
    mutationFn: async () => {
      const amount = Number(total);
      const email = leadEmail.trim().toLowerCase();
      if (!leadName.trim() || !email) throw new Error("Add the client's name and email.");
      if (!title.trim()) throw new Error("Give the trip a title.");
      if (!(amount > 0)) throw new Error("Enter the booking total.");
      // Link the booking to the client's account when one exists, so it shows in their dashboard.
      const { data: account } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .limit(1)
        .maybeSingle();
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          reference: makeReference("BK"),
          user_id: account?.id ?? null,
          package_id: pkg?.id ?? null,
          title: title.trim(),
          lead_name: leadName.trim(),
          lead_email: email,
          start_date: start || null,
          end_date: endDate || null,
          travelers,
          currency,
          total_amount: amount,
          status,
        })
        .select("id")
        .single();
      if (error) throw error;
      const paidNow = Number(deposit);
      if (paidNow > 0) {
        await recordPayment({
          bookingId: data.id,
          currentPaid: 0,
          currency,
          amount: paidNow,
          method,
          reference: "",
        });
      }
    },
    onSuccess: () => {
      toast.success("Booking created");
      void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New booking</DialogTitle>
          <DialogDescription>
            For bookings that skip the quote step. Pick a package to pull in its price
            automatically.
          </DialogDescription>
        </DialogHeader>
        <form
          id="booking-form"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nb-package">Package</Label>
            <Select
              value={packageId}
              onValueChange={(v) => {
                setPackageId(v);
                setManualTotal(null);
                setEnd("");
                const next = packages.data?.find((p) => p.id === v);
                if (next) setTitle(next.title);
              }}
            >
              <SelectTrigger id="nb-package">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom trip (no package)</SelectItem>
                {(packages.data ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title} · {money(p.price_from, p.currency)} pp
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nb-title">Trip title</Label>
            <Input
              id="nb-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb-name">Client name</Label>
            <Input
              id="nb-name"
              required
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb-email">Client email</Label>
            <Input
              id="nb-email"
              type="email"
              required
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb-start">Start date</Label>
            <Input
              id="nb-start"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb-end">End date</Label>
            <Input
              id="nb-end"
              type="date"
              min={start}
              value={endDate}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb-travellers">Travellers</Label>
            <Stepper
              id="nb-travellers"
              label="travellers"
              value={travelers}
              min={1}
              max={60}
              onChange={setTravelers}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb-total">Total ({currency})</Label>
            <Input
              id="nb-total"
              type="number"
              min={1}
              step="any"
              required
              value={total}
              onChange={(e) => setManualTotal(e.target.value)}
            />
            {autoTotal !== null ? (
              manualTotal === null ? (
                <p className="text-xs text-muted-foreground">
                  {money(Number(pkg?.price_from), currency)} × {travelers} travellers
                </p>
              ) : (
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => setManualTotal(null)}
                >
                  Reset to package price × travellers
                </button>
              )
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "pending" | "confirmed")}>
              <SelectTrigger id="nb-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending — awaiting deposit</SelectItem>
                <SelectItem value="confirmed">Confirmed — deposit received</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb-deposit">Deposit received now (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="nb-deposit"
                type="number"
                min={0}
                step="any"
                placeholder={
                  total ? String(Math.round(Number(total) * bookingTerms.depositRate)) : "0"
                }
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
              />
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-40" aria-label="Deposit method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            If the client has an account with this email, the booking appears in their dashboard.
          </p>
        </form>
        <DialogFooter>
          <Button type="submit" form="booking-form" variant="gold" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
