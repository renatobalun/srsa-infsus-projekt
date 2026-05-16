"use server";

import { RezervacijaStatus } from "@/../generated/prisma/client";
import { revalidatePath } from "next/cache";
import {
  addServiceToReservationUseCase,
  createPublicReservationUseCase,
  createReservationUseCase,
  deleteReservationUseCase,
  removeServiceFromReservationUseCase,
  updateReservationHeaderUseCase,
  updateReservationServiceQuantityUseCase,
  cancelReservationUseCase,
  createReservationForLoggedClientUseCase
} from "@/server/services/reservation.service";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";

export async function createLoggedClientReservationAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.uloga !== "KLIJENT") {
    throw new Error("Samo klijent može napraviti korisničku rezervaciju.");
  }

  const rawVoziloId = formData.get("voziloId");
  const voziloId = rawVoziloId ? Number(rawVoziloId) : null;

  const registracijskaOznaka = String(
    formData.get("registracijskaOznaka") ?? ""
  );
  const brojSasije = String(formData.get("brojSasije") ?? "");
  const marka = String(formData.get("marka") ?? "");
  const model = String(formData.get("model") ?? "");
  const godinaProizvodnje = Number(formData.get("godinaProizvodnje"));

  const terminId = Number(formData.get("terminId"));
  const opisProblema = String(formData.get("opisProblema") ?? "");

  const uslugaId = Number(formData.get("uslugaId"));
  const kolicina = Number(formData.get("kolicina") ?? 1);

  await createReservationForLoggedClientUseCase({
    korisnikId: user.id,
    voziloId,
    registracijskaOznaka,
    brojSasije,
    marka,
    model,
    godinaProizvodnje,
    terminId,
    opisProblema,
    usluge: [{ uslugaId, kolicina }],
  });

  revalidatePath("/my-reservations");
  revalidatePath("/admin/reservations");
  revalidatePath("/admin/terms");
  revalidatePath("/reservation/new");

  redirect("/my-reservations");
}

export async function createReservationAction(formData: FormData) {
  const voziloId = Number(formData.get("voziloId"));
  const terminId = Number(formData.get("terminId"));

  const rawZaposlenikId = formData.get("zaposlenikId");
  const zaposlenikId = rawZaposlenikId ? Number(rawZaposlenikId) : null;

  const opisProblema = String(formData.get("opisProblema") ?? "");

  const uslugaId = Number(formData.get("uslugaId"));
  const kolicina = Number(formData.get("kolicina") ?? 1);

  await createReservationUseCase({
    voziloId,
    terminId,
    zaposlenikId,
    opisProblema,
    usluge: [
      {
        uslugaId,
        kolicina,
      },
    ],
  });

  revalidatePath("/admin/reservations");
  redirect("/admin/reservations");
}

export async function cancelReservationAction(reservationId: number) {
  await cancelReservationUseCase(reservationId);

  revalidatePath(`/admin/reservations/${reservationId}`);
  revalidatePath("/admin/reservations");
}

export async function cancelMyReservationAction(reservationId: number) {
  await cancelReservationUseCase(reservationId);

  revalidatePath("/my-reservations");
}

export async function updateReservationHeaderAction(
  reservationId: number,
  formData: FormData
) {
  const rawZaposlenikId = formData.get("zaposlenikId");
  const zaposlenikId = rawZaposlenikId ? Number(rawZaposlenikId) : null;

  const opisProblema = String(formData.get("opisProblema") ?? "");
  const status = String(formData.get("status")) as RezervacijaStatus;

  await updateReservationHeaderUseCase(reservationId, {
    zaposlenikId,
    opisProblema,
    status,
  });

  revalidatePath(`/admin/reservations/${reservationId}`);
  revalidatePath("/admin/reservations");
}

export async function deleteReservationAction(reservationId: number) {
  await deleteReservationUseCase(reservationId);

  revalidatePath("/admin/reservations");
  redirect("/admin/reservations");
}

export async function addServiceToReservationAction(
  reservationId: number,
  formData: FormData
) {
  const serviceId = Number(formData.get("uslugaId"));
  const quantity = Number(formData.get("kolicina") ?? 1);

  await addServiceToReservationUseCase(reservationId, serviceId, quantity);

  revalidatePath(`/admin/reservations/${reservationId}`);
}

export async function updateReservationServiceQuantityAction(
  reservationId: number,
  serviceId: number,
  formData: FormData
) {
  const quantity = Number(formData.get("kolicina") ?? 1);

  await updateReservationServiceQuantityUseCase(
    reservationId,
    serviceId,
    quantity
  );

  revalidatePath(`/admin/reservations/${reservationId}`);
}

export async function removeServiceFromReservationAction(
  reservationId: number,
  serviceId: number
) {
  await removeServiceFromReservationUseCase(reservationId, serviceId);

  revalidatePath(`/admin/reservations/${reservationId}`);
}


export async function createPublicReservationAction(formData: FormData) {
  const ime = String(formData.get("ime") ?? "");
  const prezime = String(formData.get("prezime") ?? "");
  const email = String(formData.get("email") ?? "");
  const telefon = String(formData.get("telefon") ?? "");

  const registracijskaOznaka = String(formData.get("registracijskaOznaka") ?? "");
  const brojSasije = String(formData.get("brojSasije") ?? "");
  const marka = String(formData.get("marka") ?? "");
  const model = String(formData.get("model") ?? "");
  const godinaProizvodnje = Number(formData.get("godinaProizvodnje"));

  const terminId = Number(formData.get("terminId"));
  const opisProblema = String(formData.get("opisProblema") ?? "");

  const uslugaId = Number(formData.get("uslugaId"));
  const kolicina = Number(formData.get("kolicina") ?? 1);

  await createPublicReservationUseCase({
    ime,
    prezime,
    email,
    telefon,
    registracijskaOznaka,
    brojSasije,
    marka,
    model,
    godinaProizvodnje,
    terminId,
    opisProblema,
    usluge: [
      {
        uslugaId,
        kolicina,
      },
    ],
  });

  revalidatePath("/admin/reservations");
  redirect("/reservation/success");
}

