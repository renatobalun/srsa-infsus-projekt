import { prisma } from "@/lib/prisma";
import { Prisma } from "@/../generated/prisma/client";

export async function findServiceTypes(search?: string) {
  return prisma.servisnaUsluga.findMany({
    where: {
      naziv: search
        ? {
            contains: search,
            mode: "insensitive",
          }
        : undefined,
    },
    orderBy: {
      naziv: "asc",
    },
  });
}

export async function findServiceTypeById(id: number) {
  return prisma.servisnaUsluga.findUnique({
    where: {
      id,
    },
  });
}

export async function createServiceType(data: Prisma.ServisnaUslugaCreateInput) {
  return prisma.servisnaUsluga.create({
    data,
  });
}

export async function updateServiceType(
  id: number,
  data: Prisma.ServisnaUslugaUpdateInput
) {
  return prisma.servisnaUsluga.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteServiceType(id: number) {
  return prisma.servisnaUsluga.delete({
    where: {
      id,
    },
  });
}

export async function deactivateServiceType(id: number) {
  return prisma.servisnaUsluga.update({
    where: {
      id,
    },
    data: {
      aktivna: false,
    },
  });
}

export async function isServiceTypeUsed(id: number) {
  const count = await prisma.rezervacijaUsluga.count({
    where: {
      uslugaId: id,
    },
  });

  return count > 0;
}