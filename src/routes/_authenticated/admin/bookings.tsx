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

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: AdminBookings,
});

const statuses = ["pending", "confirmed", "in_progress", "completed", "cancelled"] as const;

function AdminBookings() {
  const qc = useQueryClient();

  const bookings = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, payments(*), assignments(*, guides(full_name), vehicles(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const guides = useQuery({
    queryKey: ["guides"],
    queryFn: async () => (await supabase.from("guides").select("*").eq("active", true)).data ?? [],
  });

  const vehicles = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => (await supabase.from("vehicles").select("*").eq("active", true)).data ?? [],
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: (typeof statuses)[number] }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking updated");
      void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-8 space-y-8">
      <div>
        <p className="eyebrow">Bookings</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">Bookings & payments</h1>
      </div>

      <Panel title="All bookings">
        {bookings.data?.length ? (
          <ul className="divide-y divide-border">
            {bookings.data.map((b) => (
              <li key={b.id} className="py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {b.reference} · {b.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {b.lead_name} ({b.lead_email}) · {shortDate(b.start_date)} → {shortDate(b.end_date)} ·{" "}
                      {b.travelers} travellers
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {money(b.amount_paid, b.currency)} paid of {money(b.total_amount, b.currency)}
                    </p>
                    {b.assignments?.length ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Crew:{" "}
                        {b.assignments
                          .map((a) => `${a.guides?.full_name ?? "Guide TBC"} / ${a.vehicles?.name ?? "Vehicle TBC"}`)
                          .join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={b.status} />
                    <Select
                      value={b.status}
                      onValueChange={(v) => setStatus.mutate({ id: b.id, status: v as (typeof statuses)[number] })}
                    >
                      <SelectTrigger className="w-36">
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
                    <PaymentDialog bookingId={b.id} paid={Number(b.amount_paid)} currency={b.currency} />
                    <AssignDialog
                      bookingId={b.id}
                      start={b.start_date}
                      end={b.end_date}
                      guides={guides.data ?? []}
                      vehicles={vehicles.data ?? []}
                    />
                  </div>
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
    </div>
  );
}

function PaymentDialog({ bookingId, paid, currency }: { bookingId: string; paid: number; currency: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank transfer");
  const [reference, setReference] = useState("");

  const record = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const value = Number(amount || 0);
      const { error } = await supabase.from("payments").insert({
        booking_id: bookingId,
        amount: value,
        currency,
        method,
        reference,
        status: "paid",
        paid_at: new Date().toISOString(),
        recorded_by: auth.user?.id ?? null,
      });
      if (error) throw error;
      const { error: upErr } = await supabase
        .from("bookings")
        .update({ amount_paid: paid + value })
        .eq("id", bookingId);
      if (upErr) throw upErr;
    },
    onSuccess: () => {
      toast.success("Payment recorded");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Record payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-amount">Amount ({currency})</Label>
            <Input id="p-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-method">Method</Label>
            <Input id="p-method" value={method} onChange={(e) => setMethod(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-ref">Transaction reference</Label>
            <Input id="p-ref" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="gold" onClick={() => record.mutate()} disabled={record.isPending}>
            Save payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({
  bookingId,
  start,
  end,
  guides,
  vehicles,
}: {
  bookingId: string;
  start: string | null;
  end: string | null;
  guides: { id: string; full_name: string }[];
  vehicles: { id: string; name: string }[];
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [guideId, setGuideId] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const assign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("assignments").insert({
        booking_id: bookingId,
        guide_id: guideId || null,
        vehicle_id: vehicleId || null,
        start_date: start,
        end_date: end,
        status: "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Crew assigned");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Assign crew
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign guide & vehicle</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Guide</Label>
            <Select value={guideId} onValueChange={setGuideId}>
              <SelectTrigger>
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
            <Label>Vehicle</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
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
          <Button variant="gold" onClick={() => assign.mutate()} disabled={assign.isPending}>
            Save assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
