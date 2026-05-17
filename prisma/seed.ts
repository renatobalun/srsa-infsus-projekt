/*import {
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
  });*/
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
  const poslovnicaZagreb = await prisma.poslovnica.upsert({
    where: { id: 1 },
    update: {},
    create: {
      naziv: "Auto Servis Zagreb",
      adresa: "Servisna 12",
      grad: "Zagreb",
    },
  });

  const poslovnicaVarazdin = await prisma.poslovnica.upsert({
    where: { id: 2 },
    update: {},
    create: {
      naziv: "Auto Servis Varaždin",
      adresa: "Mehaničarska 5",
      grad: "Varaždin",
    },
  });

  const klijentIvan = await prisma.korisnik.upsert({
    where: { email: "ivan.horvat@example.com" },
    update: {},
    create: {
      ime: "Ivan",
      prezime: "Horvat",
      email: "ivan.horvat@example.com",
      telefon: "0911234567",
      lozinka: "test123",
      uloga: UlogaKorisnika.KLIJENT,
      klijent: { create: {} },
    },
  });

  const klijentPetra = await prisma.korisnik.upsert({
    where: { email: "petra.novak@example.com" },
    update: {},
    create: {
      ime: "Petra",
      prezime: "Novak",
      email: "petra.novak@example.com",
      telefon: "0922223333",
      lozinka: "test123",
      uloga: UlogaKorisnika.KLIJENT,
      klijent: { create: {} },
    },
  });

  await prisma.korisnik.upsert({
    where: { email: "marko.serviser@example.com" },
    update: {},
    create: {
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

  await prisma.korisnik.upsert({
    where: { email: "luka.serviser@example.com" },
    update: {},
    create: {
      ime: "Luka",
      prezime: "Kovač",
      email: "luka.serviser@example.com",
      telefon: "0994445555",
      lozinka: "test123",
      uloga: UlogaKorisnika.SERVISER,
      zaposlenik: {
        create: {
          strucnost: "Elektronika vozila",
        },
      },
    },
  });

  await prisma.korisnik.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      ime: "Ana",
      prezime: "Admin",
      email: "admin@example.com",
      telefon: "0910000000",
      lozinka: "admin123",
      uloga: UlogaKorisnika.ADMIN,
    },
  });

  await prisma.vozilo.upsert({
    where: { registracijskaOznaka: "ZG-1234-AB" },
    update: {},
    create: {
      registracijskaOznaka: "ZG-1234-AB",
      brojSasije: "WVWZZZ1KZAW000001",
      marka: "Volkswagen",
      model: "Golf",
      godinaProizvodnje: 2018,
      klijentId: klijentIvan.id,
    },
  });

  await prisma.vozilo.upsert({
    where: { registracijskaOznaka: "ZG-5678-CD" },
    update: {},
    create: {
      registracijskaOznaka: "ZG-5678-CD",
      brojSasije: "TMBZZZ5J9K3000002",
      marka: "Škoda",
      model: "Octavia",
      godinaProizvodnje: 2020,
      klijentId: klijentIvan.id,
    },
  });

  await prisma.vozilo.upsert({
    where: { registracijskaOznaka: "VZ-1111-EF" },
    update: {},
    create: {
      registracijskaOznaka: "VZ-1111-EF",
      brojSasije: "VF1RFA00463500003",
      marka: "Renault",
      model: "Clio",
      godinaProizvodnje: 2017,
      klijentId: klijentPetra.id,
    },
  });

  const usluge = [
    { naziv: "Zamjena ulja", trajanjeMin: 30, cijena: 45 },
    { naziv: "Dijagnostika vozila", trajanjeMin: 60, cijena: 60 },
    { naziv: "Zamjena kočionih pločica", trajanjeMin: 90, cijena: 120 },
    { naziv: "Zamjena akumulatora", trajanjeMin: 30, cijena: 80 },
    { naziv: "Servis klime", trajanjeMin: 60, cijena: 75 },
    { naziv: "Balansiranje kotača", trajanjeMin: 45, cijena: 40 },
  ];

  for (const usluga of usluge) {
  const existing = await prisma.servisnaUsluga.findFirst({
    where: {
      naziv: usluga.naziv,
    },
  });

  if (existing) {
    await prisma.servisnaUsluga.update({
      where: {
        id: existing.id,
      },
      data: {
        trajanjeMin: usluga.trajanjeMin,
        cijena: usluga.cijena,
        aktivna: true,
      },
    });
  } else {
    await prisma.servisnaUsluga.create({
      data: {
        naziv: usluga.naziv,
        trajanjeMin: usluga.trajanjeMin,
        cijena: usluga.cijena,
        aktivna: true,
      },
    });
  }
}

  const termini = [
    ["2026-06-15T09:00:00", "2026-06-15T10:00:00", poslovnicaZagreb.id],
    ["2026-06-15T10:00:00", "2026-06-15T11:00:00", poslovnicaZagreb.id],
    ["2026-06-15T11:00:00", "2026-06-15T12:00:00", poslovnicaZagreb.id],
    ["2026-06-15T13:00:00", "2026-06-15T14:00:00", poslovnicaZagreb.id],
    ["2026-06-15T14:00:00", "2026-06-15T15:00:00", poslovnicaZagreb.id],
    ["2026-06-16T09:00:00", "2026-06-16T10:00:00", poslovnicaZagreb.id],
    ["2026-06-16T10:00:00", "2026-06-16T11:00:00", poslovnicaZagreb.id],
    ["2026-06-16T11:00:00", "2026-06-16T12:00:00", poslovnicaVarazdin.id],
    ["2026-06-16T13:00:00", "2026-06-16T14:00:00", poslovnicaVarazdin.id],
    ["2026-06-16T14:00:00", "2026-06-16T15:00:00", poslovnicaVarazdin.id],
    ["2026-06-17T09:00:00", "2026-06-17T10:30:00", poslovnicaVarazdin.id],
    ["2026-06-17T11:00:00", "2026-06-17T12:30:00", poslovnicaZagreb.id],
  ] as const;

  for (const [pocetak, kraj, poslovnicaId] of termini) {
    const existing = await prisma.termin.findFirst({
      where: {
        poslovnicaId,
        pocetak: new Date(pocetak),
        kraj: new Date(kraj),
      },
    });

    if (!existing) {
      await prisma.termin.create({
        data: {
          poslovnicaId,
          pocetak: new Date(pocetak),
          kraj: new Date(kraj),
          status: TerminStatus.SLOBODAN,
        },
      });
    }
  }

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
