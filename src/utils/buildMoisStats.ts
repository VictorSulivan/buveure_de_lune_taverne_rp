import { GrainAnalyse, MoisStat, Periode } from "types/analyse";

export function getDateRange(
  periode: Periode,
  debut?: string,
  fin?: string
): { from?: Date; to?: Date } {
  const now = new Date();
  if (periode === "all") return {};
  if (periode === "custom" && debut && fin) {
    return { from: new Date(debut), to: new Date(fin + "T23:59:59") };
  }
  const days: Record<string, number> = {
    "1j": 1,
    "3j": 3,
    "7j": 7,
    "30j": 14,
    "90j": 42,
    annee: 84,
  };
  const d = days[periode];
  if (!d) return {};
  const from = new Date(now);
  if (periode === "1j") {
    from.setHours(0, 0, 0, 0);
    return { from, to: now };
  }
  from.setDate(from.getDate() - (d - 1));
  from.setHours(0, 0, 0, 0);
  return { from, to: now };
}

export function periodeLabel(
  periode: Periode,
  debut?: string,
  fin?: string
): string {
  if (periode === "all") return "Depuis toujours";
  if (periode === "1j") return "Aujourd'hui";
  if (periode === "3j") return "3 derniers jours";
  if (periode === "7j") return "7 derniers jours";
  if (periode === "30j") return "Dernière année RP (14 jours)";
  if (periode === "90j") return "3 dernières années RP (42 jours)";
  if (periode === "annee") return "6 dernières années RP (84 jours)";
  if (periode === "custom" && debut && fin) return `${debut} → ${fin}`;
  return "Période personnalisée";
}

export function grainPourPeriode(periode: Periode, from?: Date, to?: Date): GrainAnalyse {
  if (periode === "1j" || periode === "3j" || periode === "7j" || periode === "30j") return "jour";
  if ((periode === "custom" || periode === "all") && from && to) {
    const days = (to.getTime() - from.getTime()) / 86400000;
    return days <= 14 ? "jour" : "semaine";
  }
  return "semaine";
}

export function fmt(n: number): string {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function debutJour(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function debutSemaine(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoWeek(date: Date): number {
  const tmp = new Date(date);
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((tmp.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function jourLabel(date: Date): { key: string; label: string } {
  const d = debutJour(date);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const label = `${String(d.getDate()).padStart(2, "0")} ${MOIS_COURTS[d.getMonth()]}`;
  return { key, label };
}

function rpLabel(lundi: Date): { key: string; label: string } {
  const anneeReelle = lundi.getFullYear();
  const semIso = isoWeek(lundi);
  const anneeRp = Math.floor((semIso - 1) / 2) + 1;
  const semestreRp = semIso % 2 === 1 ? 1 : 2;
  const key = `${anneeReelle}-W${String(semIso).padStart(2, "0")}`;
  const label = `S${semestreRp} An${anneeRp}`;
  return { key, label };
}

export function buildMoisStats(
  transactions: Array<{
    typeTransaction: string | null;
    montant: number | null;
    createdAt: Date;
  }>,
  options?: { from?: Date; to?: Date; grain?: GrainAnalyse }
): MoisStat[] {
  const grain = options?.grain ?? "semaine";
  const map = new Map<string, MoisStat>();

  const bornes = {
    from: options?.from,
    to: options?.to ?? new Date(),
  };
  if (!bornes.from && transactions.length) {
    bornes.from = grain === "jour"
      ? debutJour(transactions[0].createdAt)
      : debutSemaine(transactions[0].createdAt);
  }

  if (bornes.from) {
    const cursor = grain === "jour" ? debutJour(bornes.from) : debutSemaine(bornes.from);
    const fin = bornes.to;
    while (cursor.getTime() <= fin.getTime()) {
      const { key, label } = grain === "jour" ? jourLabel(cursor) : rpLabel(cursor);
      if (!map.has(key)) {
        map.set(key, { mois: key, label, gains: 0, depenses: 0, taxes: 0 });
      }
      cursor.setDate(cursor.getDate() + (grain === "jour" ? 1 : 7));
    }
  }

  for (const t of transactions) {
    const date = new Date(t.createdAt);
    const { key, label } = grain === "jour" ? jourLabel(date) : rpLabel(debutSemaine(date));

    if (!map.has(key)) {
      map.set(key, { mois: key, label, gains: 0, depenses: 0, taxes: 0 });
    }

    const s = map.get(key)!;
    const m = t.montant ?? 0;
    const type = t.typeTransaction ?? "";

    if (["vente", "versement"].includes(type)) s.gains += m;
    else if (type === "taxe") s.taxes += m;
    else if (["retrait", "salaire", "achat", "prime"].includes(type)) s.depenses += m;
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}
