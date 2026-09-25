"use client";

import { KpiData } from "types/analyse";
import { fmtArgent } from "@/utils/fmtArgent";

export function KpiGrid({ kpi }: { kpi: KpiData }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        label="Gains bruts"
        value={fmtArgent(kpi.gains, { signe: true })}
        color="text-green-400"
        sub={`${kpi.nbTransactions} transactions`}
      />
      <KpiCard
        label="Dépenses"
        value={fmtArgent(-kpi.depenses, { signe: true })}
        color="text-red-400"
        sub="hors taxe bancaire"
      />
      <KpiCard
        label="Taxe bancaire"
        value={fmtArgent(-kpi.taxes, { signe: true })}
        color="text-orange-400"
        sub="prélevée sur retraits"
      />
      <KpiCard
        label="Solde net période"
        value={fmtArgent(kpi.net, { signe: true })}
        color={kpi.net >= 0 ? "text-[#e4b56a]" : "text-red-400"}
        sub="gains − dépenses − taxes"
        highlight
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  color,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  color: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        highlight
          ? "bg-[#3d2818] border-[#e4b56a]/20"
          : "bg-[#2b1d14] border-white/10"
      }`}
    >
      <p className="text-xs text-white/40 mb-2">{label}</p>
      <p className={`text-xl font-semibold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-xs text-white/25 mt-1">{sub}</p>}
    </div>
  );
}
