import { notFound } from "next/navigation";
import { CalendarDays, Clock, Signal, Star, Users, Video, CheckCircle2, UserRound } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Icon } from "@/components/Icon";
import { money, fmtDate } from "@/lib/utils";
import { EnrollForm } from "./EnrollForm";

export const dynamic = "force-dynamic";

export default async function BootcampDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = await prisma.bootcamp.findUnique({ where: { slug }, include: { _count: { select: { enrollments: { where: { status: { not: "CANCELLED" } } } } } } });
  if (!b || !b.published) notFound();
  const s = await getSession();
  const mine = s ? await prisma.enrollment.findUnique({ where: { userId_bootcampId: { userId: s.userId, bootcampId: b.id } } }) : null;
  const curriculum: string[] = JSON.parse(b.curriculum);
  const seatsLeft = Math.max(0, b.capacity - b._count.enrollments);

  return (
    <>
      <section className="text-white" style={{ background: `linear-gradient(135deg, #0b1220, ${b.imageColor})` }}>
        <div className="container-x grid gap-8 py-14 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="badge bg-white/15 text-white">{b.category}</span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{b.title}</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">{b.summary}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{b.rating.toFixed(1)} rating</span>
              <span className="flex items-center gap-1.5"><UserRound className="h-4 w-4" />{b.instructor}</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{b._count.enrollments} enrolled</span>
              <span className="flex items-center gap-1.5"><Signal className="h-4 w-4" />{b.level}</span>
            </div>
          </div>
          <Icon name={b.icon} className="hidden h-40 w-40 justify-self-end text-white/20 lg:block" strokeWidth={1} />
        </div>
      </section>

      <div className="container-x grid gap-10 py-12 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="text-2xl font-extrabold">About this bootcamp</h2>
            {b.description.split("\n\n").map((p, i) => <p key={i} className="mt-3 text-slate-600">{p}</p>)}
          </section>
          <section>
            <h2 className="text-2xl font-extrabold">Curriculum</h2>
            <ol className="mt-4 space-y-3">
              {curriculum.map((c, i) => (
                <li key={i} className="card flex items-center gap-4 p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">{i + 1}</span><span className="font-medium">{c}</span></li>
              ))}
            </ol>
          </section>
          <section className="card grid gap-4 p-6 sm:grid-cols-3">
            {[[Video, "Live classroom", "Camera, mic & screen share"], [Users, "Up to 100 students", "Per live session"], [CheckCircle2, "Certificate", "On completion"]].map(([I, t, d]) => {
              const C = I as typeof Users;
              return <div key={t as string} className="flex gap-3"><C className="h-6 w-6 text-brand-600" /><div><div className="font-bold">{t as string}</div><div className="text-sm text-slate-500">{d as string}</div></div></div>;
            })}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className="flex items-baseline gap-2"><span className="text-3xl font-extrabold">{money(b.price)}</span>{b.originalPrice && <span className="text-slate-400 line-through">{money(b.originalPrice)}</span>}</div>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand-600" />Starts {fmtDate(b.startDate)}</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-600" />{b.durationWeeks} weeks · {b.hoursPerWeek} hrs/week</li>
              <li className="flex items-center gap-2"><Video className="h-4 w-4 text-brand-600" />{b.schedule}</li>
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-brand-600" />{seatsLeft} of {b.capacity} seats left</li>
            </ul>
            <div className="mt-6">
              {mine && mine.status !== "CANCELLED" ? (
                <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">You&apos;re enrolled — status: <b>{mine.status.toLowerCase()}</b>. <a href="/dashboard" className="font-semibold underline">Go to My Learning</a></div>
              ) : seatsLeft === 0 ? (
                <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">This batch is full.</div>
              ) : (
                <EnrollForm bootcampId={b.id} loggedIn={!!s} slug={b.slug} />
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
