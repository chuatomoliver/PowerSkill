import type { ClassSession } from "@prisma/client";

/** A class is joinable when it's live, or within 30 min before start until its end. */
export function isJoinable(s: Pick<ClassSession, "status" | "startsAt" | "durationMin">, now = Date.now()) {
  if (s.status === "LIVE") return true;
  if (s.status === "ENDED") return false;
  const start = new Date(s.startsAt).getTime();
  return now >= start - 30 * 60000 && now <= start + s.durationMin * 60000;
}

export const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000);
