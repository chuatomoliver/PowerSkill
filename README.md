# PowerSkill — Live Bootcamp Platform

An edtech web app with a **built-in Zoom-style live classroom** (camera, microphone, screen share, chat) for **up to 100 students per room**, a public bootcamp website, and an admin panel (analytics dashboard, CMS and reservations).

## Stack

| Layer | Tech |
|---|---|
| Web app | Next.js 16 (App Router, Server Actions), React 19, TypeScript |
| UI | Tailwind CSS v4, lucide icons, Recharts |
| Data | Prisma + SQLite (swap `provider` to `postgresql` for production) |
| Auth | Email/password (bcrypt) + signed JWT cookie (`jose`) |
| Live video | [LiveKit](https://livekit.io) open-source SFU + `@livekit/components-react` |

### Why an SFU for 40–100 students
Peer-to-peer WebRTC breaks down past ~6 people. LiveKit is a Selective Forwarding Unit: every client uploads once, the server forwards streams. The classroom also enables **simulcast**, **adaptive stream** and **dynacast**, so each student only downloads the video quality of tiles actually on screen, and the grid paginates automatically.

## Quick start

```bash
npm install
```

```bash
npm run db:setup        # create SQLite DB + seed 12 bootcamps, 260 students, classes
```

```bash
npm run livekit         # start local LiveKit server in Docker (ws://localhost:7880)
```

```bash
npm run dev             # http://localhost:3000
```

No Docker? `brew install livekit && livekit-server --dev` works the same.

### Demo accounts (seeded, dev only)
- Admin: `admin@powerskill.test` / `admin123`
- Student: `student@powerskill.test` / `student123` (confirmed in Full-Stack and Japanese)

### Test accounts — 3 per role (dev only)

| Role | Emails | Password |
|---|---|---|
| ADMIN | `admin1@powerskill.test`, `admin2@…`, `admin3@…` | `admin123` |
| INSTRUCTOR | `instructor1@powerskill.test`, `instructor2@…`, `instructor3@…` | `instructor123` |
| STUDENT | `student1@powerskill.test`, `student2@…`, `student3@…` | `student123` |

Test students are confirmed in Full-Stack and Japanese, so they can join live classes immediately. Instructors currently have the same access as admins. `npm run db:setup` creates them; to add them to an existing database without wiping it:

```bash
npm run db:test-users
```

## Features

**Website** — home page, bootcamp catalog with search & category filters, bootcamp detail with curriculum, seat reservation, student "My Learning" dashboard with Join buttons.

**Live classroom** (`/classroom/[room]`) — pre-join camera/mic check, video grid with pagination, screen share (auto-focus layout), chat, live headcount (x / 100), leave. Access rules:
- Admins/instructors can always enter (and become room admin); entering marks the class LIVE.
- Students need a **CONFIRMED** enrollment and the class must be open (30 min before start, or "Open doors").
- Room capped at 100 students (checked server-side against the SFU).

**Admin** (`/admin`)
- **Dashboard** — registered students, total & monthly sales, enrollments (confirmed/pending), classes held, pending revenue, average attendance, average order value, seat fill rate; charts for sales by month, registrations, enrollments by category; top bootcamps and latest reservations.
- **Bootcamps CMS** — create / edit / publish / feature / delete, curriculum, pricing, seats, schedule, card color & icon with live preview.
- **Reservations** — filter by status, bootcamp, name/email; confirm / cancel / reopen; CSV export.
- **Live Classes** — schedule sessions, start & host, open doors, end class.

## Smoke tests (dev server running)

```bash
npm run smoke                                         # classroom access rules
```

```bash
npx tsx --env-file=.env scripts/smoke-pages.mts       # every page returns 200
```

## Going to production
- Use **LiveKit Cloud** (or self-host LiveKit with TURN/TLS) and set `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL` (`wss://…`).
- Set a long random `AUTH_SECRET`; switch Prisma to PostgreSQL.
- Payments are not wired: reservations are confirmed manually by an admin. Add Stripe/PayMongo checkout in `src/app/actions/enroll.ts`.
- The newsletter form on the home page is UI only.
