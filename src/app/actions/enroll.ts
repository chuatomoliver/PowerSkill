"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function enroll(_: { error?: string } | undefined, fd: FormData) {
  const bootcampId = String(fd.get("bootcampId"));
  const s = await getSession();
  const camp = await prisma.bootcamp.findUnique({ where: { id: bootcampId }, include: { _count: { select: { enrollments: { where: { status: { not: "CANCELLED" } } } } } } });
  if (!camp || !camp.published) return { error: "Bootcamp not found." };
  if (!s) redirect(`/login?next=/bootcamps/${camp.slug}`);
  if (camp._count.enrollments >= camp.capacity) return { error: "This bootcamp is full. Please choose another batch." };
  const existing = await prisma.enrollment.findUnique({ where: { userId_bootcampId: { userId: s.userId, bootcampId } } });
  if (existing && existing.status !== "CANCELLED") return { error: "You're already enrolled in this bootcamp." };
  const data = { status: "PENDING", amount: camp.price, phone: String(fd.get("phone") ?? "") || null, notes: String(fd.get("notes") ?? "") || null };
  if (existing) await prisma.enrollment.update({ where: { id: existing.id }, data });
  else await prisma.enrollment.create({ data: { ...data, userId: s.userId, bootcampId } });
  revalidatePath("/admin");
  redirect("/dashboard?enrolled=1");
}
