import Link from "next/link";
import { Download, Check, X, RotateCcw } from "lucide-react";
import { prisma } from "@/lib/db";
import { money, fmtDateTime, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { setEnrollmentStatus } from "@/app/actions/admin";
import { enrollmentWhere, type EnrollmentFilters } from "@/lib/enrollmentQuery";

export const dynamic = "force-dynamic";
const PAGE = 25;

export default async function Enrollments({ searchParams }: { searchParams: Promise<EnrollmentFilters & { page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = enrollmentWhere(sp);
  const [rows, total, camps, counts] = await Promise.all([
    prisma.enrollment.findMany({ where, include: { user: true, bootcamp: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE }),
    prisma.enrollment.count({ where }),
    prisma.bootcamp.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.enrollment.groupBy({ by: ["status"], _count: true }),
  ]);
  const c = Object.fromEntries(counts.map((x) => [x.status, x._count]));
  const qs = (o: Record<string, string | undefined>) => new URLSearchParams(Object.entries({ q: sp.q, status: sp.status, bootcamp: sp.bootcamp, ...o }).filter(([, v]) => v) as [string, string][]).toString();
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold tracking-tight">Reservations</h1><p className="text-sm text-slate-500">People who reserved or enrolled in bootcamps.</p></div>
        <a href={`/admin/enrollments/export?${qs({})}`} className="btn-ghost"><Download className="h-4 w-4" />Export CSV</a>
      </div>

      <div className="flex flex-wrap gap-2">
        {[["", "All", (c.PENDING ?? 0) + (c.CONFIRMED ?? 0) + (c.CANCELLED ?? 0)], ["PENDING", "Pending", c.PENDING ?? 0], ["CONFIRMED", "Confirmed", c.CONFIRMED ?? 0], ["CANCELLED", "Cancelled", c.CANCELLED ?? 0]].map(([v, l, n]) => (
          <Link key={l} href={`/admin/enrollments?${qs({ status: v as string, page: undefined })}`} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium", (sp.status ?? "") === v ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600")}>{l} <span className="opacity-70">{n}</span></Link>
        ))}
      </div>

      <form className="card flex flex-wrap gap-3 p-4">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <input name="q" defaultValue={sp.q} placeholder="Search name or email…" className="input max-w-xs" />
        <select name="bootcamp" defaultValue={sp.bootcamp ?? ""} className="input max-w-xs"><option value="">All bootcamps</option>{camps.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}</select>
        <button className="btn-primary">Filter</button>
        {(sp.q || sp.bootcamp) && <Link href={`/admin/enrollments${sp.status ? `?status=${sp.status}` : ""}`} className="btn text-slate-500">Clear</Link>}
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">Bootcamp</th><th className="px-5 py-3">Reserved</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-slate-500">No reservations found.</td></tr>}
            {rows.map((e) => (
              <tr key={e.id} className="border-t border-slate-100 align-top">
                <td className="px-5 py-3"><div className="font-medium">{e.user.name}</div><div className="text-xs text-slate-500">{e.user.email}{e.phone && ` · ${e.phone}`}</div>{e.notes && <div className="mt-1 max-w-xs text-xs italic text-slate-500">“{e.notes}”</div>}</td>
                <td className="px-5 py-3">{e.bootcamp.title}</td>
                <td className="px-5 py-3 text-slate-500">{fmtDateTime(e.createdAt)}</td>
                <td className="px-5 py-3 font-semibold">{money(e.amount)}</td>
                <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                <td className="px-5 py-3">
                  <form action={setEnrollmentStatus} className="flex justify-end gap-1">
                    <input type="hidden" name="id" value={e.id} />
                    {e.status !== "CONFIRMED" && <button name="status" value="CONFIRMED" className="btn px-2.5 py-1.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100"><Check className="h-3.5 w-3.5" />Confirm</button>}
                    {e.status !== "CANCELLED" && <button name="status" value="CANCELLED" className="btn px-2.5 py-1.5 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200"><X className="h-3.5 w-3.5" />Cancel</button>}
                    {e.status === "CANCELLED" && <button name="status" value="PENDING" className="btn px-2.5 py-1.5 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200"><RotateCcw className="h-3.5 w-3.5" />Reopen</button>}
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{total} result{total === 1 ? "" : "s"} · page {page} of {pages}</span>
        <div className="flex gap-2">
          {page > 1 && <Link href={`/admin/enrollments?${qs({ page: String(page - 1) })}`} className="btn-ghost">Previous</Link>}
          {page < pages && <Link href={`/admin/enrollments?${qs({ page: String(page + 1) })}`} className="btn-ghost">Next</Link>}
        </div>
      </div>
    </div>
  );
}
