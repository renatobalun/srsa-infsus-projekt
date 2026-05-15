-- CreateEnum
CREATE TYPE "UlogaKorisnika" AS ENUM ('KLIJENT', 'SERVISER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TerminStatus" AS ENUM ('SLOBODAN', 'REZERVIRAN', 'NEDOSTUPAN');

-- CreateEnum
CREATE TYPE "RezervacijaStatus" AS ENUM ('KREIRANA', 'POTVRDENA', 'U_TEKU', 'PROVEDENA', 'OTKAZANA', 'ODGODENA');

-- CreateTable
CREATE TABLE "korisnik" (
    "korisnik_id" SERIAL NOT NULL,
    "ime" VARCHAR(50) NOT NULL,
    "prezime" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telefon" VARCHAR(30),
    "lozinka" VARCHAR(255) NOT NULL,
    "uloga" "UlogaKorisnika" NOT NULL DEFAULT 'KLIJENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "korisnik_pkey" PRIMARY KEY ("korisnik_id")
);

-- CreateTable
CREATE TABLE "klijent" (
    "korisnik_id" INTEGER NOT NULL,
    "datum_registracije" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "klijent_pkey" PRIMARY KEY ("korisnik_id")
);

-- CreateTable
CREATE TABLE "zaposlenik" (
    "korisnik_id" INTEGER NOT NULL,
    "strucnost" VARCHAR(100),

    CONSTRAINT "zaposlenik_pkey" PRIMARY KEY ("korisnik_id")
);

-- CreateTable
CREATE TABLE "poslovnica" (
    "poslovnica_id" SERIAL NOT NULL,
    "naziv" VARCHAR(100) NOT NULL,
    "adresa" VARCHAR(150) NOT NULL,
    "grad" VARCHAR(100) NOT NULL,

    CONSTRAINT "poslovnica_pkey" PRIMARY KEY ("poslovnica_id")
);

-- CreateTable
CREATE TABLE "vozilo" (
    "vozilo_id" SERIAL NOT NULL,
    "registracijska_oznaka" VARCHAR(20) NOT NULL,
    "broj_sasije" VARCHAR(50) NOT NULL,
    "marka" VARCHAR(50) NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "godina_proizvodnje" INTEGER NOT NULL,
    "klijent_id" INTEGER NOT NULL,

    CONSTRAINT "vozilo_pkey" PRIMARY KEY ("vozilo_id")
);

-- CreateTable
CREATE TABLE "termin" (
    "termin_id" SERIAL NOT NULL,
    "poslovnica_id" INTEGER NOT NULL,
    "pocetak" TIMESTAMP(3) NOT NULL,
    "kraj" TIMESTAMP(3) NOT NULL,
    "status" "TerminStatus" NOT NULL DEFAULT 'SLOBODAN',

    CONSTRAINT "termin_pkey" PRIMARY KEY ("termin_id")
);

-- CreateTable
CREATE TABLE "servisna_usluga" (
    "usluga_id" SERIAL NOT NULL,
    "naziv" VARCHAR(100) NOT NULL,
    "trajanje_min" INTEGER NOT NULL,
    "cijena" DECIMAL(10,2) NOT NULL,
    "aktivna" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "servisna_usluga_pkey" PRIMARY KEY ("usluga_id")
);

-- CreateTable
CREATE TABLE "rezervacija" (
    "rezervacija_id" SERIAL NOT NULL,
    "vozilo_id" INTEGER NOT NULL,
    "termin_id" INTEGER NOT NULL,
    "zaposlenik_id" INTEGER,
    "datum_rezervacije" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RezervacijaStatus" NOT NULL DEFAULT 'KREIRANA',
    "opis_problema" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rezervacija_pkey" PRIMARY KEY ("rezervacija_id")
);

-- CreateTable
CREATE TABLE "rezervacija_usluga" (
    "rezervacija_id" INTEGER NOT NULL,
    "usluga_id" INTEGER NOT NULL,
    "kolicina" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "rezervacija_usluga_pkey" PRIMARY KEY ("rezervacija_id","usluga_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "korisnik_email_key" ON "korisnik"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vozilo_registracijska_oznaka_key" ON "vozilo"("registracijska_oznaka");

-- CreateIndex
CREATE UNIQUE INDEX "vozilo_broj_sasije_key" ON "vozilo"("broj_sasije");

-- CreateIndex
CREATE INDEX "termin_poslovnica_id_pocetak_idx" ON "termin"("poslovnica_id", "pocetak");

-- CreateIndex
CREATE UNIQUE INDEX "rezervacija_termin_id_key" ON "rezervacija"("termin_id");

-- AddForeignKey
ALTER TABLE "klijent" ADD CONSTRAINT "klijent_korisnik_id_fkey" FOREIGN KEY ("korisnik_id") REFERENCES "korisnik"("korisnik_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zaposlenik" ADD CONSTRAINT "zaposlenik_korisnik_id_fkey" FOREIGN KEY ("korisnik_id") REFERENCES "korisnik"("korisnik_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vozilo" ADD CONSTRAINT "vozilo_klijent_id_fkey" FOREIGN KEY ("klijent_id") REFERENCES "klijent"("korisnik_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "termin" ADD CONSTRAINT "termin_poslovnica_id_fkey" FOREIGN KEY ("poslovnica_id") REFERENCES "poslovnica"("poslovnica_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rezervacija" ADD CONSTRAINT "rezervacija_vozilo_id_fkey" FOREIGN KEY ("vozilo_id") REFERENCES "vozilo"("vozilo_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rezervacija" ADD CONSTRAINT "rezervacija_termin_id_fkey" FOREIGN KEY ("termin_id") REFERENCES "termin"("termin_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rezervacija" ADD CONSTRAINT "rezervacija_zaposlenik_id_fkey" FOREIGN KEY ("zaposlenik_id") REFERENCES "zaposlenik"("korisnik_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rezervacija_usluga" ADD CONSTRAINT "rezervacija_usluga_rezervacija_id_fkey" FOREIGN KEY ("rezervacija_id") REFERENCES "rezervacija"("rezervacija_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rezervacija_usluga" ADD CONSTRAINT "rezervacija_usluga_usluga_id_fkey" FOREIGN KEY ("usluga_id") REFERENCES "servisna_usluga"("usluga_id") ON DELETE RESTRICT ON UPDATE CASCADE;
