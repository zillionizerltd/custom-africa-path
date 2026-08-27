import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, Panel, StatusBadge, shortDate } from "@/components/dashboard/Shell";
import { makeReference } from "@/lib/reference";

export const Route = createFileRoute("/_authenticated/admin/requests")({
  component: AdminRequests,
});

const statuses = ["new", "reviewing", "quoted", "converted", "declined"] as const;

function AdminRequests() {
  const qc = useQueryClient();

  const requests = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safari_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: (typeof statuses)[number] }) => {
      const { error } = await supabase.from("safari_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request updated");
      void qc.invalidateQueries({ queryKey: ["admin-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-8 space-y-8">
      <div>
        <p className="eyebrow">Requests</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">Safari requests</h1>
      </div>

      <Panel title="All requests" description="Every enquiry from the site and the safari builder.">
        {requests.data?.length ? (
          <ul className="divide-y divide-border">
            {requests.data.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div className="max-w-2xl">
                  <p className="font-medium text-foreground">
                    {r.reference} · {r.full_name} · {r.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {r.destination_slugs.join(", ") || "Destination TBC"} · {shortDate(r.start_date)} →{" "}
                    {shortDate(r.end_date)} · {r.adults} adults{r.children ? `, ${r.children} children` : ""} ·{" "}
                    {r.budget_range ?? "budget TBC"} · {r.accommodation_level ?? "level TBC"}
                  </p>
                  {r.interests?.length ? (
                    <p className="text-sm text-muted-foreground">Interests: {r.interests.join(", ")}</p>
                  ) : null}
                  {r.notes ? <p className="mt-1 text-sm text-muted-foreground">“{r.notes}”</p> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={r.status} />
                  <Select
                    value={r.status}
                    onValueChange={(v) => setStatus.mutate({ id: r.id, status: v as (typeof statuses)[number] })}
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
                  <NewQuoteDialog
                    requestId={r.id}
                    userId={r.user_id}
                    defaultTitle={`${r.destination_slugs.join(" & ") || "Custom"} safari for ${r.full_name}`}
                  />
                </div>
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

function NewQuoteDialog({
  requestId,
  userId,
  defaultTitle,
}: {
  requestId: string;
  userId: string | null;
  defaultTitle: string;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [summary, setSummary] = useState("");
  const [total, setTotal] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("quotes").insert({
        reference: makeReference("QT"),
        request_id: requestId,
        user_id: userId,
        title,
        summary,
        total_amount: Number(total || 0),
        valid_until: validUntil || null,
        status: "sent",
        created_by: auth.user?.id ?? null,
      });
      if (error) throw error;
      await supabase.from("safari_requests").update({ status: "quoted" }).eq("id", requestId);
    },
    onSuccess: () => {
      toast.success("Quote created and sent");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["admin-requests"] });
      void qc.invalidateQueries({ queryKey: ["admin-quotes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="gold">
          Create quote
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New quote</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="q-title">Title</Label>
            <Input id="q-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-summary">Summary</Label>
            <Textarea id="q-summary" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="q-total">Total (USD)</Label>
              <Input id="q-total" type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-valid">Valid until</Label>
              <Input id="q-valid" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="gold" onClick={() => create.mutate()} disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Send quote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
