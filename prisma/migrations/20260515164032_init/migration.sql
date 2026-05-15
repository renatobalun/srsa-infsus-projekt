/*
  Warnings:

  - The values [U_TEKU] on the enum `RezervacijaStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RezervacijaStatus_new" AS ENUM ('KREIRANA', 'POTVRDENA', 'U_TIJEKU', 'PROVEDENA', 'OTKAZANA', 'ODGODENA');
ALTER TABLE "public"."rezervacija" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "rezervacija" ALTER COLUMN "status" TYPE "RezervacijaStatus_new" USING ("status"::text::"RezervacijaStatus_new");
ALTER TYPE "RezervacijaStatus" RENAME TO "RezervacijaStatus_old";
ALTER TYPE "RezervacijaStatus_new" RENAME TO "RezervacijaStatus";
DROP TYPE "public"."RezervacijaStatus_old";
ALTER TABLE "rezervacija" ALTER COLUMN "status" SET DEFAULT 'KREIRANA';
COMMIT;
