import Link from "next/link";
import { Search } from "lucide-react";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { Logo } from "./Logo";

export async function Navbar() {
  const s = await getSession();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur">
      <div className="container-x flex h-16 items-center gap-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/bootcamps" className="hover:text-brand-600">Bootcamps</Link>
          <Link href="/#categories" className="hover:text-brand-600">Categories</Link>
          <Link href="/#why" className="hover:text-brand-600">Why Us</Link>
          <Link href="/#testimonials" className="hover:text-brand-600">Reviews</Link>
        </nav>
        <form action="/bootcamps" className="ml-auto hidden flex-1 max-w-xs lg:block">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input name="q" placeholder="Search bootcamps…" className="input rounded-full pl-9" />
          </label>
        </form>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {s ? (
            <>
              {(s.role === "ADMIN" || s.role === "INSTRUCTOR") && <Link href="/admin" className="btn-ghost hidden sm:inline-flex">Admin</Link>}
              <Link href="/dashboard" className="btn-primary">My Learning</Link>
              <form action={logout}><button className="btn text-slate-600 hover:text-ink">Log out</button></form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn text-slate-700 hover:text-brand-600">Log in</Link>
              <Link href="/register" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
