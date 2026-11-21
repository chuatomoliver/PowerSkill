// Smoke test: classroom access rules for the demo student (run with dev server up: npm run smoke)
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
const prisma = new PrismaClient();
const u = await prisma.user.findUniqueOrThrow({ where: { email: "student@powerskill.test" } });
const tok = await new SignJWT({ userId: u.id, name: u.name, email: u.email, role: "STUDENT" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(new TextEncoder().encode(process.env.AUTH_SECRET));
for (const room of ["full-stack-software-development-s7", "full-stack-software-development-s9", "english-communication-mastery-s7"]) {
  const r = await fetch("http://localhost:3000/api/livekit-token", { method: "POST", headers: { cookie: `session=${tok}`, "content-type": "application/json" }, body: JSON.stringify({ room }) });
  const j = await r.json(); console.log(room, r.status, j.error ?? "token ok");
}
const r = await fetch("http://localhost:3000/api/livekit-token", { method: "POST", body: "{}" }); console.log("anon", r.status);
