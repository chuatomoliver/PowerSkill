import { Code, Languages, BarChart3, Palette, Megaphone, Cloud, ShieldCheck, Smartphone, Sparkles, Briefcase, BookOpen, GraduationCap, type LucideProps } from "lucide-react";

const map = { Code, Languages, BarChart3, Palette, Megaphone, Cloud, ShieldCheck, Smartphone, Sparkles, Briefcase, BookOpen, GraduationCap };

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = map[name as keyof typeof map] ?? BookOpen;
  return <C {...props} />;
}
