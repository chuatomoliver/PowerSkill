import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { checkAccess } from "@/lib/classroom";
import { Classroom } from "./Classroom";

export const dynamic = "force-dynamic";

export default async function ClassroomPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const user = await requireUser(`/classroom/${room}`);
  const access = await checkAccess(user, room);
  if (!access.ok)
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white">
        <div><h1 className="text-2xl font-bold">Can&apos;t join this class</h1><p className="mt-2 text-slate-400">{access.reason}</p>
          <Link href="/dashboard" className="btn-primary mt-6">Back to My Learning</Link></div>
      </div>
    );
  return <Classroom room={room} title={access.session.title} bootcamp={access.session.bootcamp.title} userName={user.name} isHost={access.isHost} />;
}
