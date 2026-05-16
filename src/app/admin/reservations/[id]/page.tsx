import Link from "next/link";
import { notFound } from "next/navigation";
import { RezervacijaStatus } from "@/../generated/prisma/client";
import {
  addServiceToReservationAction,
  cancelReservationAction,
  removeServiceFromReservationAction,
  updateReservationHeaderAction,
  updateReservationServiceQuantityAction,
} from "@/server/actions/reservation.actions";
import {
  getReservationById,
  getReservationFormData,
} from "@/server/services/reservation.service";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminReservationDetailsPage({ params }: Props) {
  const { id } = await params;
  const reservationId = Number(id);

  if (!reservationId) {
    notFound();
  }

  const reservation = await getReservationById(reservationId);
  const { zaposlenici, usluge } = await getReservationFormData();

  const totalPrice = reservation.usluge.reduce((sum, item) => {
    return sum + Number(item.usluga.cijena) * item.kolicina;
  }, 0);

  const totalDuration = reservation.usluge.reduce((sum, item) => {
    return sum + item.usluga.trajanjeMin * item.kolicina;
  }, 0);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Rezervacija #{reservation.id}
          </h1>
          <p className="text-gray-600">
            Prikaz rezervacije i pripadnih servisnih usluga.
          </p>
        </div>

        <Link href="/admin/reservations" className="underline">
          Natrag na popis
        </Link>
      </div>

      <section className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Podaci o rezervaciji</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Klijent</p>
            <p className="font-medium">
              {reservation.vozilo.klijent.korisnik.ime}{" "}
              {reservation.vozilo.klijent.korisnik.prezime}
            </p>
            <p className="text-sm text-gray-600">
              {reservation.vozilo.klijent.korisnik.email}
            </p>
            <p className="text-sm text-gray-600">
              {reservation.vozilo.klijent.korisnik.telefon ?? "Nema telefona"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Vozilo</p>
            <p className="font-medium">
              {reservation.vozilo.registracijskaOznaka}
            </p>
            <p className="text-sm text-gray-600">
              {reservation.vozilo.marka} {reservation.vozilo.model},{" "}
              {reservation.vozilo.godinaProizvodnje}.
            </p>
            <p className="text-sm text-gray-600">
              Broj šasije: {reservation.vozilo.brojSasije}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Termin</p>
            <p className="font-medium">
              {reservation.termin.pocetak.toLocaleString("hr-HR")} -{" "}
              {reservation.termin.kraj.toLocaleTimeString("hr-HR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-sm text-gray-600">
              {reservation.termin.poslovnica.naziv},{" "}
              {reservation.termin.poslovnica.adresa},{" "}
              {reservation.termin.poslovnica.grad}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Trenutni status</p>
            <p className="font-medium">{reservation.status}</p>
            <p className="text-sm text-gray-600">
              Ukupno trajanje: {totalDuration} min
            </p>
            <p className="text-sm text-gray-600">
              Ukupna cijena: {totalPrice.toFixed(2)} €
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Uređivanje zaglavlja rezervacije
        </h2>

        <form
          action={updateReservationHeaderAction.bind(null, reservation.id)}
          className="grid gap-4"
        >
          <div>
            <label className="mb-1 block font-medium">Status rezervacije</label>
            <select
              name="status"
              defaultValue={reservation.status}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              {Object.values(RezervacijaStatus).map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">Dodijeljeni serviser</label>
            <select
              name="zaposlenikId"
              defaultValue={reservation.zaposlenikId ?? ""}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="">Bez dodijeljenog servisera</option>
              {zaposlenici.map((zaposlenik) => (
                <option
                  key={zaposlenik.korisnikId}
                  value={zaposlenik.korisnikId}
                >
                  {zaposlenik.korisnik.ime} {zaposlenik.korisnik.prezime}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">Opis problema</label>
            <textarea
              name="opisProblema"
              defaultValue={reservation.opisProblema ?? ""}
              className="min-h-28 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <button
            type="submit"
            className="w-fit rounded bg-black px-4 py-2 text-white"
          >
            Spremi zaglavlje
          </button>
        </form>

        {reservation.status !== RezervacijaStatus.OTKAZANA && (
          <form
            action={cancelReservationAction.bind(null, reservation.id)}
            className="mt-4"
          >
            <button
              type="submit"
              className="rounded bg-red-600 px-4 py-2 text-white"
            >
              Otkaži rezervaciju
            </button>
          </form>
        )}
      </section>

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Servisne usluge u rezervaciji
        </h2>

        <table className="mb-6 w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Usluga</th>
              <th className="p-2">Trajanje</th>
              <th className="p-2">Cijena</th>
              <th className="p-2">Količina</th>
              <th className="p-2">Ukupno</th>
              <th className="p-2">Akcije</th>
            </tr>
          </thead>

          <tbody>
            {reservation.usluge.map((item) => (
              <tr key={item.uslugaId} className="border-b">
                <td className="p-2">
                  <p className="font-medium">{item.usluga.naziv}</p>
                  {!item.usluga.aktivna && (
                    <p className="text-sm text-red-600">
                      Usluga više nije aktivna
                    </p>
                  )}
                </td>

                <td className="p-2">
                  {item.usluga.trajanjeMin * item.kolicina} min
                </td>

                <td className="p-2">{String(item.usluga.cijena)} €</td>

                <td className="p-2">
                  <form
                    action={updateReservationServiceQuantityAction.bind(
                      null,
                      reservation.id,
                      item.uslugaId
                    )}
                    className="flex gap-2"
                  >
                    <input
                      name="kolicina"
                      type="number"
                      min="1"
                      max="10"
                      defaultValue={item.kolicina}
                      className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />

                    <button
                      type="submit"
                      className="rounded bg-gray-900 px-3 py-1 text-white"
                    >
                      Spremi
                    </button>
                  </form>
                </td>

                <td className="p-2">
                  {(Number(item.usluga.cijena) * item.kolicina).toFixed(2)} €
                </td>

                <td className="p-2">
                  <form
                    action={removeServiceFromReservationAction.bind(
                      null,
                      reservation.id,
                      item.uslugaId
                    )}
                  >
                    <button
                      type="submit"
                      className="rounded bg-red-600 px-3 py-1 text-white"
                    >
                      Ukloni
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {reservation.usluge.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Rezervacija nema dodanih servisnih usluga.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="mb-3 font-semibold text-black">Dodaj novu servisnu uslugu</h3>

          <form
            action={addServiceToReservationAction.bind(null, reservation.id)}
            className="grid gap-3 md:grid-cols-[1fr_120px_auto]"
          >
            <select name="uslugaId" className="rounded border px-3 py-2 text-black">
              <option className="" value="">Odaberi servisnu uslugu</option>
              {usluge.map((usluga) => (
                <option className="text-black" key={usluga.id} value={usluga.id}>
                  {usluga.naziv} — {usluga.trajanjeMin} min —{" "}
                  {String(usluga.cijena)} €
                </option>
              ))}
            </select>

            <input
              name="kolicina"
              type="number"
              min="1"
              max="10"
              defaultValue="1"
              className="rounded-md border bg-white px-3 py-2 text-gray-900 border-black focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />

            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-white"
            >
              Dodaj uslugu
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function statusLabel(status: RezervacijaStatus) {
  const labels: Record<RezervacijaStatus, string> = {
    KREIRANA: "Čeka potvrdu",
    POTVRDENA: "Potvrđena",
    U_TIJEKU: "U tijeku",
    PROVEDENA: "Provedena",
    OTKAZANA: "Otkazana",
    ODGODENA: "Odgođena",
  };

  return labels[status];
}