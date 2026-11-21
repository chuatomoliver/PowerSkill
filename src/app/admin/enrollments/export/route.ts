import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { enrollmentWhere } from "@/lib/enrollmentQuery";

const esc = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "INSTRUCTOR")) return new NextResponse("Unauthorized", { status: 401 });
  const p = req.nextUrl.searchParams;
  const rows = await prisma.enrollment.findMany({ where: enrollmentWhere({ q: p.get("q") ?? undefined, status: p.get("status") ?? undefined, bootcamp: p.get("bootcamp") ?? undefined }), include: { user: true, bootcamp: true }, orderBy: { createdAt: "desc" } });
  const csv = [["Name", "Email", "Phone", "Bootcamp", "Status", "Amount (USD)", "Reserved at", "Notes"], ...rows.map((e) => [e.user.name, e.user.email, e.phone, e.bootcamp.title, e.status, (e.amount / 100).toFixed(2), e.createdAt.toISOString(), e.notes])]
    .map((r) => r.map(esc).join(",")).join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="reservations-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
