import type { ContexteCommande, Prisma } from "@prisma/client";

export type LigneVenteInput = {
  produitId: number;
  quantite: number;
  prixEtudiant?: boolean;
  prixEmploye?: boolean;
};

export type ExtraVente = { label: string; montant: number };

export function prixEffectif(prixVente: number, prixAchat: number, ligne: LigneVenteInput) {
  const prixUnitaire = ligne.prixEmploye ? prixAchat : prixVente;
  return {
    prixUnitaire,
    totalLigne: ligne.quantite * prixUnitaire,
  };
}

export function flagsDepuisPrix(prixUnitaire: number, _prixVente: number, prixAchat: number) {
  if (Math.abs(prixUnitaire - prixAchat) < 0.02) return { prixEmploye: true, prixEtudiant: false };
  return { prixEtudiant: false, prixEmploye: false };
}

export function extrasDepuisVente(description: string | null | undefined, reste: number): ExtraVente[] {
  const montant = Math.round(reste * 100) / 100;
  if (montant <= 0.009) return [];
  const extras: ExtraVente[] = [];
  const idx = description?.indexOf("extras:") ?? -1;
  if (idx >= 0 && description) {
    const part = description.slice(idx + 7);
    const re = /([^,(]+?)\s*\(([\d.]+)\)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(part))) {
      extras.push({ label: m[1].trim(), montant: Number(m[2]) });
    }
  }
  if (extras.length) return extras;
  return [{ label: "Extra", montant }];
}

export async function organisationPourContexte(
  tx: Prisma.TransactionClient,
  clientId: number,
  contexte: ContexteCommande,
  organisationId?: number | null
) {
  if (contexte === "civil") return null;
  if (organisationId) {
    const org = await tx.organisation.findUnique({ where: { id: organisationId } });
    if (org && org.type === contexte) return org.id;
  }
  const affiliation = await tx.affiliation.findFirst({
    where: {
      clientId,
      dateFin: null,
      organisation: { type: contexte },
    },
  });
  if (!affiliation) {
    throw new Error(contexte === "nation"
      ? "Ce client n'a pas de nation actuelle."
      : "Ce client n'a pas d'entreprise actuelle.");
  }
  return affiliation.organisationId;
}

export function toDatetimeLocal(date: Date) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
