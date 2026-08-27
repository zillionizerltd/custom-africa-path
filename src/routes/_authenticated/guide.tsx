import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DashboardShell, EmptyState, Panel, StatusBadge, shortDate } from "@/components/dashboard/Shell";

export const Route = createFileRoute("/_authenticated/guide")({
  component: GuidePortal,
});

function GuidePortal() {
  const { user, profile, isGuide, isStaff, signOut } = useAuth();
  const qc = useQueryClient();

  const assignments = useQuery({
    queryKey: ["guide-assignments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*, bookings(*), guides(full_name), vehicles(name, vehicle_type, plate)")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "in_progress" | "completed" }) => {
      const { error } = await supabase.from("assignments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Assignment updated");
      void qc.invalidateQueries({ queryKey: ["guide-assignments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardShell
      eyebrow="Guide portal"
      title={`Your trips, ${profile?.full_name ?? user?.email ?? "guide"}`}
      description="Upcoming assignments with client details, dates and assigned vehicle."
      actions={
        <Button variant="outline" onClick={() => void signOut()}>
          Sign out
        </Button>
      }
    >
      {!isGuide && !isStaff ? (
        <EmptyState message="Your account is not linked to a guide profile yet. Ask the office to add you." />
      ) : null}

      <Panel title="Assignments">
        {assignments.data?.length ? (
          <ul className="divide-y divide-border">
            {assignments.data.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium text-foreground">
                    {a.bookings?.title ?? "Trip"} · {a.bookings?.reference ?? ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shortDate(a.start_date)} → {shortDate(a.end_date)} ·{" "}
                    {a.bookings?.travelers ?? "?"} travellers · Lead: {a.bookings?.lead_name ?? "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vehicle: {a.vehicles ? `${a.vehicles.name} (${a.vehicles.vehicle_type})` : "Not assigned"}
                  </p>
                  {a.notes ? <p className="mt-1 text-sm text-muted-foreground">{a.notes}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  {a.status === "scheduled" ? (
                    <Button size="sm" variant="gold" onClick={() => setStatus.mutate({ id: a.id, status: "in_progress" })}>
                      Start trip
                    </Button>
                  ) : null}
                  {a.status === "in_progress" ? (
                    <Button size="sm" variant="gold" onClick={() => setStatus.mutate({ id: a.id, status: "completed" })}>
                      Mark complete
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No assignments scheduled." />
        )}
      </Panel>
    </DashboardShell>
  );
}
