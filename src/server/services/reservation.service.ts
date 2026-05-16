import { RezervacijaStatus, TerminStatus } from "@/../generated/prisma/client";
import {
  addServiceToReservation,
  createReservationWithServices,
  deleteReservation,
  findActiveServices,
  findEmployees,
  findFreeTerms,
  findReservationById,
  findReservations,
  findServiceById,
  findTermById,
  findVehicleById,
  findVehicles,
  removeServiceFromReservation,
  updateReservation,
  updateReservationServiceQuantity,
  createPublicReservation,
  cancelReservation,
  findReservationsByClientId,
  hasActiveReservationForTerm,
  createReservationForLoggedClient,
  findVehiclesByClientId,
} from "@/server/repositories/reservation.repository";

export type CreateReservationInput = {
  voziloId: number;
  terminId: number;
  zaposlenikId?: number | null;
  opisProblema?: string;
  usluge: {
    uslugaId: number;
    kolicina: number;
  }[];
};

export type PublicReservationInput = {
  ime: string;
  prezime: string;
  email: string;
  telefon?: string;

  registracijskaOznaka: string;
  brojSasije: string;
  marka: string;
  model: string;
  godinaProizvodnje: number;

  terminId: number;
  opisProblema?: string;

  usluge: {
    uslugaId: number;
    kolicina: number;
  }[];
};

export async function getReservations(search?: string) {
  return findReservations(search);
}

export async function getReservationsForClient(clientId: number) {
  return findReservationsByClientId(clientId);
}

export async function getVehiclesForClient(clientId: number) {
  return findVehiclesByClientId(clientId);
}

export async function getReservationById(id: number) {
  const reservation = await findReservationById(id);

  if (!reservation) {
    throw new Error("Rezervacija ne postoji.");
  }

  return reservation;
}

export type LoggedClientReservationInput = {
  korisnikId: number;
  voziloId?: number | null;

  registracijskaOznaka?: string;
  brojSasije?: string;
  marka?: string;
  model?: string;
  godinaProizvodnje?: number;

  terminId: number;
  opisProblema?: string;

  usluge: {
    uslugaId: number;
    kolicina: number;
  }[];
};

export async function cancelReservationUseCase(id: number) {
  const reservation = await getReservationById(id);

  if (reservation.status === RezervacijaStatus.OTKAZANA) {
    throw new Error("Rezervacija je već otkazana.");
  }

  if (!canCancelReservation(reservation.termin.pocetak)) {
    throw new Error(
      "Rezervaciju nije moguće otkazati manje od 24 sata prije termina.",
    );
  }

  return cancelReservation(id);
}

export async function getReservationFormData() {
  const [vozila, termini, zaposlenici, usluge] = await Promise.all([
    findVehicles(),
    findFreeTerms(),
    findEmployees(),
    findActiveServices(),
  ]);

  return {
    vozila,
    termini,
    zaposlenici,
    usluge,
  };
}

export async function createReservationUseCase(input: CreateReservationInput) {
  await validateReservationInput(input);

  return createReservationWithServices(input);
}

export async function updateReservationStatusUseCase(
  id: number,
  status: RezervacijaStatus,
) {
  await getReservationById(id);

  return updateReservation(id, {
    status,
  });
}

export async function updateReservationHeaderUseCase(
  id: number,
  input: {
    zaposlenikId?: number | null;
    opisProblema?: string;
    status: RezervacijaStatus;
  },
) {
  await getReservationById(id);

  return updateReservation(id, {
    zaposlenikId: input.zaposlenikId ?? null,
    opisProblema: input.opisProblema,
    status: input.status,
  });
}

export async function deleteReservationUseCase(id: number) {
  const reservation = await getReservationById(id);

  if (!canCancelReservation(reservation.termin.pocetak)) {
    throw new Error(
      "Rezervaciju nije moguće obrisati manje od 24 sata prije termina.",
    );
  }

  return deleteReservation(id);
}

export async function addServiceToReservationUseCase(
  reservationId: number,
  serviceId: number,
  quantity: number,
) {
  const reservation = await getReservationById(reservationId);
  const service = await findServiceById(serviceId);

  if (!service) {
    throw new Error("Servisna usluga ne postoji.");
  }

  if (!service.aktivna) {
    throw new Error("Servisna usluga nije aktivna.");
  }

  if (quantity < 1 || quantity > 10) {
    throw new Error("Količina mora biti između 1 i 10.");
  }

  const currentServices = reservation.usluge.map((item) => ({
    durationMin: item.usluga.trajanjeMin,
    quantity: item.kolicina,
  }));

  currentServices.push({
    durationMin: service.trajanjeMin,
    quantity,
  });

  validateTotalServiceDuration(
    reservation.termin.pocetak,
    reservation.termin.kraj,
    currentServices,
  );

  return addServiceToReservation(reservationId, serviceId, quantity);
}

export async function updateReservationServiceQuantityUseCase(
  reservationId: number,
  serviceId: number,
  quantity: number,
) {
  const reservation = await getReservationById(reservationId);

  if (quantity < 1 || quantity > 10) {
    throw new Error("Količina mora biti između 1 i 10.");
  }

  const currentServices = reservation.usluge.map((item) => ({
    serviceId: item.uslugaId,
    durationMin: item.usluga.trajanjeMin,
    quantity: item.uslugaId === serviceId ? quantity : item.kolicina,
  }));

  validateTotalServiceDuration(
    reservation.termin.pocetak,
    reservation.termin.kraj,
    currentServices,
  );

  return updateReservationServiceQuantity(reservationId, serviceId, quantity);
}

export async function removeServiceFromReservationUseCase(
  reservationId: number,
  serviceId: number,
) {
  const reservation = await getReservationById(reservationId);

  if (reservation.usluge.length <= 1) {
    throw new Error("Rezervacija mora imati barem jednu servisnu uslugu.");
  }

  return removeServiceFromReservation(reservationId, serviceId);
}

async function validateReservationInput(input: CreateReservationInput) {
  if (!input.voziloId) {
    throw new Error("Vozilo mora biti odabrano.");
  }

  if (!input.terminId) {
    throw new Error("Termin mora biti odabran.");
  }

  if (!input.usluge || input.usluge.length === 0) {
    throw new Error("Rezervacija mora imati barem jednu servisnu uslugu.");
  }

  const vehicle = await findVehicleById(input.voziloId);

  if (!vehicle) {
    throw new Error("Odabrano vozilo ne postoji.");
  }

  const term = await findTermById(input.terminId);

  if (!term) {
    throw new Error("Odabrani termin ne postoji.");
  }

  if (term.status !== TerminStatus.SLOBODAN) {
    throw new Error("Odabrani termin nije slobodan.");
  }

  const termAlreadyReserved = await hasActiveReservationForTerm(input.terminId);

  if (termAlreadyReserved) {
    throw new Error("Odabrani termin već ima aktivnu rezervaciju.");
  }

  const services = [];

  for (const item of input.usluge) {
    const service = await findServiceById(item.uslugaId);

    if (!service) {
      throw new Error("Odabrana servisna usluga ne postoji.");
    }

    if (!service.aktivna) {
      throw new Error(`Servisna usluga "${service.naziv}" nije aktivna.`);
    }

    if (item.kolicina < 1 || item.kolicina > 10) {
      throw new Error("Količina servisne usluge mora biti između 1 i 10.");
    }

    services.push({
      durationMin: service.trajanjeMin,
      quantity: item.kolicina,
    });
  }

  validateTotalServiceDuration(term.pocetak, term.kraj, services);
}

export function canCancelReservation(termStart: Date, now = new Date()) {
  const diffMs = termStart.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= 24;
}

export function validateTotalServiceDuration(
  termStart: Date,
  termEnd: Date,
  services: {
    durationMin: number;
    quantity: number;
  }[],
) {
  const termDurationMin =
    (termEnd.getTime() - termStart.getTime()) / (1000 * 60);

  const totalServiceDuration = services.reduce((sum, service) => {
    return sum + service.durationMin * service.quantity;
  }, 0);

  if (totalServiceDuration > termDurationMin) {
    throw new Error(
      "Ukupno trajanje odabranih servisnih usluga ne smije biti dulje od trajanja termina.",
    );
  }
}

function validatePublicReservationInput(input: PublicReservationInput) {
  if (input.ime.trim().length < 2) {
    throw new Error("Ime mora imati barem 2 znaka.");
  }

  if (input.prezime.trim().length < 2) {
    throw new Error("Prezime mora imati barem 2 znaka.");
  }

  if (!input.email.includes("@")) {
    throw new Error("Email nije u ispravnom formatu.");
  }

  if (input.registracijskaOznaka.trim().length < 5) {
    throw new Error("Registracijska oznaka nije ispravna.");
  }

  if (input.brojSasije.trim().length < 10) {
    throw new Error("Broj šasije mora imati barem 10 znakova.");
  }

  const currentYear = new Date().getFullYear();

  if (
    input.godinaProizvodnje < 1980 ||
    input.godinaProizvodnje > currentYear + 1
  ) {
    throw new Error("Godina proizvodnje vozila nije u ispravnom rasponu.");
  }

  if (!input.usluge || input.usluge.length === 0) {
    throw new Error("Potrebno je odabrati barem jednu servisnu uslugu.");
  }
}

export async function createPublicReservationUseCase(
  input: PublicReservationInput,
) {
  validatePublicReservationInput(input);

  const term = await findTermById(input.terminId);

  if (!term) {
    throw new Error("Odabrani termin ne postoji.");
  }

  if (term.status !== TerminStatus.SLOBODAN) {
    throw new Error("Odabrani termin nije slobodan.");
  }

  const termAlreadyReserved = await hasActiveReservationForTerm(input.terminId);

  if (termAlreadyReserved) {
    throw new Error("Odabrani termin već ima aktivnu rezervaciju.");
  }

  const services = [];

  for (const item of input.usluge) {
    const service = await findServiceById(item.uslugaId);

    if (!service) {
      throw new Error("Odabrana servisna usluga ne postoji.");
    }

    if (!service.aktivna) {
      throw new Error(`Servisna usluga "${service.naziv}" nije aktivna.`);
    }

    services.push({
      durationMin: service.trajanjeMin,
      quantity: item.kolicina,
    });
  }

  validateTotalServiceDuration(term.pocetak, term.kraj, services);

  return createPublicReservation(input);
}

export async function createReservationForLoggedClientUseCase(
  input: LoggedClientReservationInput,
) {
  validateLoggedClientReservationInput(input);

  const term = await findTermById(input.terminId);

  if (!term) {
    throw new Error("Odabrani termin ne postoji.");
  }

  if (term.status !== TerminStatus.SLOBODAN) {
    throw new Error("Odabrani termin nije slobodan.");
  }

  const termAlreadyReserved = await hasActiveReservationForTerm(input.terminId);

  if (termAlreadyReserved) {
    throw new Error("Odabrani termin već ima aktivnu rezervaciju.");
  }

  const services = [];

  for (const item of input.usluge) {
    const service = await findServiceById(item.uslugaId);

    if (!service) {
      throw new Error("Odabrana servisna usluga ne postoji.");
    }

    if (!service.aktivna) {
      throw new Error(`Servisna usluga "${service.naziv}" nije aktivna.`);
    }

    if (item.kolicina < 1 || item.kolicina > 10) {
      throw new Error("Količina servisne usluge mora biti između 1 i 10.");
    }

    services.push({
      durationMin: service.trajanjeMin,
      quantity: item.kolicina,
    });
  }

  validateTotalServiceDuration(term.pocetak, term.kraj, services);

  return createReservationForLoggedClient(input);
}

function validateLoggedClientReservationInput(
  input: LoggedClientReservationInput,
) {
  if (!input.korisnikId) {
    throw new Error("Korisnik nije prijavljen.");
  }

  if (input.voziloId) {
    if (input.voziloId <= 0) {
      throw new Error("Odabrano vozilo nije ispravno.");
    }
  } else {
    if (
      !input.registracijskaOznaka ||
      input.registracijskaOznaka.trim().length < 5
    ) {
      throw new Error("Registracijska oznaka nije ispravna.");
    }

    if (!input.brojSasije || input.brojSasije.trim().length < 10) {
      throw new Error("Broj šasije mora imati barem 10 znakova.");
    }

    if (!input.marka || input.marka.trim().length < 2) {
      throw new Error("Marka vozila mora imati barem 2 znaka.");
    }

    if (!input.model || input.model.trim().length < 1) {
      throw new Error("Model vozila mora biti unesen.");
    }

    const currentYear = new Date().getFullYear();

    if (
      !input.godinaProizvodnje ||
      input.godinaProizvodnje < 1980 ||
      input.godinaProizvodnje > currentYear + 1
    ) {
      throw new Error("Godina proizvodnje vozila nije u ispravnom rasponu.");
    }
  }

  if (!input.terminId) {
    throw new Error("Termin mora biti odabran.");
  }

  if (!input.usluge || input.usluge.length === 0) {
    throw new Error("Potrebno je odabrati barem jednu servisnu uslugu.");
  }
}
