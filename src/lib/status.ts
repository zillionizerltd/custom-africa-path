// Green = settled, amber = waiting on someone, red = stopped.
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

export function statusClass(status: string) {
  return tone[status] ?? "bg-muted text-muted-foreground";
}

export function statusLabel(status: string) {
  return status.replace("_", " ");
}
