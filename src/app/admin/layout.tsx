import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/server/actions/auth.actions";
import { getCurrentUser } from "@/server/auth/current-user";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.uloga !== "ADMIN" && user.uloga !== "SERVISER") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <nav className="flex gap-4">
            <Link href="/admin" className="font-medium">
              Admin
            </Link>
            <Link href="/admin/reservations">Rezervacije</Link>
            <Link href="/admin/times">Termini</Link>
            <Link href="/admin/service-types">Usluge</Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {user.ime} {user.prezime} ({user.uloga})
            </span>

            <form action={logoutAction}>
              <button className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100">
                Odjava
              </button>
            </form>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}