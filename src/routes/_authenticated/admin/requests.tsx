import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageTitle, Panel, StatusBadge } from "@/components/dashboard/Shell";
import { shortDate } from "@/lib/format";
import { countryNames } from "@/lib/quote";
import { leadSource, leadSourceLabel, type LeadSource } from "@/lib/reference";

export const Route = createFileRoute("/_authenticated/admin/requests")({
  component: AdminRequests,
});

const statuses = ["new", "reviewing", "quoted", "converted", "declined"] as const;
type Status = (typeof statuses)[number];
type SourceFilter = "all" | Exclude<LeadSource, "newsletter">;

function AdminRequests() {
  const qc = useQueryClient();
  const [source, setSource] = useState<SourceFilter>("all");
  const [status, setStatus] = useState<"all" | Status>("all");

  const requests = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safari_requests")
        .select("*, quotes(id, reference, status)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("safari_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request updated");
      void qc.invalidateQueries({ queryKey: ["admin-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const all = requests.data ?? [];
  const leads = all.filter((r) => leadSource(r.reference) !== "newsletter");
  const count = (s: SourceFilter) =>
    s === "all" ? leads.length : leads.filter((r) => leadSource(r.reference) === s).length;
  const visible = leads.filter(
    (r) =>
      (source === "all" || leadSource(r.reference) === source) &&
      (status === "all" || r.status === status),
  );

  const subscribers = [
    ...new Map(
      all
        .filter((r) => leadSource(r.reference) === "newsletter")
        .map((r) => [r.email.toLowerCase(), r] as const),
    ).values(),
  ];

  const copyEmails = () => {
    navigator.clipboard.writeText(subscribers.map((s) => s.email).join(", ")).then(
      () => toast.success(`Copied ${subscribers.length} email addresses`),
      () => toast.error("Couldn't access the clipboard"),
    );
  };

  return (
    <div className="mt-8 space-y-8">
      <PageTitle
        eyebrow="Requests"
        title="Leads & safari requests"
        description="Every enquiry from the safari builder and the contact form. Build a quote straight from a request."
      />

      <Panel
        title="Leads"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={source} onValueChange={(v) => setSource(v as SourceFilter)}>
              <TabsList>
                <TabsTrigger value="all">All ({count("all")})</TabsTrigger>
                <TabsTrigger value="builder">Builder ({count("builder")})</TabsTrigger>
                <TabsTrigger value="enquiry">Enquiries ({count("enquiry")})</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={status} onValueChange={(v) => setStatus(v as "all" | Status)}>
              <SelectTrigger className="h-9 w-36" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        {requests.isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading requests…</p>
        ) : visible.length ? (
          <ul className="divide-y divide-border">
            {visible.map((r) => {
              const kind = leadSource(r.reference);
              const quote = r.quotes[0];
              return (
                <li key={r.id} className="flex flex-wrap items-start justify-between gap-4 py-5">
                  <div className="min-w-0 max-w-2xl space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-normal">
                        {leadSourceLabel[kind]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {r.reference} · received {shortDate(r.created_at)}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">{r.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      <a href={`mailto:${r.email}`} className="hover:text-primary hover:underline">
                        {r.email}
                      </a>
                      {r.phone ? (
                        <>
                          {" · "}
                          <a
                            href={`tel:${r.phone.replace(/\s/g, "")}`}
                            className="hover:text-primary hover:underline"
                          >
                            {r.phone}
                          </a>
                        </>
                      ) : null}
                      {r.country ? ` · ${r.country}` : ""}
                    </p>
                    {kind === "builder" ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          {countryNames(r.destination_slugs) || "Destination TBC"} ·{" "}
                          {shortDate(r.start_date)} → {shortDate(r.end_date)} · {r.adults} adults
                          {r.children ? `, ${r.children} children` : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {r.budget_range ? `${r.budget_range} pp` : "Budget TBC"} ·{" "}
                          {r.accommodation_level ?? "Level TBC"}
                          {r.transport.length ? ` · ${r.transport.join(", ")}` : ""}
                        </p>
                        {r.interests.length ? (
                          <p className="text-sm text-muted-foreground">
                            Interests: {r.interests.join(", ")}
                          </p>
                        ) : null}
                      </>
                    ) : null}
                    {r.notes ? (
                      <p className="mt-2 whitespace-pre-line rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground/85">
                        {r.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={r.status} />
                    <Select
                      value={r.status}
                      onValueChange={(v) => updateStatus.mutate({ id: r.id, status: v as Status })}
                    >
                      <SelectTrigger className="w-36" aria-label={`Status for ${r.reference}`}>
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
                    {quote ? (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/admin/quote-builder" search={{ quote: quote.id }}>
                          Open {quote.reference}
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="gold">
                        <Link to="/admin/quote-builder" search={{ request: r.id }}>
                          Build quote
                        </Link>
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState message="No requests match these filters." />
        )}
      </Panel>

      <Panel
        title="Newsletter subscribers"
        description="Sign-ups from the website footer, one row per email address."
        actions={
          subscribers.length ? (
            <Button size="sm" variant="outline" onClick={copyEmails}>
              <Copy className="size-4" /> Copy all emails
            </Button>
          ) : null
        }
      >
        {subscribers.length ? (
          <ul className="flex flex-wrap gap-2">
            {subscribers.map((s) => (
              <li key={s.id} className="rounded-full border border-border px-3 py-1 text-sm">
                {s.email}{" "}
                <span className="text-xs text-muted-foreground">· {shortDate(s.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No subscribers yet." />
        )}
      </Panel>
    </div>
  );
}
