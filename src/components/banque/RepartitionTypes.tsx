"use client";

import type { TypeStat } from "types/analyse";
import { fmtArgent } from "@/utils/fmtArgent";

export function RepartitionTypes({
  gains,
  charges,
  totalGains,
  totalCharges,
}: {
  gains: TypeStat[];
  charges: TypeStat[];
  totalGains: number;
  totalCharges: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Section title="Sources de gains">
        {gains.length === 0 ? (
          <Empty />
        ) : (
          gains
            .sort((a, b) => b.montant - a.montant)
            .map((t) => (
              <BarRow
                key={t.type}
                label={t.type}
                montant={t.montant}
                max={totalGains}
                barColor="bg-green-500/50"
                textColor="text-green-400"
                sign="+"
              />
            ))
        )}
      </Section>

      <Section title="Sources de charges">
        {charges.length === 0 ? (
          <Empty />
        ) : (
          charges
            .sort((a, b) => b.montant - a.montant)
            .map((t) => (
              <BarRow
                key={t.type}
                label={t.type}
                montant={t.montant}
                max={totalCharges}
                barColor="bg-red-500/40"
                textColor="text-red-400"
                sign="-"
              />
            ))
        )}
      </Section>
    </div>
  );
}

function BarRow({
  label,
  montant,
  max,
  barColor,
  textColor,
  sign,
}: {
  label: string;
  montant: number;
  max: number;
  barColor: string;
  textColor: string;
  sign: string;
}) {
  const pct = max > 0 ? Math.round((montant / max) * 100) : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/50 capitalize">{label}</span>
        <span className="tabular-nums">
          <span className={textColor}>
            {sign === "-" ? fmtArgent(-montant, { signe: true }) : fmtArgent(montant, { signe: true })}
          </span>
          <span className="text-white/25 ml-1.5">({pct}%)</span>
        </span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
      <p className="text-xs text-white/30 uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <p className="text-white/20 text-sm py-6 text-center">
      Aucune donnée sur cette période.
    </p>
  );
}
