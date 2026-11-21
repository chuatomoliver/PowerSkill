"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";

const SERIES = "#2a78d6";
const AXIS = { fontSize: 12, fill: "#64748b" };
const tip = { contentStyle: { borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }, cursor: { fill: "rgba(42,120,214,0.06)" } };
const usd = (v: number) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`);

export function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#eef2f7" />
        <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={usd} width={48} />
        <Tooltip {...tip} formatter={(v) => [`$${Number(v).toLocaleString()}`, "Confirmed sales"]} />
        <Bar dataKey="revenue" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RegistrationsChart({ data }: { data: { month: string; users: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs><linearGradient id="reg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SERIES} stopOpacity={0.18} /><stop offset="100%" stopColor={SERIES} stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="#eef2f7" />
        <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
        <Tooltip {...tip} cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }} formatter={(v) => [v, "New registrations"]} />
        <Area type="monotone" dataKey="users" stroke={SERIES} strokeWidth={2} fill="url(#reg)" dot={{ r: 4, fill: SERIES, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryChart({ data }: { data: { category: string; enrollments: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, left: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="category" tick={AXIS} axisLine={false} tickLine={false} width={100} />
        <Tooltip {...tip} formatter={(v) => [v, "Enrollments"]} />
        <Bar dataKey="enrollments" fill={SERIES} radius={[0, 4, 4, 0]} barSize={18} label={{ position: "right", fontSize: 12, fill: "#334155" }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
