/** Lundi 00:00 de la semaine contenant `date` (fuseau local). */
export function debutSemaine(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function finSemaine(lundi: Date): Date {
  const d = new Date(lundi);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function labelSemaine(lundi: Date): string {
  const fin = finSemaine(lundi);
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  return `${lundi.toLocaleDateString("fr-FR", opts)} → ${fin.toLocaleDateString("fr-FR", opts)}`;
}
