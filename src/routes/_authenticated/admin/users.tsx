import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { EmptyState, Panel } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

const assignable: AppRole[] = ["admin", "staff", "guide", "customer"];

function AdminUsers() {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();

  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);
      if (profiles.error) throw profiles.error;
      return (profiles.data ?? []).map((p) => ({
        ...p,
        roles: (roles.data ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as AppRole),
      }));
    },
  });

  const toggleRole = useMutation({
    mutationFn: async ({ userId, role, has }: { userId: string; role: AppRole; has: boolean }) => {
      if (has) {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Roles updated");
      void qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-8 space-y-8">
      <div>
        <p className="eyebrow">Users</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">Accounts & roles</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Grant staff, admin or guide access. Only admins can change roles.
        </p>
      </div>

      <Panel title="All accounts">
        {users.data?.length ? (
          <ul className="divide-y divide-border">
            {users.data.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium text-foreground">{u.full_name ?? "Unnamed traveller"}</p>
                  <p className="text-sm text-muted-foreground">
                    {u.email ?? "—"} · {u.country ?? "—"}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {u.roles.length ? (
                      u.roles.map((r) => (
                        <Badge key={r} variant="secondary" className="capitalize">
                          {r}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No roles</span>
                    )}
                  </div>
                </div>
                {isAdmin ? (
                  <div className="flex flex-wrap gap-2">
                    {assignable.map((role) => {
                      const has = u.roles.includes(role);
                      return (
                        <Button
                          key={role}
                          size="sm"
                          variant={has ? "gold" : "outline"}
                          onClick={() => toggleRole.mutate({ userId: u.id, role, has })}
                        >
                          {has ? `Remove ${role}` : `Make ${role}`}
                        </Button>
                      );
                    })}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No accounts yet." />
        )}
      </Panel>
    </div>
  );
}
