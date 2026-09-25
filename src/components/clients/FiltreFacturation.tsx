"use client";

import { useRouter } from "next/navigation";
import { debutSemaine, finSemaine, labelSemaine } from "@/utils/semaine";

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function FiltreFacturation({
  semaineIso,
  type,
}: {
  semaineIso: string;
  type: string;
}) {
  const router = useRouter();
  const lundi = debutSemaine(new Date(`${semaineIso}T00:00:00`));

  function go(offset: number, nextType = type) {
    const d = new Date(lundi);
    d.setDate(d.getDate() + offset * 7);
    router.push(`?semaine=${toIsoDate(debutSemaine(d))}&type=${nextType}`);
  }

  const types = [
    { value: "all", label: "Entreprises + nations" },
    { value: "entreprise", label: "Entreprises" },
    { value: "nation", label: "Nations" },
  ];

  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-4 space-y-3 print:hidden">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          className="px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm"
        >
          ← Semaine préc.
        </button>
        <div className="text-center">
          <p className="text-white font-medium text-sm">{labelSemaine(lundi)}</p>
          <p className="text-white/30 text-xs">
            {lundi.toLocaleDateString("fr-FR")} → {finSemaine(lundi).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          className="px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm"
        >
          Semaine suiv. →
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => go(0, t.value)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              type === t.value
                ? "bg-[#e4b56a]/15 border-[#e4b56a]/40 text-[#e4b56a]"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
