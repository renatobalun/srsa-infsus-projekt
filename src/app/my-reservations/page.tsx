import Link from "next/link";
import { redirect } from "next/navigation";
import { RezervacijaStatus } from "@/../generated/prisma/client";
import { getCurrentUser } from "@/server/auth/current-user";
import { getReservationsForClient } from "@/server/services/reservation.service";
import { cancelMyReservationAction } from "@/server/actions/reservation.actions";

export default async function MyReservationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.uloga !== "KLIJENT") {
    redirect("/");
  }

  const reservations = await getReservationsForClient(user.id);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Moje rezervacije</h1>
            <p className="text-gray-700">
              Pregled vaših rezervacija servisa automobila.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/reservation/new"
              className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800"
            >
              Nova rezervacija
            </Link>

            <Link
              href="/"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 hover:bg-gray-100"
            >
              Početna
            </Link>
          </div>
        </div>

        {reservations.length === 0 ? (
          <section className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">
              Nemate rezervacija
            </h2>

            <p className="mb-6 text-gray-700">
              Trenutno nemate nijednu rezervaciju servisa.
            </p>

            <Link
              href="/reservation/new"
              className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800"
            >
              Rezerviraj servis
            </Link>
          </section>
        ) : (
          <section className="grid gap-4">
            {reservations.map((reservation) => {
              const totalPrice = reservation.usluge.reduce((sum, item) => {
                return sum + Number(item.usluga.cijena) * item.kolicina;
              }, 0);

              const totalDuration = reservation.usluge.reduce((sum, item) => {
                return sum + item.usluga.trajanjeMin * item.kolicina;
              }, 0);

              const canCancel =
                reservation.status !== RezervacijaStatus.OTKAZANA &&
                reservation.status !== RezervacijaStatus.PROVEDENA &&
                canCancelByTime(reservation.termin.pocetak);

              return (
                <article
                  key={reservation.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Rezervacija #{reservation.id}
                      </h2>

                      <p className="text-gray-700">
                        Status:{" "}
                        <span className="font-medium">
                          {statusLabel(reservation.status)}
                        </span>
                      </p>
                    </div>

                    <span className={statusBadgeClass(reservation.status)}>
                      {statusLabel(reservation.status)}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-500">Vozilo</p>
                      <p className="font-medium">
                        {reservation.vozilo.registracijskaOznaka}
                      </p>
                      <p className="text-sm text-gray-700">
                        {reservation.vozilo.marka} {reservation.vozilo.model},{" "}
                        {reservation.vozilo.godinaProizvodnje}.
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
                      <p className="text-sm text-gray-700">
                        {reservation.termin.poslovnica.naziv},{" "}
                        {reservation.termin.poslovnica.grad}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Serviser</p>
                      <p className="font-medium">
                        {reservation.zaposlenik
                          ? `${reservation.zaposlenik.korisnik.ime} ${reservation.zaposlenik.korisnik.prezime}`
                          : "Još nije dodijeljen"}
                      </p>
                      <p className="text-sm text-gray-700">
                        Ukupno: {totalDuration} min / {totalPrice.toFixed(2)} €
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="mb-2 font-semibold">Odabrane usluge</h3>

                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-100 text-left">
                          <tr>
                            <th className="p-2">Usluga</th>
                            <th className="p-2">Količina</th>
                            <th className="p-2">Trajanje</th>
                            <th className="p-2">Cijena</th>
                          </tr>
                        </thead>

                        <tbody>
                          {reservation.usluge.map((item) => (
                            <tr key={item.uslugaId} className="border-t">
                              <td className="p-2">{item.usluga.naziv}</td>
                              <td className="p-2">{item.kolicina}</td>
                              <td className="p-2">
                                {item.usluga.trajanjeMin * item.kolicina} min
                              </td>
                              <td className="p-2">
                                {(Number(item.usluga.cijena) * item.kolicina).toFixed(2)} €
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {reservation.opisProblema && (
                    <div className="mt-6 rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Opis problema</p>
                      <p className="text-gray-800">{reservation.opisProblema}</p>
                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-3">
                    {canCancel ? (
                      <form
                        action={cancelMyReservationAction.bind(
                          null,
                          reservation.id
                        )}
                      >
                        <button
                          type="submit"
                          className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                        >
                          Otkaži rezervaciju
                        </button>
                      </form>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Rezervaciju nije moguće otkazati ako je već provedena,
                        otkazana ili je do termina ostalo manje od 24 sata.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function canCancelByTime(termStart: Date) {
  const now = new Date();
  const diffMs = termStart.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= 24;
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

function statusBadgeClass(status: RezervacijaStatus) {
  const base = "rounded-full px-3 py-1 text-sm font-medium";

  const classes: Record<RezervacijaStatus, string> = {
    KREIRANA: `${base} bg-yellow-100 text-yellow-800`,
    POTVRDENA: `${base} bg-blue-100 text-blue-800`,
    U_TIJEKU: `${base} bg-purple-100 text-purple-800`,
    PROVEDENA: `${base} bg-green-100 text-green-800`,
    OTKAZANA: `${base} bg-red-100 text-red-800`,
    ODGODENA: `${base} bg-gray-200 text-gray-800`,
  };

  return classes[status];
}