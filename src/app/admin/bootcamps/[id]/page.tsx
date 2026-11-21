import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BootcampForm } from "../BootcampForm";

export default async function EditBootcamp({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await prisma.bootcamp.findUnique({ where: { id } });
  if (!b) notFound();
  return (<div className="space-y-6"><h1 className="text-2xl font-extrabold tracking-tight">Edit: {b.title}</h1><BootcampForm b={b} /></div>);
}
