import type { Prisma } from "@prisma/client";

export type EnrollmentFilters = { q?: string; status?: string; bootcamp?: string };

export function enrollmentWhere({ q, status, bootcamp }: EnrollmentFilters): Prisma.EnrollmentWhereInput {
  return {
    ...(status && { status }),
    ...(bootcamp && { bootcampId: bootcamp }),
    ...(q && { user: { OR: [{ name: { contains: q } }, { email: { contains: q } }] } }),
  };
}
