import Link from "next/link";
import { getCurrentUser } from "@/server/auth/current-user";
import { logoutAction } from "@/server/actions/auth.actions";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-3 text-4xl font-bold">
            Sustav za rezervaciju servisa automobila
          </h1>

          <p className="mb-6 text-gray-700">
            Korisnici mogu poslati zahtjev za servis vozila, a zaposlenici mogu
            pregledavati, potvrđivati i uređivati rezervacije.
          </p>

          {user ? (
            <div className="mb-6 rounded-md bg-gray-100 p-4">
              <p className="font-medium">
                Prijavljeni ste kao {user.ime} {user.prezime} ({user.uloga})
              </p>

              <form action={logoutAction} className="mt-3">
                <button className="rounded-md border border-gray-300 bg-white px-4 py-2">
                  Odjava
                </button>
              </form>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800"
              >
                Prijava
              </Link>

              <Link
                href="/register"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 hover:bg-gray-100"
              >
                Registracija
              </Link>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              href="/reservation/new"
              className="rounded-md bg-gray-900 px-4 py-2 text-white"
            >
              Rezerviraj servis
            </Link>

            {user?.uloga === "KLIJENT" && (
              <Link
                href="/my-reservations"
                className="rounded-md border border-gray-300 bg-white px-4 py-2"
              >
                Moje rezervacije
              </Link>
            )}

            {(user?.uloga === "ADMIN" || user?.uloga === "SERVISER") && (
              <Link
                href="/admin"
                className="rounded-md border border-gray-300 bg-white px-4 py-2"
              >
                Administracija
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
