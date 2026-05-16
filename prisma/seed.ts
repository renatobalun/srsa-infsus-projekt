import {
  PrismaClient,
  UlogaKorisnika,
  TerminStatus,
} from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const poslovnica = await prisma.poslovnica.create({
    data: {
      naziv: "Auto Servis Zagreb",
      adresa: "Servisna 12",
      grad: "Zagreb",
    },
  });

  const klijentUser = await prisma.korisnik.create({
    data: {
      ime: "Ivan",
      prezime: "Horvat",
      email: "ivan.horvat@example.com",
      telefon: "0911234567",
      lozinka: "test123",
      uloga: UlogaKorisnika.KLIJENT,
      klijent: {
        create: {},
      },
    },
  });

  const serviserUser = await prisma.korisnik.create({
    data: {
      ime: "Marko",
      prezime: "Serviser",
      email: "marko.serviser@example.com",
      telefon: "098111222",
      lozinka: "test123",
      uloga: UlogaKorisnika.SERVISER,
      zaposlenik: {
        create: {
          strucnost: "Mehanika i dijagnostika",
        },
      },
    },
  });

  await prisma.korisnik.create({
    data: {
      ime: "Ana",
      prezime: "Admin",
      email: "admin@example.com",
      telefon: "0910000000",
      lozinka: "admin123",
      uloga: UlogaKorisnika.ADMIN,
    },
  });

  await prisma.vozilo.create({
    data: {
      registracijskaOznaka: "ZG-1234-AB",
      brojSasije: "WVWZZZ1KZAW000001",
      marka: "Volkswagen",
      model: "Golf",
      godinaProizvodnje: 2018,
      klijentId: klijentUser.id,
    },
  });

  await prisma.servisnaUsluga.createMany({
    data: [
      {
        naziv: "Zamjena ulja",
        trajanjeMin: 30,
        cijena: 45,
      },
      {
        naziv: "Dijagnostika vozila",
        trajanjeMin: 60,
        cijena: 60,
      },
      {
        naziv: "Zamjena kočionih pločica",
        trajanjeMin: 90,
        cijena: 120,
      },
    ],
  });

  await prisma.termin.createMany({
    data: [
      {
        poslovnicaId: poslovnica.id,
        pocetak: new Date("2026-06-15T09:00:00"),
        kraj: new Date("2026-06-15T10:00:00"),
        status: TerminStatus.SLOBODAN,
      },
      {
        poslovnicaId: poslovnica.id,
        pocetak: new Date("2026-06-15T10:00:00"),
        kraj: new Date("2026-06-15T11:00:00"),
        status: TerminStatus.SLOBODAN,
      },
    ],
  });

  console.log("Seed podaci su uspješno dodani.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
