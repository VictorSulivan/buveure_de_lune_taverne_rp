import { DEVISE, DEVISE_SINGULIER } from "@/lib/branding";

export function fmtArgent(montant: number, options?: { signe?: boolean; unite?: boolean }): string {
  const { signe = false, unite = true } = options ?? {};
  const abs = Math.abs(montant);
  const formatted = abs.toLocaleString("fr-FR", {
    maximumFractionDigits: Number.isInteger(abs) ? 0 : 2,
  });
  const prefix = signe ? (montant > 0 ? "+" : montant < 0 ? "-" : "") : montant < 0 ? "-" : "";
  const nom = unite ? (abs === 1 ? DEVISE_SINGULIER : DEVISE) : "";
  return nom ? `${prefix}${formatted} ${nom}` : `${prefix}${formatted}`;
}
