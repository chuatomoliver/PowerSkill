import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAccess, createToken, prepareRoom, MAX_PARTICIPANTS } from "@/lib/classroom";

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { room } = (await req.json().catch(() => ({}))) as { room?: string };
  if (!room) return NextResponse.json({ error: "Missing room." }, { status: 400 });

  const access = await checkAccess(user, room);
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: 403 });

  const { count } = await prepareRoom(room, access.isHost);
  if (!access.isHost && count >= MAX_PARTICIPANTS)
    return NextResponse.json({ error: `This class is full (${MAX_PARTICIPANTS} participants).` }, { status: 409 });

  if (access.isHost && access.session.status === "SCHEDULED")
    await prisma.classSession.update({ where: { id: access.session.id }, data: { status: "LIVE" } });
  await prisma.classSession.update({ where: { id: access.session.id }, data: { attendees: { set: Math.max(access.session.attendees, count + 1) } } });

  return NextResponse.json({ token: await createToken(user, room, access.isHost), url: process.env.NEXT_PUBLIC_LIVEKIT_URL });
}
