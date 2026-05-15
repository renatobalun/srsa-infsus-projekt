import Link from "next/link";

export default function ReservationSuccessPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-3xl font-bold">Zahtjev je poslan</h1>

      <p className="mb-6 text-gray-600">
        Vaša rezervacija je zaprimljena. Zaposlenik servisa će pregledati zahtjev i
        potvrditi rezervaciju.
      </p>

      <Link href="/reservation/new" className="underline">
        Napravi novu rezervaciju
      </Link>
    </main>
  );
}