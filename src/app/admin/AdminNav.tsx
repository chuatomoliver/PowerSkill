"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, ClipboardList, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/bootcamps", "Bootcamps (CMS)", BookOpen],
  ["/admin/enrollments", "Reservations", ClipboardList],
  ["/admin/classes", "Live Classes", Video],
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col">
      {items.map(([href, label, I]) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium", active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50")}>
            <I className="h-4 w-4" />{label}
          </Link>
        );
      })}
    </nav>
  );
}
