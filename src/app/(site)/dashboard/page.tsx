import Link from "next/link";
import { Video, CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Icon } from "@/components/Icon";
import { fmtDate, fmtDateTime, cn } from "@/lib/utils";
import { isJoinable, hoursAgo } from "@/lib/sessions";

export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = { CONFIRMED: "bg-emerald-50 text-emerald-700", PENDING: "bg-amber-50 text-amber-700", CANCELLED: "bg-slate-100 text-slate-500" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ enrolled?: string }> }) {
  const s = await requireUser("/dashboard");
  const { enrolled } = await searchParams;
  const enrollments = await prisma.enrollment.findMany({ where: { userId: s.userId }, include: { bootcamp: true }, orderBy: { createdAt: "desc" } });
  const confirmedIds = enrollments.filter((e) => e.status === "CONFIRMED").map((e) => e.bootcampId);
  const upcoming = await prisma.classSession.findMany({
    where: { bootcampId: { in: confirmedIds }, status: { not: "ENDED" }, startsAt: { gte: hoursAgo(3) } },
    include: { bootcamp: true }, orderBy: { startsAt: "asc" }, take: 8,
  });

  return (
    <div className="container-x py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Hi, {s.name.split(" ")[0]} 👋</h1>
      <p className="mt-1 text-slate-500">Your bootcamps and upcoming live classes.</p>
      {enrolled && <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Seat reserved! Our team will confirm your enrollment shortly — you&apos;ll be able to join live classes once confirmed.</div>}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="text-lg font-bold">Upcoming live classes</h2>
          <div className="mt-4 space-y-3">
            {upcoming.length === 0 && <div className="card p-8 text-center text-sm text-slate-500">No upcoming classes yet. Classes appear here once your enrollment is confirmed.</div>}
            {upcoming.map((c) => {
              const joinable = isJoinable(c);
              return (
                <div key={c.id} className="card flex items-center gap-4 p-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white" style={{ background: c.bootcamp.imageColor }}><Icon name={c.bootcamp.icon} className="h-6 w-6" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{c.title}</div>
                    <div className="flex items-center gap-1 text-sm text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{fmtDateTime(c.startsAt)} · {c.durationMin} min {c.status === "LIVE" && <span className="badge ml-2 bg-red-50 text-red-600">● LIVE</span>}</div>
                  </div>
                  {joinable ? <Link href={`/classroom/${c.roomName}`} className="btn-primary"><Video className="h-4 w-4" />Join</Link>
                    : <span className="btn-ghost pointer-events-none text-slate-400"><Clock3 className="h-4 w-4" />Not started</span>}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold">My bootcamps</h2>
          <div className="mt-4 space-y-3">
            {enrollments.length === 0 && <div className="card p-6 text-center text-sm text-slate-500">You haven&apos;t enrolled yet. <Link href="/bootcamps" className="font-semibold text-brand-600">Browse bootcamps</Link></div>}
            {enrollments.map((e) => (
              <Link key={e.id} href={`/bootcamps/${e.bootcamp.slug}`} className="card block p-4 hover:border-brand-500">
                <div className="flex items-start justify-between gap-2"><span className="font-semibold">{e.bootcamp.title}</span><span className={cn("badge", statusStyle[e.status])}>{e.status === "CONFIRMED" && <CheckCircle2 className="mr-1 h-3 w-3" />}{e.status.toLowerCase()}</span></div>
                <div className="mt-1 text-xs text-slate-500">Starts {fmtDate(e.bootcamp.startDate)} · {e.bootcamp.schedule}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
