"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login, register, type FormState } from "@/app/actions/auth";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : register, undefined);
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {mode === "register" && <div><label className="label">Full name</label><input name="name" required className="input" /></div>}
      <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
      <div><label className="label">Password</label><input name="password" type="password" required minLength={mode === "register" ? 6 : undefined} className="input" /></div>
      {state?.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full py-3">{pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
      <p className="text-center text-sm text-slate-500">
        {mode === "login" ? <>New here? <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-600">Create an account</Link></>
          : <>Already have an account? <Link href="/login" className="font-semibold text-brand-600">Log in</Link></>}
      </p>
    </form>
  );
}
