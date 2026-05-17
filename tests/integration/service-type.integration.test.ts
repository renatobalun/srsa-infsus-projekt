import { beforeEach, describe, expect, it, vi } from "vitest";

const createServiceTypeMock = vi.fn();
const findServiceTypesMock = vi.fn();

vi.mock("@/server/repositories/service-type.repository", () => ({
  createServiceType: (...args: any[]) => createServiceTypeMock(...args),
  findServiceTypes: (...args: any[]) => findServiceTypesMock(...args),
  findServiceTypeById: vi.fn(),
  updateServiceType: vi.fn(),
  deleteServiceType: vi.fn(),
  deactivateServiceType: vi.fn(),
  isServiceTypeUsed: vi.fn(),
}));

import {
  createServiceTypeUseCase,
  getServiceTypes,
} from "@/server/services/service-type.service";

describe("Integracija ServiceTypeService i ServiceTypeRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("poslovni sloj poziva repository sloj kod stvaranja servisne usluge", async () => {
    createServiceTypeMock.mockResolvedValue({
      id: 1,
      naziv: "Zamjena ulja",
      trajanjeMin: 30,
      cijena: 45,
      aktivna: true,
    });

    const result = await createServiceTypeUseCase({
      naziv: "Zamjena ulja",
      trajanjeMin: 30,
      cijena: 45,
      aktivna: true,
    });

    expect(createServiceTypeMock).toHaveBeenCalledWith({
      naziv: "Zamjena ulja",
      trajanjeMin: 30,
      cijena: 45,
      aktivna: true,
    });

    expect(result.naziv).toBe("Zamjena ulja");
  });

  it("poslovni sloj dohvaća podatke preko repository sloja", async () => {
    findServiceTypesMock.mockResolvedValue([
      {
        id: 1,
        naziv: "Dijagnostika",
      },
    ]);

    const result = await getServiceTypes("Dijagnostika");

    expect(findServiceTypesMock).toHaveBeenCalledWith("Dijagnostika");
    expect(result[0].naziv).toBe("Dijagnostika");
  });
});