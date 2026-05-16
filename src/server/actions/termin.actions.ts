"use server";

import { TerminStatus } from "@/../generated/prisma/client";
import { revalidatePath } from "next/cache";
import {
  createTermUseCase,
  deleteTermUseCase,
  updateTermUseCase,
} from "@/server/services/termin.service";

export async function createTermAction(formData: FormData) {
  const poslovnicaId = Number(formData.get("poslovnicaId"));
  const pocetak = new Date(String(formData.get("pocetak")));
  const kraj = new Date(String(formData.get("kraj")));
  const status = String(formData.get("status")) as TerminStatus;

  await createTermUseCase({
    poslovnicaId,
    pocetak,
    kraj,
    status,
  });

  revalidatePath("/admin/terms");
  revalidatePath("/reservation/new");
}

export async function updateTermAction(id: number, formData: FormData) {
  const poslovnicaId = Number(formData.get("poslovnicaId"));
  const pocetak = new Date(String(formData.get("pocetak")));
  const kraj = new Date(String(formData.get("kraj")));
  const status = String(formData.get("status")) as TerminStatus;

  await updateTermUseCase(id, {
    poslovnicaId,
    pocetak,
    kraj,
    status,
  });

  revalidatePath("/admin/terms");
  revalidatePath("/reservation/new");
}

export async function deleteTermAction(id: number) {
  await deleteTermUseCase(id);

  revalidatePath("/admin/terms");
  revalidatePath("/reservation/new");
}