import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/actions/reservation.actions", () => ({
  createPublicReservationAction: vi.fn(),
  createLoggedClientReservationAction: vi.fn(),
}));

vi.mock("@/server/auth/current-user", () => ({
  getCurrentUser: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/server/services/reservation.service", () => ({
  getReservationFormData: vi.fn().mockResolvedValue({
    termini: [
      {
        id: 1,
        pocetak: new Date("2026-06-15T09:00:00"),
        kraj: new Date("2026-06-15T10:00:00"),
        poslovnica: {
          naziv: "Auto Servis Zagreb",
        },
      },
    ],
    usluge: [
      {
        id: 1,
        naziv: "Zamjena ulja",
        trajanjeMin: 30,
        cijena: 45,
      },
    ],
  }),
  getVehiclesForClient: vi.fn().mockResolvedValue([]),
}));

import NewPublicReservationPage from "@/app/reservation/new/page";

describe("NewPublicReservationPage - prezentacijski sloj", () => {
  it("prikazuje formu za javnu rezervaciju servisa", async () => {
    render(await NewPublicReservationPage());

    expect(
      screen.getByText("Rezervacija servisa automobila"),
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Ime")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Prezime")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Telefon")).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Registracijska oznaka, npr. ZG-1234-AB"),
    ).toBeInTheDocument();

    expect(screen.getByText("Odaberi termin")).toBeInTheDocument();
    expect(screen.getByText("Odaberi servisnu uslugu")).toBeInTheDocument();
    expect(screen.getByText(/Zamjena ulja/)).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Pošalji zahtjev za rezervaciju",
      }),
    ).toBeInTheDocument();
  });
});