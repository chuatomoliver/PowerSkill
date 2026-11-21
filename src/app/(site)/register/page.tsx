import { AuthForm } from "@/components/AuthForm";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="grid min-h-[70vh] place-items-center bg-gradient-to-b from-brand-50/60 to-white px-4 py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold">Start learning today</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">Create a free account to reserve bootcamp seats.</p>
        <AuthForm mode="register" next={next} />
      </div>
    </div>
  );
}
