import { prisma } from "@/lib/prisma";
import { Prisma, TerminStatus } from "@/../generated/prisma/client";

export async function findTerms() {
  return prisma.termin.findMany({
    include: {
      poslovnica: true,
      rezervacije: {
        where: {
          status: {
            not: "OTKAZANA",
          },
        },
        include: {
          vozilo: true,
        },
      },
    },
    orderBy: {
      pocetak: "asc",
    },
  });
}

export async function findTermById(id: number) {
  return prisma.termin.findUnique({
    where: { id },
    include: {
      poslovnica: true,
      rezervacija: true,
    },
  });
}

export async function createTerm(data: Prisma.TerminUncheckedCreateInput) {
  return prisma.termin.create({
    data,
  });
}

export async function updateTerm(
  id: number,
  data: Prisma.TerminUncheckedUpdateInput,
) {
  return prisma.termin.update({
    where: { id },
    data,
  });
}

export async function deleteTerm(id: number) {
  return prisma.termin.delete({
    where: { id },
  });
}

export async function findBranches() {
  return prisma.poslovnica.findMany({
    orderBy: {
      naziv: "asc",
    },
  });
}

export async function findOverlappingTerm(input: {
  poslovnicaId: number;
  pocetak: Date;
  kraj: Date;
  excludeTermId?: number;
}) {
  return prisma.termin.findFirst({
    where: {
      poslovnicaId: input.poslovnicaId,
      id: input.excludeTermId
        ? {
            not: input.excludeTermId,
          }
        : undefined,
      status: {
        not: TerminStatus.NEDOSTUPAN,
      },
      AND: [
        {
          pocetak: {
            lt: input.kraj,
          },
        },
        {
          kraj: {
            gt: input.pocetak,
          },
        },
      ],
    },
  });
}
