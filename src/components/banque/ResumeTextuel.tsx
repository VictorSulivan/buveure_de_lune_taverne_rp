"use client";

import type { KpiData, EmployeStat, ProduitStat } from "types/analyse";
import { periodeLabel } from "src/utils/buildMoisStats";
import type { Periode } from "types/analyse";
import { NOM_BANQUE } from "@/lib/branding";
import { fmtArgent } from "@/utils/fmtArgent";

export function ResumeTextuel({
  kpi,
  topEmploye,
  topProduit,
  periode,
  debut,
  fin,
}: {
  kpi: KpiData;
  topEmploye: EmployeStat | null;
  topProduit?: ProduitStat | null;
  periode: Periode;
  debut?: string;
  fin?: string;
}) {
  const label = periodeLabel(periode, debut, fin);

  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
      <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Résumé</p>
      <p className="text-white/50 text-sm leading-relaxed">
        Sur la période{" "}
        <span className="text-white/80">{label}</span>, la {NOM_BANQUE.toLowerCase()} a enregistré{" "}
        <span className="text-green-400">{fmtArgent(kpi.gains)}</span> de gains bruts
        pour{" "}
        <span className="text-red-400">{fmtArgent(kpi.depenses)}</span> de dépenses et{" "}
        <span className="text-orange-400">{fmtArgent(kpi.taxes)}</span> de taxes
        prélevées. Le solde net de la période est de{" "}
        <span
          className={`font-semibold ${
            kpi.net >= 0 ? "text-[#e4b56a]" : "text-red-400"
          }`}
        >
          {fmtArgent(kpi.net, { signe: true })}
        </span>
        {kpi.net < 0 && (
          <span className="text-white/30">
            {" "}— les charges dépassent les gains sur cette période.
          </span>
        )}
        .{" "}
        {topProduit && (
          <>
            Le produit le plus rentable est{" "}
            <span className="text-white/80">{topProduit.nom}</span> avec{" "}
            <span className="text-[#e4b56a]">{fmtArgent(topProduit.ca)}</span>{" "}
            de chiffre d&apos;affaires ({topProduit.quantite} vendu
            {topProduit.quantite > 1 ? "s" : ""}).{" "}
          </>
        )}
        {topEmploye && (
          <>
            L&apos;employé qui rapporte le plus est{" "}
            <span className="text-white/80">{topEmploye.nom}</span> avec{" "}
            <span className="text-green-400">{fmtArgent(topEmploye.caVentes)}</span>{" "}
            de ventes
            {topEmploye.nbVentes > 0
              ? ` sur ${topEmploye.nbVentes} vente${topEmploye.nbVentes > 1 ? "s" : ""}`
              : ""}
            .
          </>
        )}
      </p>
    </div>
  );
}
