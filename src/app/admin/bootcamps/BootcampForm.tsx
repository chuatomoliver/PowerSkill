"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import type { Bootcamp } from "@prisma/client";
import { saveBootcamp, type CmsState } from "@/app/actions/admin";
import { CATEGORIES, ICONS } from "@/lib/utils";
import { Icon } from "@/components/Icon";

const toDateInput = (d: Date) => new Date(d).toISOString().slice(0, 10);

export function BootcampForm({ b }: { b?: Bootcamp }) {
  const [state, action, pending] = useActionState<CmsState, FormData>(saveBootcamp, undefined);
  const [color, setColor] = useState(b?.imageColor ?? "#2563eb");
  const [icon, setIcon] = useState(b?.icon ?? "Code");
  const [title, setTitle] = useState(b?.title ?? "");
  const curriculum = b ? (JSON.parse(b.curriculum) as string[]).join("\n") : "";

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-3">
      {b && <input type="hidden" name="id" value={b.id} />}
      <div className="space-y-6 xl:col-span-2">
        <section className="card space-y-4 p-6">
          <h2 className="font-bold">Details</h2>
          <div><label className="label">Title</label><input name="title" required className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Japanese Language (JLPT N5)" /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label">Category</label><select name="category" className="input" defaultValue={b?.category ?? CATEGORIES[0]}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Level</label><select name="level" className="input" defaultValue={b?.level ?? "Beginner"}>{["Beginner", "Intermediate", "Advanced", "All Levels"].map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Instructor</label><input name="instructor" required className="input" defaultValue={b?.instructor} /></div>
          </div>
          <div><label className="label">Short summary</label><input name="summary" required className="input" defaultValue={b?.summary} /></div>
          <div><label className="label">Description</label><textarea name="description" required rows={5} className="input" defaultValue={b?.description} /></div>
          <div><label className="label">Curriculum <span className="font-normal text-slate-400">(one module per line)</span></label><textarea name="curriculum" rows={6} className="input font-mono text-xs" defaultValue={curriculum} /></div>
        </section>
        <section className="card grid gap-4 p-6 sm:grid-cols-3">
          <h2 className="font-bold sm:col-span-3">Schedule & pricing</h2>
          <div><label className="label">Start date</label><input type="date" name="startDate" required className="input" defaultValue={b ? toDateInput(b.startDate) : ""} /></div>
          <div><label className="label">Duration (weeks)</label><input type="number" name="durationWeeks" min={1} required className="input" defaultValue={b?.durationWeeks ?? 8} /></div>
          <div><label className="label">Hours / week</label><input type="number" name="hoursPerWeek" min={1} required className="input" defaultValue={b?.hoursPerWeek ?? 6} /></div>
          <div className="sm:col-span-3"><label className="label">Class schedule</label><input name="schedule" required className="input" defaultValue={b?.schedule} placeholder="Mon & Wed · 7:00–9:00 PM" /></div>
          <div><label className="label">Price (USD)</label><input type="number" step="0.01" min={0} name="price" required className="input" defaultValue={b ? b.price / 100 : ""} /></div>
          <div><label className="label">Original price</label><input type="number" step="0.01" min={0} name="originalPrice" className="input" defaultValue={b?.originalPrice ? b.originalPrice / 100 : ""} /></div>
          <div><label className="label">Seats (max 100)</label><input type="number" name="capacity" min={1} max={100} required className="input" defaultValue={b?.capacity ?? 100} /></div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="card overflow-hidden">
          <div className="relative grid h-36 place-items-center" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}><Icon name={icon} className="h-14 w-14 text-white" strokeWidth={1.6} /></div>
          <div className="p-4 text-sm font-bold">{title || "Card preview"}</div>
        </section>
        <section className="card space-y-4 p-6">
          <h2 className="font-bold">Appearance & visibility</h2>
          <div><label className="label">Card color</label><input type="color" name="imageColor" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-slate-200" /></div>
          <div><label className="label">Icon</label>
            <input type="hidden" name="icon" value={icon} />
            <div className="grid grid-cols-6 gap-2">{ICONS.map((i) => (
              <button type="button" key={i} onClick={() => setIcon(i)} aria-label={i} className={`grid h-10 place-items-center rounded-lg border ${icon === i ? "border-brand-600 bg-brand-50 text-brand-600" : "border-slate-200 text-slate-500"}`}><Icon name={i} className="h-5 w-5" /></button>
            ))}</div>
          </div>
          <div><label className="label">Rating</label><input type="number" step="0.1" min={0} max={5} name="rating" className="input" defaultValue={b?.rating ?? 4.7} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={b?.published ?? true} className="h-4 w-4 accent-brand-600" />Published on website</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={b?.featured ?? false} className="h-4 w-4 accent-brand-600" />Featured (“Most Popular”)</label>
        </section>
        {state?.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
        <div className="flex gap-2"><button disabled={pending} className="btn-primary flex-1">{pending ? "Saving…" : b ? "Save changes" : "Create bootcamp"}</button><Link href="/admin/bootcamps" className="btn-ghost">Cancel</Link></div>
      </div>
    </form>
  );
}
