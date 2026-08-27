import { createFileRoute, Outlet } from "@tanstack/react-router";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DashboardNav, EmptyState } from "@/components/dashboard/Shell";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/requests", label: "Requests" },
  { to: "/admin/quotes", label: "Quotes" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/operations", label: "Operations" },
  { to: "/admin/content", label: "Content" },
  { to: "/admin/users", label: "Users" },
];

function AdminLayout() {
  const { isStaff, loading, signOut } = useAuth();

  if (loading) {
    return <div className="container-page py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isStaff) {
    return (
      <div className="container-page py-16">
        <EmptyState message="You don't have access to the operations dashboard." />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DashboardNav items={nav} />
        <Button variant="outline" size="sm" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
      <Outlet />
    </div>
  );
}
