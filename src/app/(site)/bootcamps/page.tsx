import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { BootcampCard } from "@/components/BootcampCard";
import { CATEGORIES, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BootcampsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q = "", category = "" } = await searchParams;
  const camps = await prisma.bootcamp.findMany({
    where: { published: true, ...(category && { category }), ...(q && { OR: [{ title: { contains: q } }, { summary: { contains: q } }, { category: { contains: q } }] }) },
    orderBy: [{ featured: "desc" }, { startDate: "asc" }],
    include: { _count: { select: { enrollments: true } } },
  });
  return (
    <div className="container-x py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">All Bootcamps</h1>
      <p className="mt-2 text-slate-500">Live, cohort-based programs. Every class runs in our built-in virtual classroom.</p>
      <form className="mt-6 flex max-w-xl gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input name="q" defaultValue={q} placeholder="Search Software, English, Japanese…" className="input pl-9" /></label>
        <button className="btn-primary">Search</button>
      </form>
      <div className="mt-6 flex flex-wrap gap-2">
        {["", ...CATEGORIES].map((c) => (
          <Link key={c || "all"} href={`/bootcamps?${new URLSearchParams({ ...(q && { q }), ...(c && { category: c }) })}`}
            className={cn("rounded-full border px-4 py-1.5 text-sm font-medium", category === c ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 text-slate-600 hover:border-brand-500")}>
            {c || "All"}
          </Link>
        ))}
      </div>
      {camps.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">No bootcamps match your search.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {camps.map((b) => <BootcampCard key={b.id} b={b} enrolled={b._count.enrollments} />)}
        </div>
      )}
    </div>
  );
}
