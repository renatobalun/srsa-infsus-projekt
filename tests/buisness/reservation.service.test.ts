import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/repositories/reservation.repository", () => ({
  addServiceToReservation: vi.fn(),
  createReservationWithServices: vi.fn(),
  deleteReservation: vi.fn(),
  findActiveServices: vi.fn(),
  findEmployees: vi.fn(),
  findFreeTerms: vi.fn(),
  findReservationById: vi.fn(),
  findReservations: vi.fn(),
  findServiceById: vi.fn(),
  findTermById: vi.fn(),
  findVehicleById: vi.fn(),
  findVehicles: vi.fn(),
  removeServiceFromReservation: vi.fn(),
  updateReservation: vi.fn(),
  updateReservationServiceQuantity: vi.fn(),
  createPublicReservation: vi.fn(),
  cancelReservation: vi.fn(),
  findReservationsByClientId: vi.fn(),
  hasActiveReservationForTerm: vi.fn(),
  createReservationForLoggedClient: vi.fn(),
  findVehiclesByClientId: vi.fn(),
}));

import {
  canCancelReservation,
  validateTotalServiceDuration,
} from "@/server/services/reservation.service";

describe("ReservationService - poslovni sloj", () => {
  it("dopušta otkazivanje više od 24 sata prije termina", () => {
    const now = new Date("2026-06-01T10:00:00");
    const termStart = new Date("2026-06-02T11:00:00");

    expect(canCancelReservation(termStart, now)).toBe(true);
  });

  it("ne dopušta otkazivanje manje od 24 sata prije termina", () => {
    const now = new Date("2026-06-01T10:00:00");
    const termStart = new Date("2026-06-02T09:00:00");

    expect(canCancelReservation(termStart, now)).toBe(false);
  });

  it("ne dopušta da ukupno trajanje usluga bude dulje od termina", () => {
    const start = new Date("2026-06-01T10:00:00");
    const end = new Date("2026-06-01T11:00:00");

    expect(() =>
      validateTotalServiceDuration(start, end, [
        { durationMin: 45, quantity: 2 },
      ]),
    ).toThrow(
      "Ukupno trajanje odabranih servisnih usluga ne smije biti dulje od trajanja termina.",
    );
  });

  it("dopušta rezervaciju ako usluge stanu u termin", () => {
    const start = new Date("2026-06-01T10:00:00");
    const end = new Date("2026-06-01T11:00:00");

    expect(() =>
      validateTotalServiceDuration(start, end, [
        { durationMin: 30, quantity: 1 },
      ]),
    ).not.toThrow();
  });
});