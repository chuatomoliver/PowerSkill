import Link from "next/link";
import { Plus, Pencil, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { money, fmtDate } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { togglePublish, deleteBootcamp } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function CmsList({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const camps = await prisma.bootcamp.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { enrollments: { where: { status: { not: "CANCELLED" } } }, sessions: true } } } });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold tracking-tight">Bootcamps</h1><p className="text-sm text-slate-500">Create, edit and publish bootcamps shown on the website.</p></div>
        <Link href="/admin/bootcamps/new" className="btn-primary"><Plus className="h-4 w-4" />New bootcamp</Link>
      </div>
      {saved && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Bootcamp saved.</div>}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Bootcamp</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Starts</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Seats</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
          <tbody>
            {camps.map((b) => (
              <tr key={b.id} className="border-t border-slate-100">
                <td className="px-5 py-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white" style={{ background: b.imageColor }}><Icon name={b.icon} className="h-4 w-4" /></span><div><div className="font-semibold">{b.title}</div><div className="text-xs text-slate-500">{b.instructor} · {b._count.sessions} classes</div></div></div></td>
                <td className="px-5 py-3 text-slate-600">{b.category}</td>
                <td className="px-5 py-3 text-slate-600">{fmtDate(b.startDate)}</td>
                <td className="px-5 py-3 font-semibold">{money(b.price)}</td>
                <td className="px-5 py-3 text-slate-600">{b._count.enrollments}/{b.capacity}</td>
                <td className="px-5 py-3">{b.published ? <span className="badge bg-emerald-50 text-emerald-700">Published</span> : <span className="badge bg-slate-100 text-slate-500">Draft</span>}{b.featured && <span className="badge ml-1 bg-amber-50 text-amber-700">Featured</span>}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/bootcamps/${b.slug}`} target="_blank" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" title="View"><ExternalLink className="h-4 w-4" /></Link>
                    <form action={togglePublish}><input type="hidden" name="id" value={b.id} /><button className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" title={b.published ? "Unpublish" : "Publish"}>{b.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></form>
                    <Link href={`/admin/bootcamps/${b.id}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" title="Edit"><Pencil className="h-4 w-4" /></Link>
                    <form action={deleteBootcamp}><input type="hidden" name="id" value={b.id} /><ConfirmButton message={`Delete "${b.title}"? This also removes its enrollments and classes.`} className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50" title="Delete"><Trash2 className="h-4 w-4" /></ConfirmButton></form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
