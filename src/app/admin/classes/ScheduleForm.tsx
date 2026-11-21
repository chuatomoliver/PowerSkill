"use client";
import { useActionState, useEffect, useRef } from "react";
import { createClassSession, type CmsState } from "@/app/actions/admin";

export function ScheduleForm({ camps }: { camps: { id: string; title: string }[] }) {
  const [state, action, pending] = useActionState<CmsState, FormData>(createClassSession, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state && !state.error) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="card h-fit space-y-4 p-6">
      <h2 className="font-bold">Schedule a class</h2>
      <div><label className="label">Bootcamp</label><select name="bootcampId" required className="input">{camps.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
      <div><label className="label">Title</label><input name="title" required className="input" placeholder="Week 3 — React Hooks" /></div>
      <div><label className="label">Starts at</label><input type="datetime-local" name="startsAt" required className="input" /></div>
      <div><label className="label">Duration (minutes)</label><input type="number" name="durationMin" defaultValue={90} min={15} max={480} className="input" /></div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state && !state.error && <p className="text-sm text-emerald-700">Class scheduled.</p>}
      <button disabled={pending} className="btn-primary w-full">{pending ? "Scheduling…" : "Schedule class"}</button>
      <p className="text-xs text-slate-500">Confirmed students can join from 30 minutes before start, or anytime you open the doors.</p>
    </form>
  );
}
