import Link from "next/link";
import { createReservationAction } from "@/server/actions/reservation.actions";
import { getReservationFormData } from "@/server/services/reservation.service";

export default async function NewReservationPage() {
  const { vozila, termini, zaposlenici, usluge } = await getReservationFormData();

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nova rezervacija</h1>

        <Link href="/reservations" className="underline">
          Natrag na rezervacije
        </Link>
      </div>

      <form action={createReservationAction} className="grid gap-6 rounded-lg border p-6">
        <section>
          <h2 className="mb-4 text-xl font-semibold">Zaglavlje rezervacije</h2>

          <div className="grid gap-4">
            <div>
              <label className="mb-1 block font-medium">Vozilo</label>
              <select name="voziloId" className="w-full rounded border px-3 py-2">
                <option value="">Odaberi vozilo</option>
                {vozila.map((vozilo) => (
                  <option key={vozilo.id} value={vozilo.id}>
                    {vozilo.registracijskaOznaka} — {vozilo.marka}{" "}
                    {vozilo.model} ({vozilo.klijent.korisnik.ime}{" "}
                    {vozilo.klijent.korisnik.prezime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-medium">Termin</label>
              <select name="terminId" className="w-full rounded border px-3 py-2">
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
            </div>

            <div>
              <label className="mb-1 block font-medium">Serviser</label>
              <select
                name="zaposlenikId"
                className="w-full rounded border px-3 py-2"
              >
                <option value="">Bez dodijeljenog servisera</option>
                {zaposlenici.map((zaposlenik) => (
                  <option key={zaposlenik.korisnikId} value={zaposlenik.korisnikId}>
                    {zaposlenik.korisnik.ime} {zaposlenik.korisnik.prezime}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-medium">Opis problema</label>
              <textarea
                name="opisProblema"
                className="w-full rounded border px-3 py-2"
                placeholder="npr. Čuje se zvuk pri kočenju..."
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Detalj rezervacije</h2>

          <div className="grid gap-4">
            <div>
              <label className="mb-1 block font-medium">Servisna usluga</label>
              <select name="uslugaId" className="w-full rounded border px-3 py-2">
                <option value="">Odaberi servisnu uslugu</option>
                {usluge.map((usluga) => (
                  <option key={usluga.id} value={usluga.id}>
                    {usluga.naziv} — {usluga.trajanjeMin} min —{" "}
                    {String(usluga.cijena)} €
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-medium">Količina</label>
              <input
                name="kolicina"
                type="number"
                min="1"
                defaultValue="1"
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>
        </section>

        <button type="submit" className="w-fit rounded bg-black px-4 py-2 text-white">
          Spremi rezervaciju
        </button>
      </form>
    </main>
  );
}