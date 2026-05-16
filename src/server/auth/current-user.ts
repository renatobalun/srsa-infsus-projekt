import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const userId = cookieStore.get("srsa_user_id")?.value;

  if (!userId) {
    return null;
  }

  const korisnik = await prisma.korisnik.findUnique({
    where: {
      id: Number(userId),
    },
  });

  return korisnik;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Korisnik nije prijavljen.");
  }

  return user;
}

export async function requireAdminOrEmployee() {
  const user = await requireUser();

  if (user.uloga !== "ADMIN" && user.uloga !== "SERVISER") {
    throw new Error("Nemate ovlasti za pristup administraciji.");
  }

  return user;
}

export async function requireClient() {
  const user = await requireUser();

  if (user.uloga !== "KLIJENT") {
    throw new Error("Samo klijent može pristupiti korisničkom dijelu.");
  }

  return user;
}