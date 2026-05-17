import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      servisnaUsluga: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
      },
      rezervacijaUsluga: {
        count: vi.fn(),
      },
    },
  };
});

import { prisma } from "@/lib/prisma";
import {
  createServiceType,
  deactivateServiceType,
  findServiceTypes,
  isServiceTypeUsed,
} from "@/server/repositories/service-type.repository";

const prismaMock = vi.mocked(prisma, true);

describe("ServiceTypeRepository - podatkovni sloj", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dohvaća servisne usluge prema nazivu", async () => {
    prismaMock.servisnaUsluga.findMany.mockResolvedValue([
      {
        id: 1,
        naziv: "Zamjena ulja",
        trajanjeMin: 30,
        cijena: 45 as any,
        aktivna: true,
      },
    ]);

    const result = await findServiceTypes("ulja");

    expect(prismaMock.servisnaUsluga.findMany).toHaveBeenCalled();
    expect(result[0].naziv).toBe("Zamjena ulja");
  });

  it("sprema novu servisnu uslugu", async () => {
    prismaMock.servisnaUsluga.create.mockResolvedValue({
      id: 1,
      naziv: "Dijagnostika",
      trajanjeMin: 60,
      cijena: 50 as any,
      aktivna: true,
    });

    const result = await createServiceType({
      naziv: "Dijagnostika",
      trajanjeMin: 60,
      cijena: 50,
      aktivna: true,
    });

    expect(prismaMock.servisnaUsluga.create).toHaveBeenCalledWith({
      data: {
        naziv: "Dijagnostika",
        trajanjeMin: 60,
        cijena: 50,
        aktivna: true,
      },
    });

    expect(result.naziv).toBe("Dijagnostika");
  });

  it("deaktivira servisnu uslugu", async () => {
    prismaMock.servisnaUsluga.update.mockResolvedValue({
      id: 1,
      naziv: "Dijagnostika",
      trajanjeMin: 60,
      cijena: 50 as any,
      aktivna: false,
    });

    const result = await deactivateServiceType(1);

    expect(prismaMock.servisnaUsluga.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { aktivna: false },
    });

    expect(result.aktivna).toBe(false);
  });

  it("provjerava koristi li se servisna usluga u rezervaciji", async () => {
    prismaMock.rezervacijaUsluga.count.mockResolvedValue(2);

    const result = await isServiceTypeUsed(1);

    expect(prismaMock.rezervacijaUsluga.count).toHaveBeenCalledWith({
      where: {
        uslugaId: 1,
      },
    });

    expect(result).toBe(true);
  });
});