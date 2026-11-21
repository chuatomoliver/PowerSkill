import "server-only";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { prisma } from "@/lib/db";
import type { Session } from "@/lib/auth";
import { isJoinable } from "@/lib/sessions";

export const MAX_PARTICIPANTS = 100;

const apiKey = process.env.LIVEKIT_API_KEY!;
const apiSecret = process.env.LIVEKIT_API_SECRET!;
const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;
const httpUrl = wsUrl.replace(/^ws/, "http");

export type Access =
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof findSession>>>; isHost: boolean }
  | { ok: false; reason: string };

const findSession = (roomName: string) => prisma.classSession.findUnique({ where: { roomName }, include: { bootcamp: true } });

/** Who may enter: admins/instructors always; students need a CONFIRMED enrollment and the class must be open. */
export async function checkAccess(user: Session, roomName: string): Promise<Access> {
  const session = await findSession(roomName);
  if (!session) return { ok: false, reason: "This class doesn't exist." };
  const isHost = user.role === "ADMIN" || user.role === "INSTRUCTOR";
  if (isHost) return { ok: true, session, isHost };
  const e = await prisma.enrollment.findUnique({ where: { userId_bootcampId: { userId: user.userId, bootcampId: session.bootcampId } } });
  if (e?.status !== "CONFIRMED") return { ok: false, reason: "You need a confirmed enrollment in this bootcamp to join." };
  if (!isJoinable(session)) return { ok: false, reason: session.status === "ENDED" ? "This class has ended." : "This class hasn't opened yet. Doors open 30 minutes before start." };
  return { ok: true, session, isHost };
}

/** Ensure the room exists with a 100-seat cap and report current headcount. Best effort if the SFU API is unreachable. */
export async function prepareRoom(roomName: string, isHost: boolean) {
  const svc = new RoomServiceClient(httpUrl, apiKey, apiSecret);
  try {
    if (isHost) await svc.createRoom({ name: roomName, maxParticipants: MAX_PARTICIPANTS + 5, emptyTimeout: 10 * 60 });
    const people = await svc.listParticipants(roomName).catch(() => []);
    return { count: people.length, reachable: true };
  } catch {
    return { count: 0, reachable: false };
  }
}

export async function createToken(user: Session, roomName: string, isHost: boolean) {
  const at = new AccessToken(apiKey, apiSecret, { identity: user.userId, name: user.name, ttl: "4h", metadata: JSON.stringify({ role: isHost ? "host" : "student" }) });
  at.addGrant({ room: roomName, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: true, roomAdmin: isHost });
  return at.toJwt();
}
