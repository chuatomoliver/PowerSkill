import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Demo accounts (dev only):
//   admin@powerskill.test   / admin123
//   student@powerskill.test / student123
const bootcamps = [
  { slug: "full-stack-software-development", title: "Full-Stack Software Development", category: "Development", icon: "Code", imageColor: "#2563eb", instructor: "Jamie Chen", level: "Beginner", durationWeeks: 16, hoursPerWeek: 10, price: 89900, originalPrice: 129900, schedule: "Mon, Wed & Fri · 7:00–9:00 PM", rating: 4.8, featured: true,
    summary: "Go from zero to job-ready developer with HTML, CSS, JavaScript, React, Node.js and databases.",
    curriculum: ["Web fundamentals: HTML, CSS & Git", "Modern JavaScript & TypeScript", "React and component design", "Node.js, REST APIs & auth", "SQL databases with Prisma", "Testing, CI/CD & deployment", "Capstone project & portfolio review"] },
  { slug: "english-communication-mastery", title: "English Communication Mastery", category: "Language", icon: "Languages", imageColor: "#0891b2", instructor: "Priya Sharma", level: "All Levels", durationWeeks: 10, hoursPerWeek: 5, price: 29900, originalPrice: 44900, schedule: "Tue & Thu · 6:00–8:00 PM", rating: 4.9, featured: true,
    summary: "Speak, write and present in English with confidence for work, interviews and travel.",
    curriculum: ["Pronunciation & fluency drills", "Business email writing", "Meetings & small talk", "Presentations & storytelling", "Job interview practice", "IELTS / TOEIC strategies"] },
  { slug: "japanese-language-jlpt-n5-n4", title: "Japanese Language (JLPT N5–N4)", category: "Language", icon: "Languages", imageColor: "#dc2626", instructor: "Yuki Tanaka", level: "Beginner", durationWeeks: 12, hoursPerWeek: 6, price: 34900, originalPrice: 49900, schedule: "Sat · 9:00 AM–12:00 PM", rating: 4.8, featured: true,
    summary: "Learn hiragana, katakana, essential kanji and everyday conversation to pass the JLPT N5/N4.",
    curriculum: ["Hiragana & katakana", "Basic grammar & particles", "Top 300 kanji", "Everyday conversation", "Japanese work culture", "JLPT mock exams"] },
  { slug: "data-science-with-python", title: "Data Science with Python", category: "Data Science", icon: "BarChart3", imageColor: "#7c3aed", instructor: "Dr. Morgan Lee", level: "Intermediate", durationWeeks: 14, hoursPerWeek: 8, price: 79900, originalPrice: 109900, schedule: "Tue & Thu · 7:00–9:30 PM", rating: 4.8, featured: true,
    summary: "Analyze data, build machine-learning models and communicate insights with Python.",
    curriculum: ["Python for analysis", "NumPy & pandas", "Visualization with matplotlib", "Statistics essentials", "Machine learning with scikit-learn", "Capstone: real dataset project"] },
  { slug: "ui-ux-design-fundamentals", title: "UI/UX Design Fundamentals", category: "Design", icon: "Palette", imageColor: "#db2777", instructor: "Alex Rivera", level: "Beginner", durationWeeks: 8, hoursPerWeek: 6, price: 49900, originalPrice: 69900, schedule: "Mon & Wed · 6:30–8:30 PM", rating: 4.8,
    summary: "Design beautiful, user-centered experiences in Figma, from research to high-fidelity prototypes.",
    curriculum: ["Design thinking", "User research & personas", "Wireframing", "Visual design & typography", "Prototyping in Figma", "Usability testing"] },
  { slug: "digital-marketing-masterclass", title: "Digital Marketing Masterclass", category: "Marketing", icon: "Megaphone", imageColor: "#ea580c", instructor: "Taylor Kim", level: "Intermediate", durationWeeks: 8, hoursPerWeek: 5, price: 44900, originalPrice: 59900, schedule: "Wed · 7:00–10:00 PM", rating: 4.6,
    summary: "Grow brands with SEO, paid ads, social media and data-driven content strategy.",
    curriculum: ["Marketing funnels", "SEO & content", "Google & Meta ads", "Social media strategy", "Email automation", "Analytics & attribution"] },
  { slug: "cloud-and-devops-engineering", title: "Cloud & DevOps Engineering", category: "Development", icon: "Cloud", imageColor: "#0284c7", instructor: "Sam Okafor", level: "Intermediate", durationWeeks: 12, hoursPerWeek: 8, price: 84900, originalPrice: 119900, schedule: "Mon & Thu · 7:00–9:30 PM", rating: 4.7,
    summary: "Master Linux, Docker, Kubernetes, AWS and CI/CD pipelines used by modern engineering teams.",
    curriculum: ["Linux & networking", "Docker containers", "Kubernetes", "AWS core services", "Terraform IaC", "CI/CD & observability"] },
  { slug: "cybersecurity-fundamentals", title: "Cybersecurity Fundamentals", category: "IT & Security", icon: "ShieldCheck", imageColor: "#16a34a", instructor: "Nadia Haddad", level: "Beginner", durationWeeks: 10, hoursPerWeek: 6, price: 69900, originalPrice: 89900, schedule: "Tue & Fri · 7:00–9:00 PM", rating: 4.7,
    summary: "Learn to protect systems and networks: threats, defenses, tools and security operations.",
    curriculum: ["Security principles", "Networking & protocols", "Threats & vulnerabilities", "Defensive tooling", "Incident response", "Security+ exam prep"] },
  { slug: "mobile-app-development-flutter", title: "Mobile App Development with Flutter", category: "Development", icon: "Smartphone", imageColor: "#0d9488", instructor: "Carlos Mendes", level: "Intermediate", durationWeeks: 10, hoursPerWeek: 7, price: 64900, originalPrice: 84900, schedule: "Sat & Sun · 1:00–4:00 PM", rating: 4.6,
    summary: "Build and ship beautiful iOS and Android apps from a single Dart codebase.",
    curriculum: ["Dart essentials", "Widgets & layout", "State management", "APIs & local storage", "Firebase integration", "Publishing to app stores"] },
  { slug: "ai-and-prompt-engineering", title: "AI & Prompt Engineering", category: "Data Science", icon: "Sparkles", imageColor: "#9333ea", instructor: "Dr. Morgan Lee", level: "All Levels", durationWeeks: 6, hoursPerWeek: 5, price: 39900, originalPrice: 54900, schedule: "Thu · 7:00–9:30 PM", rating: 4.9,
    summary: "Use large language models effectively and build AI-powered tools and automations.",
    curriculum: ["How LLMs work", "Prompt design patterns", "Retrieval & context", "Building with AI APIs", "Agents & automation", "Responsible AI"] },
  { slug: "project-management-agile-scrum", title: "Project Management: Agile & Scrum", category: "Business", icon: "Briefcase", imageColor: "#ca8a04", instructor: "Grace Park", level: "All Levels", durationWeeks: 6, hoursPerWeek: 4, price: 34900, originalPrice: 49900, schedule: "Sat · 2:00–5:00 PM", rating: 4.7,
    summary: "Lead projects with Agile, Scrum and Kanban and prepare for PSM / CAPM certification.",
    curriculum: ["Project lifecycle", "Agile mindset", "Scrum roles & events", "Kanban & flow", "Stakeholder management", "Certification prep"] },
  { slug: "korean-language-beginner", title: "Korean Language for Beginners", category: "Language", icon: "Languages", imageColor: "#4f46e5", instructor: "Min-ji Seo", level: "Beginner", durationWeeks: 10, hoursPerWeek: 4, price: 27900, originalPrice: 39900, schedule: "Sun · 10:00 AM–12:00 PM", rating: 4.8,
    summary: "Read Hangul, master everyday expressions and hold simple conversations in Korean.",
    curriculum: ["Hangul in one week", "Greetings & introductions", "Numbers, time & shopping", "Basic grammar patterns", "K-culture & media", "TOPIK I preparation"] },
];

const firstNames = ["Liam","Olivia","Noah","Emma","Ethan","Ava","Lucas","Mia","Mason","Sofia","Logan","Isabella","Aiden","Chloe","Kai","Hana","Ravi","Aisha","Diego","Lea","Marco","Yuna","Omar","Zara","Ken","Nina","Leo","Ivy","Ryu","Maya"];
const lastNames = ["Santos","Reyes","Cruz","Garcia","Tan","Lim","Nguyen","Patel","Kim","Sato","Smith","Lopez","Silva","Wong","Ali","Khan","Park","Ito","Rossi","Brown"];

function rand<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  await prisma.classSession.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.bootcamp.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({ data: { name: "Admin", email: "admin@powerskill.test", password: await bcrypt.hash("admin123", 10), role: "ADMIN" } });
  const demo = await prisma.user.create({ data: { name: "Demo Student", email: "student@powerskill.test", password: await bcrypt.hash("student123", 10), role: "STUDENT" } });

  const now = new Date();
  const createdCamps = [];
  for (const [i, b] of bootcamps.entries()) {
    const startDate = new Date(now.getTime() + (7 + i * 5) * 86400000);
    createdCamps.push(await prisma.bootcamp.create({
      data: { ...b, curriculum: JSON.stringify(b.curriculum), startDate, capacity: 100,
        description: `${b.summary}\n\nThis live, instructor-led bootcamp combines interactive classes (up to 100 students per room), hands-on projects and 1:1 career support. Every class is held in our built-in virtual classroom — no extra software needed.` },
    }));
  }

  for (const i of [0, 2]) await prisma.enrollment.create({ data: { userId: demo.id, bootcampId: createdCamps[i].id, status: "CONFIRMED", amount: createdCamps[i].price } });

  // ~260 students spread over the last 6 months, with enrollments for analytics
  const pw = await bcrypt.hash("student123", 10);
  for (let i = 0; i < 260; i++) {
    const created = new Date(now.getTime() - Math.floor(Math.random() * 180) * 86400000);
    const fn = rand(firstNames), ln = rand(lastNames);
    const user = await prisma.user.create({ data: { name: `${fn} ${ln}`, email: `${fn}.${ln}.${i}@example.com`.toLowerCase(), password: pw, createdAt: created } });
    const picks = new Set<number>();
    const n = Math.random() < 0.7 ? 1 : 2;
    while (picks.size < n) picks.add(Math.floor(Math.random() * createdCamps.length));
    for (const idx of picks) {
      const camp = createdCamps[idx];
      const r = Math.random();
      const status = r < 0.78 ? "CONFIRMED" : r < 0.92 ? "PENDING" : "CANCELLED";
      await prisma.enrollment.create({ data: { userId: user.id, bootcampId: camp.id, status, amount: camp.price, createdAt: new Date(created.getTime() + Math.random() * 3 * 86400000) } });
    }
  }

  // Class sessions: past (ended) and upcoming; one "LIVE" demo room per featured camp
  for (const camp of createdCamps) {
    for (let k = -6; k <= 3; k++) {
      const startsAt = new Date(now.getTime() + k * 3.5 * 86400000);
      await prisma.classSession.create({ data: {
        bootcampId: camp.id, title: `${camp.title} — Session ${k + 7}`,
        roomName: `${camp.slug}-s${k + 7}`, startsAt, status: k < 0 ? "ENDED" : "SCHEDULED",
        attendees: k < 0 ? 35 + Math.floor(Math.random() * 60) : 0 } });
    }
  }
  console.log("Seeded", createdCamps.length, "bootcamps");
}

main().finally(() => prisma.$disconnect());
