// Smoke test: every page returns 200 for an admin session (run with dev server up)
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
const prisma = new PrismaClient();
const a = await prisma.user.findUniqueOrThrow({ where: { email: "admin@powerskill.test" } });
const b = await prisma.bootcamp.findFirstOrThrow();
const tok = await new SignJWT({ userId: a.id, name: a.name, email: a.email, role: "ADMIN" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(new TextEncoder().encode(process.env.AUTH_SECRET));
for (const p of ["/", "/bootcamps", "/bootcamps?category=Language", `/bootcamps/${b.slug}`, "/login", "/register", "/dashboard", "/admin", "/admin/bootcamps", "/admin/bootcamps/new", `/admin/bootcamps/${b.id}`, "/admin/enrollments?status=PENDING", "/admin/enrollments/export", "/admin/classes?view=past"]) {
  const r = await fetch(`http://localhost:3000${p}`, { headers: { cookie: `session=${tok}` }, redirect: "manual" });
  console.log(r.status, p);
}
