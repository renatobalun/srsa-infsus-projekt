import {
  createServiceType,
  deactivateServiceType,
  deleteServiceType,
  findServiceTypeById,
  findServiceTypes,
  isServiceTypeUsed,
  updateServiceType,
} from "@/server/repositories/service-type.repository";

export type ServiceTypeInput = {
  naziv: string;
  trajanjeMin: number;
  cijena: number;
  aktivna?: boolean;
};

export async function getServiceTypes(search?: string) {
  return findServiceTypes(search);
}

export async function getServiceTypeById(id: number) {
  const serviceType = await findServiceTypeById(id);

  if (!serviceType) {
    throw new Error("Servisna usluga ne postoji.");
  }

  return serviceType;
}

export async function createServiceTypeUseCase(input: ServiceTypeInput) {
  validateServiceType(input);

  return createServiceType({
    naziv: input.naziv.trim(),
    trajanjeMin: input.trajanjeMin,
    cijena: input.cijena,
    aktivna: input.aktivna ?? true,
  });
}

export async function updateServiceTypeUseCase(
  id: number,
  input: ServiceTypeInput
) {
  validateServiceType(input);

  await getServiceTypeById(id);

  return updateServiceType(id, {
    naziv: input.naziv.trim(),
    trajanjeMin: input.trajanjeMin,
    cijena: input.cijena,
    aktivna: input.aktivna ?? true,
  });
}

export async function deleteServiceTypeUseCase(id: number) {
  await getServiceTypeById(id);

  const used = await isServiceTypeUsed(id);

  if (used) {
    return deactivateServiceType(id);
  }

  return deleteServiceType(id);
}

function validateServiceType(input: ServiceTypeInput) {
  if (!input.naziv || input.naziv.trim().length < 3) {
    throw new Error("Naziv servisne usluge mora imati barem 3 znaka.");
  }

  if (input.trajanjeMin < 15 || input.trajanjeMin > 480) {
    throw new Error("Trajanje servisne usluge mora biti između 15 i 480 minuta.");
  }

  if (input.cijena <= 0) {
    throw new Error("Cijena servisne usluge mora biti veća od 0.");
  }

  if (input.cijena > 5000) {
    throw new Error("Cijena servisne usluge ne može biti veća od 5000.");
  }
}