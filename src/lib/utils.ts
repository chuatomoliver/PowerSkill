export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

export const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const fmtDateTime = (d: Date | string) =>
  new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const CATEGORIES = ["Development", "Language", "Data Science", "Design", "Marketing", "Business", "IT & Security"] as const;
export const ICONS = ["Code", "Languages", "BarChart3", "Palette", "Megaphone", "Cloud", "ShieldCheck", "Smartphone", "Sparkles", "Briefcase", "BookOpen", "GraduationCap"] as const;
