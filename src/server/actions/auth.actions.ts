"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const lozinka = String(formData.get("lozinka") ?? "");

  const korisnik = await prisma.korisnik.findFirst({
    where: {
      email,
      lozinka,
    },
  });

  if (!korisnik) {
    redirect("/login?error=1");
  }

  const cookieStore = await cookies();

  cookieStore.set("srsa_user_id", String(korisnik.id), {
    path: "/",
    httpOnly: true,
  });

  cookieStore.set("srsa_user_role", korisnik.uloga, {
    path: "/",
    httpOnly: true,
  });

  if (korisnik.uloga === "ADMIN" || korisnik.uloga === "SERVISER") {
    redirect("/admin");
  }

  redirect("/my-reservations");
}

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.delete("srsa_user_id");
  cookieStore.delete("srsa_user_role");

  redirect("/login");
}

export async function registerAction(formData: FormData) {
  const ime = String(formData.get("ime") ?? "").trim();
  const prezime = String(formData.get("prezime") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const lozinka = String(formData.get("lozinka") ?? "");
  const ponovljenaLozinka = String(formData.get("ponovljenaLozinka") ?? "");

  if (ime.length < 2) {
    redirect("/register?error=ime");
  }

  if (prezime.length < 2) {
    redirect("/register?error=prezime");
  }

  if (!email.includes("@")) {
    redirect("/register?error=email");
  }

  if (lozinka.length < 4) {
    redirect("/register?error=lozinka");
  }

  if (lozinka !== ponovljenaLozinka) {
    redirect("/register?error=ponovljenaLozinka");
  }

  const existingUser = await prisma.korisnik.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    redirect("/register?error=emailExists");
  }

  const korisnik = await prisma.korisnik.create({
    data: {
      ime,
      prezime,
      email,
      telefon: telefon || null,
      lozinka,
      uloga: "KLIJENT",
      klijent: {
        create: {},
      },
    },
  });

  const cookieStore = await cookies();

  cookieStore.set("srsa_user_id", String(korisnik.id), {
    path: "/",
    httpOnly: true,
  });

  cookieStore.set("srsa_user_role", korisnik.uloga, {
    path: "/",
    httpOnly: true,
  });

  redirect("/my-reservations");
}