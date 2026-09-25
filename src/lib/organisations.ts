import { prisma } from "@/lib/db/prisma";
import type { TypeOrganisation } from "@prisma/client";

export async function findOrCreateOrganisation(nom: string, type: TypeOrganisation) {
  const nomPropre = nom.trim();
  if (!nomPropre) return null;

  const existing = await prisma.organisation.findFirst({
    where: { nom: nomPropre, type },
  });
  if (existing) return existing;

  return prisma.organisation.create({
    data: { nom: nomPropre, type },
  });
}

export async function setAffiliation(
  clientId: number,
  type: TypeOrganisation,
  nom: string | null | undefined,
  dateDebut = new Date()
) {
  const actives = await prisma.affiliation.findMany({
    where: {
      clientId,
      dateFin: null,
      organisation: { type },
    },
    include: { organisation: true },
  });

  const nomPropre = nom?.trim() ?? "";
  const dejaLaMeme = actives.find((a) => a.organisation.nom === nomPropre);
  if (nomPropre && dejaLaMeme && actives.length === 1) return dejaLaMeme;

  if (actives.length) {
    await prisma.affiliation.updateMany({
      where: { id: { in: actives.map((a) => a.id) } },
      data: { dateFin: dateDebut },
    });
  }

  if (!nomPropre) return null;

  const org = await findOrCreateOrganisation(nomPropre, type);
  if (!org) return null;

  return prisma.affiliation.create({
    data: {
      clientId,
      organisationId: org.id,
      dateDebut,
    },
  });
}

export async function affiliationsActives(clientId: number) {
  return prisma.affiliation.findMany({
    where: { clientId, dateFin: null },
    include: { organisation: true },
  });
}
