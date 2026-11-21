import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = { CONFIRMED: "bg-emerald-50 text-emerald-700", PENDING: "bg-amber-50 text-amber-700", CANCELLED: "bg-slate-100 text-slate-500", LIVE: "bg-red-50 text-red-600", SCHEDULED: "bg-brand-50 text-brand-700", ENDED: "bg-slate-100 text-slate-500" };
  return <span className={cn("badge", s[status])}>{status === "LIVE" ? "● " : ""}{status.toLowerCase()}</span>;
}
