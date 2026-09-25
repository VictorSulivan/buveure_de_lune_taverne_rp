"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Periode } from "types/analyse";


const PERIODES: { id: Periode; labelRp: string; labelReel: string }[] = [
  { id: "1j",    labelRp: "Aujourd'hui", labelReel: "1 jour"   },
  { id: "3j",    labelRp: "3 jours",     labelReel: "3 jours"  },
  { id: "7j",    labelRp: "7 jours",     labelReel: "7 jours"  },
  { id: "30j",   labelRp: "1 an RP",     labelReel: "14 jours" },
  { id: "90j",   labelRp: "3 ans RP",    labelReel: "42 jours" },
  { id: "annee", labelRp: "6 ans RP",    labelReel: "84 jours" },
  { id: "all",   labelRp: "Tout",        labelReel: ""         },
  { id: "custom",labelRp: "Plage libre", labelReel: ""         },
];

export function FiltrePeriode() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const currentPeriode = (searchParams.get("periode") ?? "7j") as Periode;
  const currentDebut   = searchParams.get("debut") ?? "";
  const currentFin     = searchParams.get("fin")   ?? "";

  const [debut, setDebut] = useState(currentDebut);
  const [fin,   setFin]   = useState(currentFin);

  function navigate(periode: Periode, d?: string, f?: string) {
    const p = new URLSearchParams();
    p.set("periode", periode);
    if (periode === "custom" && d && f) {
      p.set("debut", d);
      p.set("fin",   f);
    }
    router.push(`?${p.toString()}`);
  }

  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-xs text-white/30 uppercase tracking-widest">Période</p>
        <span className="text-[10px] text-white/20 border border-white/10 rounded px-1.5 py-0.5">
          Suivi dès le premier jour
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PERIODES.map(({ id, labelRp, labelReel }) => (
          <button
            key={id}
            onClick={() => navigate(id, debut, fin)}
            className={`flex flex-col items-start px-3 py-2 rounded-lg border transition-colors text-left ${
              currentPeriode === id
                ? "bg-[#e4b56a]/15 border-[#e4b56a]/40 text-[#e4b56a]"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
            }`}
          >
            <span className="text-xs font-medium">{labelRp}</span>
            {labelReel && (
              <span className={`text-[10px] ${currentPeriode === id ? "text-[#e4b56a]/50" : "text-white/20"}`}>
                {labelReel} réels
              </span>
            )}
          </button>
        ))}
      </div>

      {currentPeriode === "custom" && (
        <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-white/5">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Du</label>
            <input
              type="date"
              value={debut}
              onChange={(e) => setDebut(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e4b56a]"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Au</label>
            <input
              type="date"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e4b56a]"
            />
          </div>
          <button
            onClick={() => navigate("custom", debut, fin)}
            disabled={!debut || !fin}
            className="bg-[#6b3e22] hover:bg-[#a06b3c] disabled:opacity-40 border border-[#a06b3c] text-[#e4b56a] text-sm rounded-lg px-4 py-2 font-medium transition-colors"
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  );
}
