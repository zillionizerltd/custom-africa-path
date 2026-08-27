import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function DashboardShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions}
      </div>
      <div className="mt-8 space-y-8">{children}</div>
    </div>
  );
}

export function DashboardNav({ items }: { items: { to: string; label: string }[] }) {
  return (
    <nav className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.to === "/admin" }}
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-primary [&.active]:text-primary-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-6 shadow-sm", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {message}
    </p>
  );
}

const tone: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  reviewing: "bg-amber-500/15 text-amber-700",
  quoted: "bg-amber-500/15 text-amber-700",
  sent: "bg-amber-500/15 text-amber-700",
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-500/15 text-amber-700",
  scheduled: "bg-primary/10 text-primary",
  in_progress: "bg-primary/10 text-primary",
  accepted: "bg-emerald-500/15 text-emerald-700",
  confirmed: "bg-emerald-500/15 text-emerald-700",
  paid: "bg-emerald-500/15 text-emerald-700",
  completed: "bg-emerald-500/15 text-emerald-700",
  converted: "bg-emerald-500/15 text-emerald-700",
  rejected: "bg-destructive/10 text-destructive",
  declined: "bg-destructive/10 text-destructive",
  cancelled: "bg-destructive/10 text-destructive",
  failed: "bg-destructive/10 text-destructive",
  expired: "bg-muted text-muted-foreground",
  refunded: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className={cn("capitalize", tone[status] ?? "bg-muted text-muted-foreground")}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export function money(amount: number | string | null | undefined, currency = "USD") {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function shortDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
