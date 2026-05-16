import { createPublicReservationAction } from "@/server/actions/reservation.actions";
import { createLoggedClientReservationAction } from "@/server/actions/reservation.actions";
import { getCurrentUser } from "@/server/auth/current-user";
import {
  getReservationFormData,
  getVehiclesForClient,
} from "@/server/services/reservation.service";
import Link from "next/link";

export default async function NewPublicReservationPage() {
  const { termini, usluge } = await getReservationFormData();
  const user = await getCurrentUser();

  const isLoggedClient = user?.uloga === "KLIJENT";

  const clientVehicles = isLoggedClient
    ? await getVehiclesForClient(user.id)
    : [];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold">
          Rezervacija servisa automobila
        </h1>

        <p className="mb-8 text-gray-700">
          Ispunite podatke i pošaljite zahtjev za rezervaciju servisa.
        </p>

        {isLoggedClient && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
            <p className="font-medium">
              Prijavljeni ste kao {user.ime} {user.prezime}.
            </p>
            <p className="text-sm">
              Rezervacija će se automatski povezati s vašim korisničkim računom.
            </p>
          </div>
        )}

        {!user && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-gray-700">
              Rezervaciju možete napraviti i bez prijave. Ako imate korisnički
              račun, prijavite se kako biste kasnije vidjeli svoje rezervacije.
            </p>
          </div>
        )}

        {user && !isLoggedClient && (
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-900">
            <p className="font-medium">Prijavljeni ste kao {user.uloga}.</p>
            <p className="text-sm">
              Administratori i serviseri mogu upravljati rezervacijama kroz
              administracijski dio, a javna rezervacija je namijenjena
              klijentima.
            </p>
          </div>
        )}

        <form
          action={
            isLoggedClient
              ? createLoggedClientReservationAction
              : createPublicReservationAction
          }
          className="grid gap-8"
        >
          {!isLoggedClient && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Podaci o korisniku</h2>

              <div className="grid gap-4">
                <input name="ime" placeholder="Ime" className={inputClass} />

                <input
                  name="prezime"
                  placeholder="Prezime"
                  className={inputClass}
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className={inputClass}
                />

                <input
                  name="telefon"
                  placeholder="Telefon"
                  className={inputClass}
                />
              </div>
            </section>
          )}

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Podaci o vozilu</h2>

            {isLoggedClient && clientVehicles.length > 0 && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <label className="mb-1 block font-medium">
                  Odaberi postojeće vozilo
                </label>

                <select name="voziloId" className={inputClass} defaultValue="">
                  <option value="">Unesi novo vozilo</option>

                  {clientVehicles.map((vozilo) => (
                    <option key={vozilo.id} value={vozilo.id}>
                      {vozilo.registracijskaOznaka} — {vozilo.marka}{" "}
                      {vozilo.model}, {vozilo.godinaProizvodnje}.
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-sm text-gray-600">
                  Ako odaberete postojeće vozilo, polja za novo vozilo možete
                  ostaviti prazna.
                </p>
              </div>
            )}

            <div className="grid gap-4">
              <p className="text-sm font-medium text-gray-700">Novo vozilo</p>

              <input
                name="registracijskaOznaka"
                placeholder="Registracijska oznaka, npr. ZG-1234-AB"
                className={inputClass}
              />

              <input
                name="brojSasije"
                placeholder="Broj šasije"
                className={inputClass}
              />

              <input name="marka" placeholder="Marka" className={inputClass} />

              <input name="model" placeholder="Model" className={inputClass} />

              <input
                name="godinaProizvodnje"
                type="number"
                placeholder="Godina proizvodnje"
                className={inputClass}
              />
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Podaci o servisu</h2>

            <div className="grid gap-4">
              <select name="terminId" className={inputClass}>
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

              <select name="uslugaId" className={inputClass}>
                <option value="">Odaberi servisnu uslugu</option>
                {usluge.map((usluga) => (
                  <option key={usluga.id} value={usluga.id}>
                    {usluga.naziv} — {usluga.trajanjeMin} min —{" "}
                    {String(usluga.cijena)} €
                  </option>
                ))}
              </select>

              <input
                name="kolicina"
                type="number"
                min="1"
                defaultValue="1"
                className={inputClass}
              />

              <textarea
                name="opisProblema"
                placeholder="Ukratko opišite problem ili željenu uslugu"
                className={`${inputClass} min-h-28`}
              />
            </div>
          </section>

          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800"
          >
            Pošalji zahtjev za rezervaciju
          </button>

          <Link href={"/"} className="rounded-md bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800 text-center">Natrag na početnu</Link>
        </form>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200";
