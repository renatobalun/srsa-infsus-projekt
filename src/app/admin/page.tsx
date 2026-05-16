import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Administracija sustava</h1>

      <div className="grid gap-4">
        <Link href="/admin/reservations" className="rounded border p-4">
          Pregled rezervacija
        </Link>

        <Link href="/admin/times" className="rounded border p-4">
          Upravljanje terminima
        </Link>

        <Link href="/admin/service-types" className="rounded border p-4">
          Šifrarnik servisnih usluga
        </Link>
      </div>
    </main>
  );
}