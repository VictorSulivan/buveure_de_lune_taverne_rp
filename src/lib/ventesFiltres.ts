import type { Prisma } from "@prisma/client";

export function filtreNomClient(recherche: string): Prisma.ClientWhereInput | undefined {
  const tokens = recherche
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return undefined;

  return {
    AND: tokens.map((token) => ({
      OR: [
        { nom: { contains: token, mode: "insensitive" } },
        { prenom: { contains: token, mode: "insensitive" } },
      ],
    })),
  };
}

export function labelStatutCommande(contexte: string | null | undefined) {
  if (contexte === "entreprise") return "Pour l'entreprise";
  if (contexte === "nation") return "Pour la nation";
  return "En civil";
}
