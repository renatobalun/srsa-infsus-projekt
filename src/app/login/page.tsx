import { loginAction } from "@/server/actions/auth.actions";
import Link from "next/link";

type Props = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const hasError = params?.error === "1";

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold">Prijava</h1>

        <p className="mb-6 text-gray-700">
          Prijavite se kao klijent, serviser ili administrator.
        </p>

        {hasError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Neispravan email ili lozinka.
          </div>
        )}

        <form action={loginAction} className="grid gap-4">
          <div>
            <label className="mb-1 block font-medium">Email</label>
            <input
              name="email"
              type="email"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Lozinka</label>
            <input
              name="lozinka"
              type="password"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
              placeholder="Lozinka"
            />
          </div>

          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800"
          >
            Prijavi se
          </button>
        </form>

        <div className="mt-5 flex justify-between text-sm">
          <Link href="/register" className="underline">
            Nemate račun? Registracija
          </Link>

          <Link href="/" className="underline">
            Natrag na početnu
          </Link>
        </div>
      </div>
    </main>
  );
}
