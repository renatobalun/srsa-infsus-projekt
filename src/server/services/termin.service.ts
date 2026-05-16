import { TerminStatus } from "@/../generated/prisma/client";
import {
  createTerm,
  deleteTerm,
  findBranches,
  findOverlappingTerm,
  findTermById,
  findTerms,
  updateTerm,
} from "@/server/repositories/termin.repository";

export type TermInput = {
  poslovnicaId: number;
  pocetak: Date;
  kraj: Date;
  status?: TerminStatus;
};

export async function getTerms() {
  return findTerms();
}

export async function getTermFormData() {
  const poslovnice = await findBranches();

  return {
    poslovnice,
  };
}

export async function createTermUseCase(input: TermInput) {
  await validateTerm(input);

  return createTerm({
    poslovnicaId: input.poslovnicaId,
    pocetak: input.pocetak,
    kraj: input.kraj,
    status: input.status ?? TerminStatus.SLOBODAN,
  });
}

export async function updateTermUseCase(id: number, input: TermInput) {
  const term = await findTermById(id);

  if (!term) {
    throw new Error("Termin ne postoji.");
  }

  if (term.status === TerminStatus.REZERVIRAN) {
    throw new Error("Rezervirani termin nije moguće ručno mijenjati.");
  }

  await validateTerm(input, id);

  return updateTerm(id, {
    poslovnicaId: input.poslovnicaId,
    pocetak: input.pocetak,
    kraj: input.kraj,
    status: input.status ?? TerminStatus.SLOBODAN,
  });
}

export async function deleteTermUseCase(id: number) {
  const term = await findTermById(id);

  if (!term) {
    throw new Error("Termin ne postoji.");
  }

  if (term.status === TerminStatus.REZERVIRAN || term.rezervacije.length > 0) {
    throw new Error("Termin koji ima rezervaciju nije moguće obrisati.");
  }

  return deleteTerm(id);
}

async function validateTerm(input: TermInput, excludeTermId?: number) {
  if (!input.poslovnicaId) {
    throw new Error("Poslovnica mora biti odabrana.");
  }

  if (!input.pocetak || !input.kraj) {
    throw new Error("Početak i kraj termina moraju biti uneseni.");
  }

  if (input.kraj <= input.pocetak) {
    throw new Error("Kraj termina mora biti nakon početka termina.");
  }

  const durationMin =
    (input.kraj.getTime() - input.pocetak.getTime()) / (1000 * 60);

  if (durationMin < 30) {
    throw new Error("Termin mora trajati barem 30 minuta.");
  }

  if (durationMin > 480) {
    throw new Error("Termin ne može trajati dulje od 8 sati.");
  }

  const overlappingTerm = await findOverlappingTerm({
    poslovnicaId: input.poslovnicaId,
    pocetak: input.pocetak,
    kraj: input.kraj,
    excludeTermId,
  });

  if (overlappingTerm) {
    throw new Error("U odabranoj poslovnici već postoji termin koji se preklapa.");
  }
}