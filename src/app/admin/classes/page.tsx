import Link from "next/link";
import { Video, Play, Square } from "lucide-react";
import { prisma } from "@/lib/db";
import { fmtDateTime, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { setClassStatus } from "@/app/actions/admin";
import { ScheduleForm } from "./ScheduleForm";

export const dynamic = "force-dynamic";

export default async function Classes({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view = "upcoming" } = await searchParams;
  const past = view === "past";
  const [sessions, camps] = await Promise.all([
    prisma.classSession.findMany({ where: past ? { status: "ENDED" } : { status: { not: "ENDED" } }, include: { bootcamp: true }, orderBy: { startsAt: past ? "desc" : "asc" }, take: 60 }),
    prisma.bootcamp.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold tracking-tight">Live Classes</h1><p className="text-sm text-slate-500">Schedule sessions and host live rooms (camera, mic, screen share — up to 100 students).</p></div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="flex gap-2">
            {["upcoming", "past"].map((v) => <Link key={v} href={`/admin/classes?view=${v}`} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium capitalize", view === v ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600")}>{v}</Link>)}
          </div>
          <div className="card divide-y divide-slate-100">
            {sessions.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No classes.</p>}
            {sessions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="truncate font-semibold">{s.title}</span><StatusBadge status={s.status} /></div>
                  <div className="text-xs text-slate-500">{fmtDateTime(s.startsAt)} · {s.durationMin} min{past && ` · ${s.attendees} attended`}</div>
                </div>
                {!past && (
                  <div className="flex gap-2">
                    <Link href={`/classroom/${s.roomName}`} className="btn-primary px-3 py-2 text-xs"><Video className="h-3.5 w-3.5" />{s.status === "LIVE" ? "Join room" : "Start & host"}</Link>
                    <form action={setClassStatus}><input type="hidden" name="id" value={s.id} />
                      {s.status === "LIVE"
                        ? <button name="status" value="ENDED" className="btn-ghost px-3 py-2 text-xs"><Square className="h-3.5 w-3.5" />End</button>
                        : <button name="status" value="LIVE" className="btn-ghost px-3 py-2 text-xs"><Play className="h-3.5 w-3.5" />Open doors</button>}
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <ScheduleForm camps={camps} />
      </div>
    </div>
  );
}
