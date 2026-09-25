"use client";

import type { EmployeStat } from "types/analyse";
import { fmtArgent } from "@/utils/fmtArgent";

export function ClassementEmployes({
  employes,
  sansEmploye,
}: {
  employes: EmployeStat[];
  sansEmploye: { gains: number; depenses: number; taxes: number };
}) {
  const ranked = [...employes].sort((a, b) => b.caVentes - a.caVentes || b.gains - a.gains);
  const maxCa = Math.max(...ranked.map((e) => e.caVentes), 1);
  const hasSansEmploye =
    sansEmploye.gains > 0 || sansEmploye.depenses > 0 || sansEmploye.taxes > 0;

  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest">
            Employés qui rapportent le plus
          </p>
          <p className="text-xs text-white/20 mt-0.5">
            Classés par ventes réalisées, avec le coût des salaires et primes
          </p>
        </div>
        <span className="text-xs text-white/30 border border-white/10 rounded-lg px-2 py-1">
          {ranked.length} employé{ranked.length > 1 ? "s" : ""}
        </span>
      </div>

      {ranked.length === 0 && !hasSansEmploye ? (
        <p className="text-white/20 text-sm py-8 text-center">
          Aucune vente ni transaction attribuée à un employé sur cette période.
        </p>
      ) : (
        <div className="space-y-4">
          {ranked.map((e, i) => {
            const charges = e.depenses + e.taxes;
            const net = e.caVentes - charges;
            const pct = Math.round((e.caVentes / maxCa) * 100);
            return (
              <EmployeRow
                key={e.id}
                rang={i + 1}
                nom={e.nom}
                caVentes={e.caVentes}
                charges={charges}
                net={net}
                pct={pct}
                nbVentes={e.nbVentes}
              />
            );
          })}

          {hasSansEmploye && (
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-5" />
                  <span className="text-white/25 italic">Sans employé attribué</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-green-400/40">
                    {fmtArgent(sansEmploye.gains, { signe: true })}
                  </span>
                  <span className="text-red-400/40">
                    {fmtArgent(-(sansEmploye.depenses + sansEmploye.taxes), { signe: true })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmployeRow({
  rang,
  nom,
  caVentes,
  charges,
  net,
  pct,
  nbVentes,
}: {
  rang: number;
  nom: string;
  caVentes: number;
  charges: number;
  net: number;
  pct: number;
  nbVentes: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-white/20 font-mono w-5 shrink-0 text-right">
            {rang}
          </span>
          <span className="text-sm text-white/80 font-medium truncate">{nom}</span>
          <span className="text-xs text-white/25 shrink-0">
            {nbVentes} vente{nbVentes > 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs shrink-0 ml-4">
          <span className="text-green-400/70 tabular-nums hidden sm:block">
            CA {fmtArgent(caVentes)}
          </span>
          <span className="text-red-400/70 tabular-nums hidden sm:block">
            {fmtArgent(-charges, { signe: true })}
          </span>
          <span
            className={`font-semibold tabular-nums w-28 text-right ${
              net >= 0 ? "text-[#e4b56a]" : "text-red-400"
            }`}
          >
            {fmtArgent(net, { signe: true })}
          </span>
        </div>
      </div>

      <div className="h-1 bg-white/5 rounded-full overflow-hidden ml-8">
        <div
          className="h-full bg-gradient-to-r from-[#e4b56a]/50 to-[#c4893a]/30 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
