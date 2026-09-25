"use client";

import type { ProduitStat } from "types/analyse";
import { fmtArgent } from "@/utils/fmtArgent";

export function ClassementProduits({ produits }: { produits: ProduitStat[] }) {
  const totalCa = produits.reduce((acc, p) => acc + p.ca, 0);
  const maxCa = Math.max(...produits.map((p) => p.ca), 1);
  const top = produits.slice(0, 12);

  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest">
            Produits les plus rentables
          </p>
          <p className="text-xs text-white/20 mt-0.5">
            Classés par chiffre d&apos;affaires sur la période choisie
          </p>
        </div>
        <span className="text-xs text-white/30 border border-white/10 rounded-lg px-2 py-1">
          {fmtArgent(totalCa)} de CA
        </span>
      </div>

      {top.length === 0 ? (
        <p className="text-white/20 text-sm py-8 text-center">
          Aucune vente validée sur cette période.
        </p>
      ) : (
        <div className="space-y-4">
          {top.map((p, i) => {
            const pct = totalCa > 0 ? Math.round((p.ca / totalCa) * 100) : 0;
            const bar = Math.round((p.ca / maxCa) * 100);
            return (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-white/20 font-mono w-5 shrink-0 text-right">
                      {i + 1}
                    </span>
                    <span className="text-sm text-white/80 font-medium truncate">{p.nom}</span>
                    <span className="text-xs text-white/25 shrink-0">
                      {p.quantite} vendu{p.quantite > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0 ml-4">
                    <span className="text-white/35 tabular-nums hidden sm:block">{pct}%</span>
                    <span className="text-[#e4b56a] font-semibold tabular-nums w-32 text-right">
                      {fmtArgent(p.ca)}
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden ml-8">
                  <div
                    className="h-full bg-gradient-to-r from-[#e4b56a]/60 to-[#c4893a]/30 rounded-full"
                    style={{ width: `${bar}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
