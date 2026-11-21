"use client";
import Link from "next/link";
import { useActionState } from "react";
import { enroll } from "@/app/actions/enroll";

export function EnrollForm({ bootcampId, loggedIn, slug }: { bootcampId: string; loggedIn: boolean; slug: string }) {
  const [state, action, pending] = useActionState(enroll, undefined);
  if (!loggedIn) return <Link href={`/login?next=/bootcamps/${slug}`} className="btn-primary w-full py-3">Log in to reserve a seat</Link>;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="bootcampId" value={bootcampId} />
      <div><label className="label">Phone (optional)</label><input name="phone" className="input" placeholder="+63 900 000 0000" /></div>
      <div><label className="label">Notes for the instructor (optional)</label><textarea name="notes" rows={2} className="input" placeholder="Your goals, experience…" /></div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full py-3">{pending ? "Reserving…" : "Reserve my seat"}</button>
      <p className="text-center text-xs text-slate-500">Reservation is confirmed by our team. No payment taken now.</p>
    </form>
  );
}
