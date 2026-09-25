export const CONTEXTES = [
  { value: "civil", label: "Civil", icone: "👤" },
  { value: "entreprise", label: "Entreprise", icone: "🏢" },
  { value: "nation", label: "Nation", icone: "🏛️" },
] as const;

export const TYPES_ORG = [
  { value: "entreprise", label: "Entreprise" },
  { value: "nation", label: "Nation" },
] as const;

export type ContexteValue = (typeof CONTEXTES)[number]["value"];
export type TypeOrgValue = (typeof TYPES_ORG)[number]["value"];

export function labelContexte(contexte: string | null | undefined): string {
  return CONTEXTES.find((c) => c.value === contexte)?.label ?? "Civil";
}

export function badgeContexte(contexte: string | null | undefined): string {
  if (contexte === "entreprise") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (contexte === "nation") return "bg-amber-500/10 text-amber-300 border-amber-500/20";
  return "bg-white/5 text-white/40 border-white/10";
}

export function labelTypeOrg(type: string | null | undefined): string {
  return type === "nation" ? "Nation" : "Entreprise";
}

export function affiliationActive<T extends { dateFin: Date | string | null; organisation: { type: string } }>(
  affiliations: T[],
  type: TypeOrgValue
): T | undefined {
  return affiliations.find((a) => !a.dateFin && a.organisation.type === type);
}

export function nomClient(c: { prenom?: string | null; nom: string }): string {
  return [c.prenom, c.nom].filter(Boolean).join(" ");
}
