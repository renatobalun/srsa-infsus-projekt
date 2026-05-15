import { createPublicReservationAction } from "@/server/actions/reservation.actions";
import { getReservationFormData } from "@/server/services/reservation.service";

export default async function NewPublicReservationPage() {
  const { termini, usluge } = await getReservationFormData();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-2 text-3xl font-bold">Rezervacija servisa automobila</h1>

      <p className="mb-8 text-gray-600">
        Ispunite podatke i pošaljite zahtjev za rezervaciju servisa.
      </p>

      <form action={createPublicReservationAction} className="grid gap-8">
        <section className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Podaci o korisniku</h2>

          <div className="grid gap-4">
            <input name="ime" placeholder="Ime" className="rounded border px-3 py-2" />
            <input name="prezime" placeholder="Prezime" className="rounded border px-3 py-2" />
            <input name="email" type="email" placeholder="Email" className="rounded border px-3 py-2" />
            <input name="telefon" placeholder="Telefon" className="rounded border px-3 py-2" />
          </div>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Podaci o vozilu</h2>

          <div className="grid gap-4">
            <input
              name="registracijskaOznaka"
              placeholder="Registracijska oznaka, npr. ZG-1234-AB"
              className="rounded border px-3 py-2"
            />

            <input
              name="brojSasije"
              placeholder="Broj šasije"
              className="rounded border px-3 py-2"
            />

            <input name="marka" placeholder="Marka" className="rounded border px-3 py-2" />
            <input name="model" placeholder="Model" className="rounded border px-3 py-2" />

            <input
              name="godinaProizvodnje"
              type="number"
              placeholder="Godina proizvodnje"
              className="rounded border px-3 py-2"
            />
          </div>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Podaci o servisu</h2>

          <div className="grid gap-4">
            <select name="terminId" className="rounded border px-3 py-2">
              <option value="">Odaberi termin</option>
              {termini.map((termin) => (
                <option key={termin.id} value={termin.id}>
                  {termin.pocetak.toLocaleString("hr-HR")} -{" "}
                  {termin.kraj.toLocaleTimeString("hr-HR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  | {termin.poslovnica.naziv}
                </option>
              ))}
            </select>

            <select name="uslugaId" className="rounded border px-3 py-2">
              <option value="">Odaberi servisnu uslugu</option>
              {usluge.map((usluga) => (
                <option key={usluga.id} value={usluga.id}>
                  {usluga.naziv} — {usluga.trajanjeMin} min — {String(usluga.cijena)} €
                </option>
              ))}
            </select>

            <input
              name="kolicina"
              type="number"
              min="1"
              defaultValue="1"
              className="rounded border px-3 py-2"
            />

            <textarea
              name="opisProblema"
              placeholder="Ukratko opišite problem ili željenu uslugu"
              className="rounded border px-3 py-2"
            />
          </div>
        </section>

        <button type="submit" className="rounded bg-black px-4 py-3 text-white">
          Pošalji zahtjev za rezervaciju
        </button>
      </form>
    </main>
  );
}