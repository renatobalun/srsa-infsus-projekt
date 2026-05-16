import Link from "next/link";
import { registerAction } from "@/server/actions/auth.actions";

type Props = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold">Registracija</h1>

        <p className="mb-6 text-gray-700">
          Izradite korisnički račun za pregled i upravljanje vlastitim rezervacijama.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage(error)}
          </div>
        )}

        <form action={registerAction} className="grid gap-4">
          <div>
            <label className="mb-1 block font-medium">Ime</label>
            <input
              name="ime"
              className={inputClass}
              placeholder="Ime"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Prezime</label>
            <input
              name="prezime"
              className={inputClass}
              placeholder="Prezime"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Email</label>
            <input
              name="email"
              type="email"
              className={inputClass}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Telefon</label>
            <input
              name="telefon"
              className={inputClass}
              placeholder="091 123 4567"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Lozinka</label>
            <input
              name="lozinka"
              type="password"
              className={inputClass}
              placeholder="Lozinka"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Ponovi lozinku</label>
            <input
              name="ponovljenaLozinka"
              type="password"
              className={inputClass}
              placeholder="Ponovi lozinku"
            />
          </div>

          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800"
          >
            Registriraj se
          </button>
        </form>

        <div className="mt-5 flex justify-between text-sm">
          <Link href="/login" className="underline">
            Već imate račun? Prijava
          </Link>

          <Link href="/" className="underline">
            Početna
          </Link>
        </div>
      </div>
    </main>
  );
}

function errorMessage(error: string) {
  const messages: Record<string, string> = {
    ime: "Ime mora imati barem 2 znaka.",
    prezime: "Prezime mora imati barem 2 znaka.",
    email: "Email nije u ispravnom formatu.",
    lozinka: "Lozinka mora imati barem 4 znaka.",
    ponovljenaLozinka: "Lozinke se ne podudaraju.",
    emailExists: "Korisnik s tim emailom već postoji.",
  };

  return messages[error] ?? "Došlo je do greške prilikom registracije.";
}

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200";