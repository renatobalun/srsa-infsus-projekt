import Link from "next/link";
import { getReservations } from "@/server/services/reservation.service";

type Props = {
  searchParams?: Promise<{
    search?: string;
  }>;
};

export default async function ReservationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params?.search ?? "";

  const reservations = await getReservations(search);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rezervacije</h1>

        <Link
          href="/reservations/new"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Nova rezervacija
        </Link>
      </div>

      <section className="mb-8 rounded-lg border p-4">
        <h2 className="mb-4 text-xl font-semibold">Pretraživanje</h2>

        <form className="flex gap-3">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Pretraži po registraciji, marki, modelu ili opisu..."
            className="w-full rounded border px-3 py-2"
          />

          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white"
          >
            Pretraži
          </button>
        </form>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="mb-4 text-xl font-semibold">Popis rezervacija</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Vozilo</th>
              <th className="p-2">Klijent</th>
              <th className="p-2">Termin</th>
              <th className="p-2">Status</th>
              <th className="p-2">Akcije</th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="border-b">
                <td className="p-2">{reservation.id}</td>

                <td className="p-2">
                  {reservation.vozilo.registracijskaOznaka} —{" "}
                  {reservation.vozilo.marka} {reservation.vozilo.model}
                </td>

                <td className="p-2">
                  {reservation.vozilo.klijent.korisnik.ime}{" "}
                  {reservation.vozilo.klijent.korisnik.prezime}
                </td>

                <td className="p-2">
                  {reservation.termin.pocetak.toLocaleString("hr-HR")} -{" "}
                  {reservation.termin.kraj.toLocaleTimeString("hr-HR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                <td className="p-2">{reservation.status}</td>

                <td className="p-2">
                  <Link
                    href={`/reservations/${reservation.id}`}
                    className="rounded bg-gray-900 px-3 py-1 text-white"
                  >
                    Otvori
                  </Link>
                </td>
              </tr>
            ))}

            {reservations.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Nema rezervacija.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}