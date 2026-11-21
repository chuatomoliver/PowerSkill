import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret");

export type Session = { userId: string; name: string; email: string; role: "STUDENT" | "INSTRUCTOR" | "ADMIN" };

export async function createSession(s: Session) {
  const token = await new SignJWT(s).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function requireUser(next?: string) {
  const s = await getSession();
  if (!s) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return s;
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/login?next=/admin");
  if (s.role !== "ADMIN" && s.role !== "INSTRUCTOR") redirect("/");
  return s;
}
