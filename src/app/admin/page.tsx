import Link from "next/link";
import { Users, DollarSign, ClipboardList, Video, Hourglass, TrendingUp, BookOpen, UserCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { money, fmtDate, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { RevenueChart, RegistrationsChart, CategoryChart } from "./Charts";

export const dynamic = "force-dynamic";

function monthKeys(n: number) {
  const out: { key: string; label: string }[] = [];
  const d = new Date(); d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push({ key: `${m.getFullYear()}-${m.getMonth()}`, label: m.toLocaleString("en-US", { month: "short" }) });
  }
  return out;
}
const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

function Kpi({ icon: I, label, value, sub, tone = "brand" }: { icon: typeof Users; label: string; value: string; sub?: string; tone?: "brand" | "emerald" | "amber" | "violet" }) {
  const tones = { brand: "bg-brand-50 text-brand-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", violet: "bg-violet-50 text-violet-600" };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className={cn("grid h-9 w-9 place-items-center rounded-lg", tones[tone])}><I className="h-4 w-4" /></span></div>
      <div className="mt-3 text-3xl font-extrabold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export default async function AdminDashboard() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [users, enrollments, camps, sessions] = await Promise.all([
    prisma.user.findMany({ where: { role: "STUDENT" }, select: { createdAt: true } }),
    prisma.enrollment.findMany({ include: { bootcamp: { select: { title: true, category: true } }, user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.bootcamp.findMany({ select: { id: true, title: true, published: true, capacity: true } }),
    prisma.classSession.findMany({ select: { status: true, attendees: true, startsAt: true } }),
  ]);

  const confirmed = enrollments.filter((e) => e.status === "CONFIRMED");
  const pending = enrollments.filter((e) => e.status === "PENDING");
  const sales = confirmed.reduce((a, e) => a + e.amount, 0);
  const salesThisMonth = confirmed.filter((e) => e.createdAt >= monthStart).reduce((a, e) => a + e.amount, 0);
  const newUsersThisMonth = users.filter((u) => u.createdAt >= monthStart).length;
  const held = sessions.filter((s) => s.status === "ENDED");
  const upcoming = sessions.filter((s) => s.status !== "ENDED").length;
  const avgAttendance = held.length ? Math.round(held.reduce((a, s) => a + s.attendees, 0) / held.length) : 0;
  const active = enrollments.filter((e) => e.status !== "CANCELLED").length;
  const fillRate = camps.length ? Math.round((active / camps.reduce((a, c) => a + c.capacity, 0)) * 100) : 0;

  const months = monthKeys(6);
  const revenue = months.map((m) => ({ month: m.label, revenue: Math.round(confirmed.filter((e) => keyOf(e.createdAt) === m.key).reduce((a, e) => a + e.amount, 0) / 100) }));
  const regs = months.map((m) => ({ month: m.label, users: users.filter((u) => keyOf(u.createdAt) === m.key).length }));
  const byCat = Object.entries(enrollments.filter((e) => e.status !== "CANCELLED").reduce<Record<string, number>>((a, e) => ({ ...a, [e.bootcamp.category]: (a[e.bootcamp.category] ?? 0) + 1 }), {}))
    .map(([category, n]) => ({ category, enrollments: n })).sort((a, b) => b.enrollments - a.enrollments);

  const top = camps.map((c) => {
    const es = enrollments.filter((e) => e.bootcampId === c.id && e.status !== "CANCELLED");
    return { ...c, students: es.length, revenue: es.filter((e) => e.status === "CONFIRMED").reduce((a, e) => a + e.amount, 0) };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1><p className="text-sm text-slate-500">Overview of registrations, sales and classes.</p></div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Users} label="Registered students" value={users.length.toLocaleString()} sub={`+${newUsersThisMonth} this month`} />
        <Kpi icon={DollarSign} label="Total sales" value={money(sales)} sub={`${money(salesThisMonth)} this month`} tone="emerald" />
        <Kpi icon={ClipboardList} label="Enrollments" value={active.toLocaleString()} sub={`${confirmed.length} confirmed · ${pending.length} pending`} tone="violet" />
        <Kpi icon={Video} label="Classes held" value={held.length.toString()} sub={`${upcoming} upcoming / live`} tone="amber" />
        <Kpi icon={Hourglass} label="Pending revenue" value={money(pending.reduce((a, e) => a + e.amount, 0))} sub="Awaiting confirmation" tone="amber" />
        <Kpi icon={UserCheck} label="Avg. attendance" value={`${avgAttendance}`} sub="Students per class (max 100)" />
        <Kpi icon={TrendingUp} label="Avg. order value" value={money(confirmed.length ? Math.round(sales / confirmed.length) : 0)} sub="Per confirmed enrollment" tone="emerald" />
        <Kpi icon={BookOpen} label="Bootcamps" value={camps.length.toString()} sub={`${camps.filter((c) => c.published).length} published · ${fillRate}% seats filled`} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card p-5"><h2 className="font-bold">Sales by month</h2><p className="mb-4 text-xs text-slate-500">Confirmed enrollments, last 6 months (USD)</p><RevenueChart data={revenue} /></section>
        <section className="card p-5"><h2 className="font-bold">New registrations</h2><p className="mb-4 text-xs text-slate-500">Student sign-ups, last 6 months</p><RegistrationsChart data={regs} /></section>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="card p-5 xl:col-span-2"><h2 className="mb-4 font-bold">Enrollments by category</h2><CategoryChart data={byCat} /></section>
        <section className="card overflow-hidden xl:col-span-3">
          <div className="flex items-center justify-between p-5"><h2 className="font-bold">Top bootcamps</h2><Link href="/admin/bootcamps" className="text-sm font-semibold text-brand-600">Manage</Link></div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-5 py-2">Bootcamp</th><th className="px-5 py-2">Seats</th><th className="px-5 py-2 text-right">Sales</th></tr></thead>
            <tbody>{top.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium">{c.title}</td>
                <td className="px-5 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-20 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-brand-600" style={{ width: `${Math.min(100, (c.students / c.capacity) * 100)}%` }} /></div><span className="text-xs text-slate-500">{c.students}/{c.capacity}</span></div></td>
                <td className="px-5 py-3 text-right font-semibold">{money(c.revenue)}</td>
              </tr>))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between p-5"><h2 className="font-bold">Latest reservations</h2><Link href="/admin/enrollments" className="text-sm font-semibold text-brand-600">View all</Link></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-5 py-2">Student</th><th className="px-5 py-2">Bootcamp</th><th className="px-5 py-2">Date</th><th className="px-5 py-2">Status</th></tr></thead>
            <tbody>{enrollments.slice(0, 6).map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="px-5 py-3"><div className="font-medium">{e.user.name}</div><div className="text-xs text-slate-500">{e.user.email}</div></td>
                <td className="px-5 py-3">{e.bootcamp.title}</td><td className="px-5 py-3 text-slate-500">{fmtDate(e.createdAt)}</td>
                <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
              </tr>))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
