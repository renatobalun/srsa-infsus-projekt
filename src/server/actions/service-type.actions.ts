"use server";

import {
  createServiceTypeUseCase,
  deleteServiceTypeUseCase,
  updateServiceTypeUseCase,
} from "@/server/services/service-type.service";
import { revalidatePath } from "next/cache";

export async function createServiceTypeAction(formData: FormData) {
  const naziv = String(formData.get("naziv") ?? "");
  const trajanjeMin = Number(formData.get("trajanjeMin"));
  const cijena = Number(formData.get("cijena"));
  const aktivna = formData.get("aktivna") === "on";

  await createServiceTypeUseCase({
    naziv,
    trajanjeMin,
    cijena,
    aktivna,
  });

  revalidatePath("/service-types");
}

export async function updateServiceTypeAction(id: number, formData: FormData) {
  const naziv = String(formData.get("naziv") ?? "");
  const trajanjeMin = Number(formData.get("trajanjeMin"));
  const cijena = Number(formData.get("cijena"));
  const aktivna = formData.get("aktivna") === "on";

  await updateServiceTypeUseCase(id, {
    naziv,
    trajanjeMin,
    cijena,
    aktivna,
  });

  revalidatePath("/service-types");
}

export async function deleteServiceTypeAction(id: number) {
  await deleteServiceTypeUseCase(id);

  revalidatePath("/service-types");
}