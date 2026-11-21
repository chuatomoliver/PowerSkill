import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  const cols = {
    Bootcamps: [["All Bootcamps", "/bootcamps"], ["Development", "/bootcamps?category=Development"], ["Languages", "/bootcamps?category=Language"], ["Data Science", "/bootcamps?category=Data Science"]],
    Learn: [["My Learning", "/dashboard"], ["Live Classroom", "/dashboard"], ["Certificates", "/dashboard"]],
    Company: [["About", "/#why"], ["Reviews", "/#testimonials"], ["Admin", "/admin"]],
  };
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-slate-500">Live bootcamps for a brighter tomorrow. Learn with up to 100 classmates in real time.</p>
        </div>
        {Object.entries(cols).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-sm font-bold">{title}</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {links.map(([l, h]) => <li key={l}><Link href={h} className="hover:text-brand-600">{l}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-x border-t border-slate-100 py-6 text-xs text-slate-500">© {new Date().getFullYear()} PowerSkill. All rights reserved.</div>
    </footer>
  );
}
