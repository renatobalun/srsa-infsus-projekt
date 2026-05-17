import { beforeEach, describe, expect, it, vi } from "vitest";

const findOverlappingTermMock = vi.fn();

vi.mock("@/server/repositories/termin.repository", () => ({
  createTerm: vi.fn((data) => data),
  deleteTerm: vi.fn(),
  findBranches: vi.fn(),
  findOverlappingTerm: (...args: any[]) => findOverlappingTermMock(...args),
  findTermById: vi.fn(),
  findTerms: vi.fn(),
  updateTerm: vi.fn(),
}));

import { createTermUseCase } from "@/server/services/termin.service";

describe("TerminService - poslovni sloj", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findOverlappingTermMock.mockResolvedValue(null);
  });

  it("ne dopušta termin kojem je kraj prije početka", async () => {
    await expect(
      createTermUseCase({
        poslovnicaId: 1,
        pocetak: new Date("2026-06-01T12:00:00"),
        kraj: new Date("2026-06-01T11:00:00"),
      }),
    ).rejects.toThrow("Kraj termina mora biti nakon početka termina.");
  });

  it("ne dopušta termin kraći od 30 minuta", async () => {
    await expect(
      createTermUseCase({
        poslovnicaId: 1,
        pocetak: new Date("2026-06-01T10:00:00"),
        kraj: new Date("2026-06-01T10:20:00"),
      }),
    ).rejects.toThrow("Termin mora trajati barem 30 minuta.");
  });

  it("ne dopušta preklapanje termina u istoj poslovnici", async () => {
    findOverlappingTermMock.mockResolvedValue({ id: 99 });

    await expect(
      createTermUseCase({
        poslovnicaId: 1,
        pocetak: new Date("2026-06-01T10:00:00"),
        kraj: new Date("2026-06-01T11:00:00"),
      }),
    ).rejects.toThrow(
      "U odabranoj poslovnici već postoji termin koji se preklapa.",
    );
  });
});