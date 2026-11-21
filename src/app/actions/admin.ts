"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function guard() {
  const s = await getSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "INSTRUCTOR")) throw new Error("Unauthorized");
  return s;
}

const BootcampSchema = z.object({
  title: z.string().trim().min(3, "Title is required."),
  category: z.string().min(1),
  summary: z.string().trim().min(10, "Summary should be at least 10 characters."),
  description: z.string().trim().min(10, "Description is required."),
  instructor: z.string().trim().min(2, "Instructor is required."),
  level: z.string().min(1),
  durationWeeks: z.coerce.number().int().min(1).max(104),
  hoursPerWeek: z.coerce.number().int().min(1).max(60),
  price: z.coerce.number().min(0),
  originalPrice: z.coerce.number().min(0).optional().or(z.literal("").transform(() => undefined)),
  capacity: z.coerce.number().int().min(1).max(100, "Live rooms support up to 100 students."),
  startDate: z.coerce.date(),
  schedule: z.string().trim().min(3, "Schedule is required."),
  imageColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.string().min(1),
  curriculum: z.string(),
  rating: z.coerce.number().min(0).max(5),
});

export type CmsState = { error?: string } | undefined;

export async function saveBootcamp(_: CmsState, fd: FormData): Promise<CmsState> {
  await guard();
  const id = String(fd.get("id") ?? "");
  const parsed = BootcampSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const data = {
    ...d,
    price: Math.round(d.price * 100),
    originalPrice: d.originalPrice ? Math.round(Number(d.originalPrice) * 100) : null,
    curriculum: JSON.stringify(d.curriculum.split("\n").map((l) => l.trim()).filter(Boolean)),
    published: fd.get("published") === "on",
    featured: fd.get("featured") === "on",
  };
  if (id) {
    await prisma.bootcamp.update({ where: { id }, data });
  } else {
    let slug = slugify(d.title);
    if (await prisma.bootcamp.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    await prisma.bootcamp.create({ data: { ...data, slug } });
  }
  revalidatePath("/", "layout");
  redirect("/admin/bootcamps?saved=1");
}

export async function deleteBootcamp(fd: FormData) {
  await guard();
  await prisma.bootcamp.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/", "layout");
}

export async function togglePublish(fd: FormData) {
  await guard();
  const id = String(fd.get("id"));
  const b = await prisma.bootcamp.findUniqueOrThrow({ where: { id } });
  await prisma.bootcamp.update({ where: { id }, data: { published: !b.published } });
  revalidatePath("/", "layout");
}

export async function setEnrollmentStatus(fd: FormData) {
  await guard();
  const status = String(fd.get("status"));
  if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) return;
  await prisma.enrollment.update({ where: { id: String(fd.get("id")) }, data: { status } });
  revalidatePath("/admin", "layout");
}

const SessionSchema = z.object({
  bootcampId: z.string().min(1),
  title: z.string().trim().min(3),
  startsAt: z.coerce.date(),
  durationMin: z.coerce.number().int().min(15).max(480),
});

export async function createClassSession(_: CmsState, fd: FormData): Promise<CmsState> {
  await guard();
  const parsed = SessionSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const camp = await prisma.bootcamp.findUnique({ where: { id: parsed.data.bootcampId } });
  if (!camp) return { error: "Bootcamp not found." };
  await prisma.classSession.create({ data: { ...parsed.data, roomName: `${camp.slug}-${Date.now().toString(36)}` } });
  revalidatePath("/admin/classes");
  return {};
}

export async function setClassStatus(fd: FormData) {
  await guard();
  const status = String(fd.get("status"));
  if (!["SCHEDULED", "LIVE", "ENDED"].includes(status)) return;
  await prisma.classSession.update({ where: { id: String(fd.get("id")) }, data: { status } });
  revalidatePath("/admin/classes");
}
