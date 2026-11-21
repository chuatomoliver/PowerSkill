import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await requireAdmin();
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between p-5"><Logo /><span className="badge bg-brand-50 text-brand-700">Admin</span></div>
        <AdminNav />
        <div className="mt-auto hidden border-t border-slate-100 p-5 text-sm lg:block">
          <div className="font-semibold">{s.name}</div><div className="truncate text-xs text-slate-500">{s.email}</div>
          <Link href="/" className="mt-2 inline-block text-xs font-semibold text-brand-600">← View website</Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
