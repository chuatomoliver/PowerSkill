import Link from "next/link";
import { ArrowRight, GraduationCap, Users, Infinity as InfinityIcon, CheckCircle2, BarChart3, Video, Mic, MonitorUp, Award, Briefcase, Laptop, Send } from "lucide-react";
import { prisma } from "@/lib/db";
import { BootcampCard } from "@/components/BootcampCard";
import { Icon } from "@/components/Icon";
import { CATEGORIES } from "@/lib/utils";

export const dynamic = "force-dynamic";

const catStyle: Record<string, [string, string, string]> = {
  Development: ["Code", "bg-emerald-50", "text-emerald-600"],
  Language: ["Languages", "bg-sky-50", "text-sky-600"],
  "Data Science": ["BarChart3", "bg-amber-50", "text-amber-600"],
  Design: ["Palette", "bg-blue-50", "text-blue-600"],
  Marketing: ["Megaphone", "bg-rose-50", "text-rose-600"],
  Business: ["Briefcase", "bg-violet-50", "text-violet-600"],
  "IT & Security": ["ShieldCheck", "bg-teal-50", "text-teal-600"],
};

const tiles = [
  ["PS", "from-pink-400 to-rose-500"], ["JT", "from-sky-400 to-blue-600"], ["ML", "from-amber-300 to-orange-500"],
  ["YT", "from-emerald-400 to-teal-600"], ["AR", "from-violet-400 to-purple-600"], ["+94", "from-slate-500 to-slate-700"],
];

export default async function Home() {
  const [featured, counts, totalCamps, totalStudents] = await Promise.all([
    prisma.bootcamp.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { rating: "desc" }], take: 8 }),
    prisma.bootcamp.groupBy({ by: ["category"], where: { published: true }, _count: true }),
    prisma.bootcamp.count({ where: { published: true } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c.category, c._count]));

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-100/60 blur-3xl" />
        <div className="container-x relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Learn live, anywhere</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">Skills Today,<br />A Brighter<br /><span className="text-brand-600">Tomorrow</span></h1>
            <p className="mt-6 max-w-md text-lg text-slate-600">Live, instructor-led bootcamps in software, languages, data and design. Join interactive classrooms with up to 100 classmates — camera, mic and screen sharing built in.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/bootcamps" className="btn-primary px-6 py-3 text-base">Explore Bootcamps <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/register" className="btn-ghost px-6 py-3 text-base">Join for free</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8">
              {[[GraduationCap, `${totalCamps}+`, "Bootcamps"], [Users, `${totalStudents}+`, "Learners"], [InfinityIcon, "Lifetime", "Access"]].map(([I, a, b]) => {
                const C = I as typeof Users;
                return (<div key={b as string} className="flex items-center gap-3"><C className="h-7 w-7 text-brand-600" /><div><div className="font-extrabold leading-none">{a as string}</div><div className="text-xs text-slate-500">{b as string}</div></div></div>);
              })}
            </div>
          </div>

          {/* Live classroom mock */}
          <div className="relative">
            <div className="card relative overflow-hidden bg-slate-900 p-3 shadow-2xl shadow-brand-900/20">
              <div className="mb-3 flex items-center justify-between px-1 text-xs text-slate-300">
                <span className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> LIVE · Full-Stack Bootcamp</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 99 / 100</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3 grid aspect-[16/8] place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800">
                  <div className="w-4/5 rounded-lg bg-slate-950/70 p-4 font-mono text-[11px] leading-relaxed text-slate-300">
                    <span className="text-violet-400">export default</span> <span className="text-sky-300">function</span> <span className="text-amber-300">App</span>() {"{"}<br />
                    &nbsp;&nbsp;<span className="text-violet-400">return</span> &lt;<span className="text-emerald-300">Classroom</span> live /&gt;<br />{"}"}
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-brand-500"><MonitorUp className="h-3 w-3" /> Jamie is sharing screen</div>
                  </div>
                </div>
                {tiles.map(([t, g]) => (
                  <div key={t} className={`grid aspect-video place-items-center rounded-lg bg-gradient-to-br ${g} text-sm font-bold text-white`}>{t}</div>
                ))}
              </div>
              <div className="mt-3 flex justify-center gap-2">
                {[Mic, Video, MonitorUp].map((I, i) => <span key={i} className="grid h-9 w-9 place-items-center rounded-full bg-slate-700 text-white"><I className="h-4 w-4" /></span>)}
                <span className="grid h-9 place-items-center rounded-full bg-red-500 px-4 text-xs font-semibold text-white">Leave</span>
              </div>
            </div>
            <div className="card absolute -left-8 bottom-20 hidden w-56 p-4 sm:block">
              <div className="flex items-center gap-2 font-bold"><BarChart3 className="h-5 w-5 text-brand-600" />Keep Learning</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {["Live classes", "Certificates", "Career support", "Recorded replays"].map((x) => <li key={x} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-600" />{x}</li>)}
              </ul>
            </div>
            <p className="absolute -bottom-10 right-2 rotate-[-6deg] font-script text-3xl text-brand-700">A brighter you starts here</p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="container-x py-16">
        <div className="flex items-end justify-between">
          <div><h2 className="text-3xl font-extrabold tracking-tight">Popular Categories</h2><p className="mt-1 text-slate-500">Explore in-demand skills and find the right bootcamp for your goals.</p></div>
          <Link href="/bootcamps" className="hidden text-sm font-semibold text-brand-600 sm:flex items-center gap-1">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((c) => {
            const [icon, bg, fg] = catStyle[c];
            return (
              <Link key={c} href={`/bootcamps?category=${encodeURIComponent(c)}`} className={`rounded-2xl ${bg} p-5 text-center transition hover:-translate-y-1 hover:shadow-md`}>
                <Icon name={icon} className={`mx-auto h-8 w-8 ${fg}`} />
                <div className="mt-3 text-sm font-semibold">{c}</div>
                <div className="text-xs text-slate-500">{countMap[c] ?? 0} bootcamps</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-x pb-16">
        <div className="flex items-end justify-between">
          <div><h2 className="text-3xl font-extrabold tracking-tight">Featured Bootcamps</h2><p className="mt-1 text-slate-500">Handpicked programs from top instructors to help you build real skills.</p></div>
          <Link href="/bootcamps" className="hidden text-sm font-semibold text-brand-600 sm:flex items-center gap-1">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((b) => <BootcampCard key={b.id} b={b} />)}
        </div>
      </section>

      {/* WHY */}
      <section id="why" className="bg-slate-50/70 py-16">
        <div className="container-x">
          <div className="flex items-start justify-between">
            <div><h2 className="text-3xl font-extrabold tracking-tight">Why Learn with PowerSkill?</h2><p className="mt-1 text-slate-500">More than courses — your partner in lifelong learning.</p></div>
            <p className="hidden rotate-[-4deg] font-script text-3xl text-brand-700 md:block">Real skills, real opportunities</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[[Users, "Expert Instructors", "Learn from industry professionals and real-world experts."],
              [Laptop, "Live Virtual Classroom", "Camera, mic and screen sharing with up to 100 classmates."],
              [Award, "Certificates", "Earn recognized certificates to showcase your skills."],
              [Briefcase, "Career Support", "Get resume reviews, mock interviews and job guidance."]].map(([I, t, d]) => {
              const C = I as typeof Users;
              return (<div key={t as string} className="flex gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600"><C className="h-6 w-6" /></span><div><h3 className="font-bold">{t as string}</h3><p className="mt-1 text-sm text-slate-500">{d as string}</p></div></div>);
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="container-x py-16">
        <h2 className="text-3xl font-extrabold tracking-tight">What Our Students Say</h2>
        <p className="mt-1 text-slate-500">Join thousands of learners changing their lives with PowerSkill.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[["Priya S.", "Product Designer", "The live classes made all the difference. I switched careers in 5 months!", "from-pink-400 to-rose-500"],
            ["James T.", "Software Engineer", "Learning with 80 classmates in real time felt like a real campus. Highly recommend.", "from-sky-400 to-blue-600"],
            ["Aiko M.", "JLPT N4 Passer", "The Japanese bootcamp got me through N4 on my first try. Sensei was amazing.", "from-emerald-400 to-teal-600"]].map(([n, r, q, g]) => (
            <figure key={n} className="card flex gap-4 p-6">
              <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br ${g} font-bold text-white`}>{n.split(" ").map((x) => x[0]).join("")}</div>
              <div><blockquote className="text-sm text-slate-600">“{q}”</blockquote><figcaption className="mt-3 text-sm font-bold">{n} <span className="block text-xs font-normal text-slate-500">{r}</span></figcaption></div>
            </figure>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="container-x pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-sky-400 p-8 text-white sm:p-10">
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Stay in the loop</p>
              <h3 className="mt-2 text-2xl font-extrabold">Get new bootcamp batches, tips and exclusive offers.</h3>
            </div>
            <form className="flex gap-2"><input type="email" required placeholder="Enter your email address" className="input border-white/0 text-ink" /><button type="button" className="btn shrink-0 bg-ink text-white hover:bg-slate-800"><Send className="h-4 w-4" />Subscribe</button></form>
          </div>
        </div>
      </section>
    </>
  );
}
