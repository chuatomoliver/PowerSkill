import Link from "next/link";
import { Star, Clock, Signal, CalendarDays } from "lucide-react";
import type { Bootcamp } from "@prisma/client";
import { Icon } from "./Icon";
import { money, fmtDate } from "@/lib/utils";

export function BootcampCard({ b, enrolled }: { b: Bootcamp; enrolled?: number }) {
  return (
    <Link href={`/bootcamps/${b.slug}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200">
      <div className="relative h-36 overflow-hidden" style={{ background: `linear-gradient(135deg, ${b.imageColor}, ${b.imageColor}99)` }}>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-white/10" />
        <Icon name={b.icon} className="absolute bottom-4 left-4 h-12 w-12 text-white drop-shadow" strokeWidth={1.6} />
        <span className="badge absolute right-3 top-3 bg-white/90 text-slate-700">{b.category}</span>
        {b.featured && <span className="badge absolute left-3 top-3 bg-amber-300 text-amber-950">Most Popular</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold leading-snug group-hover:text-brand-600">{b.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{b.summary}</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-600">{b.instructor}</span>
          <span className="flex items-center gap-1 font-semibold"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{b.rating.toFixed(1)}{enrolled !== undefined && <span className="font-normal text-slate-400">({enrolled})</span>}</span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{b.durationWeeks} wks</span>
          <span className="flex items-center gap-1"><Signal className="h-3.5 w-3.5" />{b.level}</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{fmtDate(b.startDate)}</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-extrabold">{money(b.price)}</span>
          {b.originalPrice && <span className="text-sm text-slate-400 line-through">{money(b.originalPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}
