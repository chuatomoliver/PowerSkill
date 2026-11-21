"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export type FormState = { error?: string } | undefined;

const safeNext = (n: unknown) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : null);

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").toLowerCase().trim();
  const password = String(fd.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) return { error: "Invalid email or password." };
  await createSession({ userId: user.id, name: user.name, email: user.email, role: user.role as "STUDENT" });
  redirect(safeNext(fd.get("next")) ?? (user.role === "STUDENT" ? "/dashboard" : "/admin"));
}

const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.email("Please enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export async function register(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = RegisterSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const email = parsed.data.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) return { error: "An account with this email already exists." };
  const user = await prisma.user.create({ data: { name: parsed.data.name, email, password: await bcrypt.hash(parsed.data.password, 10) } });
  await createSession({ userId: user.id, name: user.name, email: user.email, role: "STUDENT" });
  redirect(safeNext(fd.get("next")) ?? "/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
