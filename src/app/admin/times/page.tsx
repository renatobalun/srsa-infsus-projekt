import { TerminStatus } from "@/../generated/prisma/client";
import {
  createTermAction,
  deleteTermAction,
  updateTermAction,
} from "@/server/actions/termin.actions";
import { getTermFormData, getTerms } from "@/server/services/termin.service";

export default async function AdminTermsPage() {
  const terms = await getTerms();
  const { poslovnice } = await getTermFormData();

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-2 text-3xl font-bold">Upravljanje terminima</h1>

      <p className="mb-8 text-gray-600">
        Ovdje zaposlenik ili administrator dodaje dostupne termine koje korisnici
        mogu odabrati prilikom rezervacije servisa.
      </p>

      <section className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Novi termin</h2>

        <form action={createTermAction} className="grid gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="mb-1 block font-medium">Poslovnica</label>
            <select
              name="poslovnicaId"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="">Odaberi poslovnicu</option>
              {poslovnice.map((poslovnica) => (
                <option key={poslovnica.id} value={poslovnica.id}>
                  {poslovnica.naziv} — {poslovnica.grad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">Početak</label>
            <input
              type="datetime-local"
              name="pocetak"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Kraj</label>
            <input
              type="datetime-local"
              name="kraj"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Status</label>
            <select name="status" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200">
              <option value={TerminStatus.SLOBODAN}>Slobodan</option>
              <option value={TerminStatus.NEDOSTUPAN}>Nedostupan</option>
            </select>
          </div>

          <div className="md:col-span-5">
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-white"
            >
              Dodaj termin
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Popis termina</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Poslovnica</th>
              <th className="p-2">Početak</th>
              <th className="p-2">Kraj</th>
              <th className="p-2">Status</th>
              <th className="p-2">Rezervacija</th>
              <th className="p-2">Akcije</th>
            </tr>
          </thead>

          <tbody>
            {terms.map((term) => {
              const reserved = term.status === TerminStatus.REZERVIRAN;

              return (
                <tr key={term.id} className="border-b align-top">
                  <td className="p-2">
                    <p className="font-medium">{term.poslovnica.naziv}</p>
                    <p className="text-sm text-gray-600">
                      {term.poslovnica.adresa}, {term.poslovnica.grad}
                    </p>
                  </td>

                  <td className="p-2">
                    {formatDateTimeLocalDisplay(term.pocetak)}
                  </td>

                  <td className="p-2">
                    {formatDateTimeLocalDisplay(term.kraj)}
                  </td>

                  <td className="p-2">{statusLabel(term.status)}</td>

                  <td className="p-2">
                    {term.rezervacije.length > 0 ? (
                      <span>
                        Rezervacija #{term.rezervacije[0].id} —{" "}
                        {term.rezervacije[0].vozilo.registracijskaOznaka}
                      </span>
                    ) : (
                      <span className="text-gray-500">Nema rezervacije</span>
                    )}
                  </td>

                  <td className="p-2">
                    {!reserved ? (
                      <div className="grid gap-3">
                        <form
                          action={updateTermAction.bind(null, term.id)}
                          className="grid gap-2"
                        >
                          <input
                            type="hidden"
                            name="poslovnicaId"
                            value={term.poslovnicaId}
                          />

                          <input
                            type="datetime-local"
                            name="pocetak"
                            defaultValue={toDateTimeLocalValue(term.pocetak)}
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />

                          <input
                            type="datetime-local"
                            name="kraj"
                            defaultValue={toDateTimeLocalValue(term.kraj)}
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />

                          <select
                            name="status"
                            defaultValue={term.status}
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                          >
                            <option value={TerminStatus.SLOBODAN}>
                              Slobodan
                            </option>
                            <option value={TerminStatus.NEDOSTUPAN}>
                              Nedostupan
                            </option>
                          </select>

                          <button
                            type="submit"
                            className="rounded bg-gray-900 px-3 py-1 text-white"
                          >
                            Spremi
                          </button>
                        </form>

                        <form action={deleteTermAction.bind(null, term.id)}>
                          <button
                            type="submit"
                            className="rounded bg-red-600 px-3 py-1 text-white"
                          >
                            Obriši
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Rezervirani termin se ne uređuje ovdje.
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {terms.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Nema unesenih termina.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function statusLabel(status: TerminStatus) {
  const labels: Record<TerminStatus, string> = {
    SLOBODAN: "Slobodan",
    REZERVIRAN: "Rezerviran",
    NEDOSTUPAN: "Nedostupan",
  };

  return labels[status];
}

function toDateTimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(date.getTime() - offsetMs);

  return localDate.toISOString().slice(0, 16);
}

function formatDateTimeLocalDisplay(date: Date) {
  return date.toLocaleString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
