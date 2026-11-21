// Test accounts for local development — 3 per role. DEV ONLY: never seed these in production.
//
//   Role        Email                         Password
//   ADMIN       admin1..3@powerskill.test      admin123
//   INSTRUCTOR  instructor1..3@powerskill.test instructor123
//   STUDENT     student1..3@powerskill.test    student123  (confirmed in Full-Stack + Japanese)
//
// Safe to re-run: existing accounts are updated, nothing else is touched.
// Run on its own with: npm run db:test-users
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const ROLES = [
  { role: "ADMIN", key: "admin", label: "Admin", password: "admin123" },
  { role: "INSTRUCTOR", key: "instructor", label: "Instructor", password: "instructor123" },
  { role: "STUDENT", key: "student", label: "Student", password: "student123" },
] as const;

// Students get confirmed seats here so they can join live classes right away.
const STUDENT_BOOTCAMPS = ["full-stack-software-development", "japanese-language-jlpt-n5-n4"];

export async function createTestUsers(prisma: PrismaClient) {
  const camps = await prisma.bootcamp.findMany({ where: { slug: { in: STUDENT_BOOTCAMPS } } });
  const created: string[] = [];

  for (const r of ROLES) {
    const hash = await bcrypt.hash(r.password, 10);
    for (let n = 1; n <= 3; n++) {
      const email = `${r.key}${n}@powerskill.test`;
      const user = await prisma.user.upsert({
        where: { email },
        update: { role: r.role, password: hash },
        create: { email, name: `Test ${r.label} ${n}`, role: r.role, password: hash },
      });
      if (r.role === "STUDENT")
        for (const c of camps)
          await prisma.enrollment.upsert({
            where: { userId_bootcampId: { userId: user.id, bootcampId: c.id } },
            update: { status: "CONFIRMED" },
            create: { userId: user.id, bootcampId: c.id, status: "CONFIRMED", amount: c.price },
          });
      created.push(`${r.role.padEnd(10)} ${email}`);
    }
  }
  return created;
}

// Allow `tsx prisma/test-users.ts` to run it directly.
if (process.argv[1]?.endsWith("test-users.ts")) {
  const prisma = new PrismaClient();
  createTestUsers(prisma)
    .then((rows) => console.log(`Test accounts ready:\n${rows.join("\n")}`))
    .finally(() => prisma.$disconnect());
}
