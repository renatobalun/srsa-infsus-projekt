import {
  createServiceTypeAction,
  deleteServiceTypeAction,
} from "@/server/actions/service-type.actions";
import { getServiceTypes } from "@/server/services/service-type.service";

type Props = {
  searchParams?: Promise<{
    search?: string;
  }>;
};

export default async function ServiceTypesPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params?.search ?? "";

  const serviceTypes = await getServiceTypes(search);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Šifrarnik servisnih usluga</h1>

      <section className="mb-8 rounded-lg border p-4">
        <h2 className="mb-4 text-xl font-semibold">Pretraživanje</h2>

        <form className="flex gap-3">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Pretraži po nazivu..."
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

      <section className="mb-8 rounded-lg border p-4">
        <h2 className="mb-4 text-xl font-semibold">Nova servisna usluga</h2>

        <form action={createServiceTypeAction} className="grid gap-4">
          <div>
            <label className="mb-1 block font-medium">Naziv</label>
            <input
              type="text"
              name="naziv"
              className="w-full rounded border px-3 py-2"
              placeholder="npr. Zamjena ulja"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Trajanje u minutama</label>
            <input
              type="number"
              name="trajanjeMin"
              className="w-full rounded border px-3 py-2"
              placeholder="npr. 30"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Cijena</label>
            <input
              type="number"
              name="cijena"
              step="0.01"
              className="w-full rounded border px-3 py-2"
              placeholder="npr. 45"
            />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" name="aktivna" defaultChecked />
            Aktivna
          </label>

          <button
            type="submit"
            className="w-fit rounded bg-black px-4 py-2 text-white"
          >
            Spremi
          </button>
        </form>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="mb-4 text-xl font-semibold">Popis servisnih usluga</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Naziv</th>
              <th className="p-2">Trajanje</th>
              <th className="p-2">Cijena</th>
              <th className="p-2">Aktivna</th>
              <th className="p-2">Akcije</th>
            </tr>
          </thead>

          <tbody>
            {serviceTypes.map((serviceType) => (
              <tr key={serviceType.id} className="border-b">
                <td className="p-2">{serviceType.naziv}</td>
                <td className="p-2">{serviceType.trajanjeMin} min</td>
                <td className="p-2">{String(serviceType.cijena)} €</td>
                <td className="p-2">{serviceType.aktivna ? "Da" : "Ne"}</td>
                <td className="p-2">
                  <form action={deleteServiceTypeAction.bind(null, serviceType.id)}>
                    <button
                      type="submit"
                      className="rounded bg-red-600 px-3 py-1 text-white"
                    >
                      Obriši
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {serviceTypes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Nema servisnih usluga.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}