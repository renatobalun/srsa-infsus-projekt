import { prisma } from "@/lib/prisma";
import { Prisma, RezervacijaStatus, TerminStatus, UlogaKorisnika } from "@/../generated/prisma/client";

export async function findReservations(search?: string) {
  return prisma.rezervacija.findMany({
    where: search
      ? {
          OR: [
            {
              vozilo: {
                registracijskaOznaka: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              vozilo: {
                marka: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              vozilo: {
                model: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              opisProblema: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,
    include: {
      vozilo: {
        include: {
          klijent: {
            include: {
              korisnik: true,
            },
          },
        },
      },
      termin: {
        include: {
          poslovnica: true,
        },
      },
      zaposlenik: {
        include: {
          korisnik: true,
        },
      },
      usluge: {
        include: {
          usluga: true,
        },
      },
    },
    orderBy: {
      datumRezervacije: "desc",
    },
  });
}

export async function findReservationById(id: number) {
  return prisma.rezervacija.findUnique({
    where: {
      id,
    },
    include: {
      vozilo: {
        include: {
          klijent: {
            include: {
              korisnik: true,
            },
          },
        },
      },
      termin: {
        include: {
          poslovnica: true,
        },
      },
      zaposlenik: {
        include: {
          korisnik: true,
        },
      },
      usluge: {
        include: {
          usluga: true,
        },
        orderBy: {
          usluga: {
            naziv: "asc",
          },
        },
      },
    },
  });
}

export async function createReservation(data: Prisma.RezervacijaCreateInput) {
  return prisma.rezervacija.create({
    data,
  });
}

export async function updateReservation(
  id: number,
  data: Prisma.RezervacijaUncheckedUpdateInput
) {
  return prisma.rezervacija.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteReservation(id: number) {
  return prisma.rezervacija.delete({
    where: {
      id,
    },
  });
}

export async function findVehicleById(id: number) {
  return prisma.vozilo.findUnique({
    where: {
      id,
    },
  });
}

export async function findTermById(id: number) {
  return prisma.termin.findUnique({
    where: {
      id,
    },
  });
}

export async function findServiceById(id: number) {
  return prisma.servisnaUsluga.findUnique({
    where: {
      id,
    },
  });
}

export async function findFreeTerms() {
  return prisma.termin.findMany({
    where: {
      status: TerminStatus.SLOBODAN,
    },
    include: {
      poslovnica: true,
    },
    orderBy: {
      pocetak: "asc",
    },
  });
}

export async function findVehicles() {
  return prisma.vozilo.findMany({
    include: {
      klijent: {
        include: {
          korisnik: true,
        },
      },
    },
    orderBy: {
      registracijskaOznaka: "asc",
    },
  });
}

export async function findEmployees() {
  return prisma.zaposlenik.findMany({
    include: {
      korisnik: true,
    },
    orderBy: {
      korisnik: {
        prezime: "asc",
      },
    },
  });
}

export async function findActiveServices() {
  return prisma.servisnaUsluga.findMany({
    where: {
      aktivna: true,
    },
    orderBy: {
      naziv: "asc",
    },
  });
}

export async function addServiceToReservation(
  reservationId: number,
  serviceId: number,
  quantity: number
) {
  return prisma.rezervacijaUsluga.upsert({
    where: {
      rezervacijaId_uslugaId: {
        rezervacijaId: reservationId,
        uslugaId: serviceId,
      },
    },
    update: {
      kolicina: {
        increment: quantity,
      },
    },
    create: {
      rezervacijaId: reservationId,
      uslugaId: serviceId,
      kolicina: quantity,
    },
  });
}

export async function removeServiceFromReservation(
  reservationId: number,
  serviceId: number
) {
  return prisma.rezervacijaUsluga.delete({
    where: {
      rezervacijaId_uslugaId: {
        rezervacijaId: reservationId,
        uslugaId: serviceId,
      },
    },
  });
}

export async function updateReservationServiceQuantity(
  reservationId: number,
  serviceId: number,
  quantity: number
) {
  return prisma.rezervacijaUsluga.update({
    where: {
      rezervacijaId_uslugaId: {
        rezervacijaId: reservationId,
        uslugaId: serviceId,
      },
    },
    data: {
      kolicina: quantity,
    },
  });
}

export async function createReservationWithServices(input: {
  voziloId: number;
  terminId: number;
  zaposlenikId?: number | null;
  opisProblema?: string;
  usluge: {
    uslugaId: number;
    kolicina: number;
  }[];
}) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.rezervacija.create({
      data: {
        voziloId: input.voziloId,
        terminId: input.terminId,
        zaposlenikId: input.zaposlenikId ?? null,
        opisProblema: input.opisProblema,
        status: RezervacijaStatus.KREIRANA,
        usluge: {
          create: input.usluge.map((item) => ({
            uslugaId: item.uslugaId,
            kolicina: item.kolicina,
          })),
        },
      },
    });

    await tx.termin.update({
      where: {
        id: input.terminId,
      },
      data: {
        status: TerminStatus.REZERVIRAN,
      },
    });

    return reservation;
  });

  
}

export async function createPublicReservation(input: {
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
}) {
  return prisma.$transaction(async (tx) => {
    let korisnik = await tx.korisnik.findUnique({
      where: {
        email: input.email,
      },
      include: {
        klijent: true,
      },
    });

    if (!korisnik) {
      korisnik = await tx.korisnik.create({
        data: {
          ime: input.ime.trim(),
          prezime: input.prezime.trim(),
          email: input.email.trim().toLowerCase(),
          telefon: input.telefon?.trim(),
          lozinka: "privremena-lozinka",
          uloga: UlogaKorisnika.KLIJENT,
          klijent: {
            create: {},
          },
        },
        include: {
          klijent: true,
        },
      });
    }

    if (!korisnik.klijent) {
      await tx.klijent.create({
        data: {
          korisnikId: korisnik.id,
        },
      });
    }

    let vozilo = await tx.vozilo.findFirst({
      where: {
        OR: [
          {
            registracijskaOznaka: input.registracijskaOznaka.trim(),
          },
          {
            brojSasije: input.brojSasije.trim(),
          },
        ],
      },
    });

    if (!vozilo) {
      vozilo = await tx.vozilo.create({
        data: {
          registracijskaOznaka: input.registracijskaOznaka.trim().toUpperCase(),
          brojSasije: input.brojSasije.trim().toUpperCase(),
          marka: input.marka.trim(),
          model: input.model.trim(),
          godinaProizvodnje: input.godinaProizvodnje,
          klijentId: korisnik.id,
        },
      });
    }

    const reservation = await tx.rezervacija.create({
      data: {
        voziloId: vozilo.id,
        terminId: input.terminId,
        opisProblema: input.opisProblema?.trim(),
        status: RezervacijaStatus.KREIRANA,
        usluge: {
          create: input.usluge.map((item) => ({
            uslugaId: item.uslugaId,
            kolicina: item.kolicina,
          })),
        },
      },
    });

    await tx.termin.update({
      where: {
        id: input.terminId,
      },
      data: {
        status: TerminStatus.REZERVIRAN,
      },
    });

    return reservation;
  });
}

export async function cancelReservation(id: number) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.rezervacija.update({
      where: {
        id,
      },
      data: {
        status: RezervacijaStatus.OTKAZANA,
      },
    });

    await tx.termin.update({
      where: {
        id: reservation.terminId,
      },
      data: {
        status: TerminStatus.SLOBODAN,
      },
    });

    return reservation;
  });
}

export async function findReservationsByClientId(clientId: number) {
  return prisma.rezervacija.findMany({
    where: {
      vozilo: {
        klijentId: clientId,
      },
    },
    include: {
      vozilo: true,
      termin: {
        include: {
          poslovnica: true,
        },
      },
      zaposlenik: {
        include: {
          korisnik: true,
        },
      },
      usluge: {
        include: {
          usluga: true,
        },
      },
    },
    orderBy: {
      termin: {
        pocetak: "desc",
      },
    },
  });
}

export async function hasActiveReservationForTerm(terminId: number) {
  const count = await prisma.rezervacija.count({
    where: {
      terminId,
      status: {
        not: RezervacijaStatus.OTKAZANA,
      },
    },
  });

  return count > 0;
}

export async function createReservationForLoggedClient(input: {
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
}) {
  return prisma.$transaction(async (tx) => {
    const korisnik = await tx.korisnik.findUnique({
      where: {
        id: input.korisnikId,
      },
      include: {
        klijent: true,
      },
    });

    if (!korisnik) {
      throw new Error("Korisnik ne postoji.");
    }

    if (!korisnik.klijent) {
      await tx.klijent.create({
        data: {
          korisnikId: korisnik.id,
        },
      });
    }

    let vozilo;

    if (input.voziloId) {
      vozilo = await tx.vozilo.findUnique({
        where: {
          id: input.voziloId,
        },
      });

      if (!vozilo) {
        throw new Error("Odabrano vozilo ne postoji.");
      }

      if (vozilo.klijentId !== korisnik.id) {
        throw new Error("Odabrano vozilo ne pripada prijavljenom korisniku.");
      }
    } else {
      const registracijskaOznaka = String(input.registracijskaOznaka ?? "")
        .trim()
        .toUpperCase();

      const brojSasije = String(input.brojSasije ?? "").trim().toUpperCase();

      vozilo = await tx.vozilo.findFirst({
        where: {
          OR: [
            {
              registracijskaOznaka,
            },
            {
              brojSasije,
            },
          ],
        },
      });

      if (!vozilo) {
        vozilo = await tx.vozilo.create({
          data: {
            registracijskaOznaka,
            brojSasije,
            marka: String(input.marka ?? "").trim(),
            model: String(input.model ?? "").trim(),
            godinaProizvodnje: Number(input.godinaProizvodnje),
            klijentId: korisnik.id,
          },
        });
      }

      if (vozilo.klijentId !== korisnik.id) {
        throw new Error(
          "Vozilo s tom registracijom ili brojem šasije već pripada drugom korisniku."
        );
      }
    }

    const reservation = await tx.rezervacija.create({
      data: {
        voziloId: vozilo.id,
        terminId: input.terminId,
        opisProblema: input.opisProblema?.trim(),
        status: "KREIRANA",
        usluge: {
          create: input.usluge.map((item) => ({
            uslugaId: item.uslugaId,
            kolicina: item.kolicina,
          })),
        },
      },
    });

    await tx.termin.update({
      where: {
        id: input.terminId,
      },
      data: {
        status: "REZERVIRAN",
      },
    });

    return reservation;
  });
}

export async function findVehiclesByClientId(clientId: number) {
  return prisma.vozilo.findMany({
    where: {
      klijentId: clientId,
    },
    orderBy: {
      registracijskaOznaka: "asc",
    },
  });
}
