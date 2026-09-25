"use client";

import { affiliationActive } from "@/lib/clients";
import type { ClientAvecAffiliations } from "@/types/client";
import type { ContexteValue } from "@/lib/clients";

export function ContexteCommande({
  client,
  value,
  onChange,
  snapshot,
}: {
  client: ClientAvecAffiliations | undefined;
  value: ContexteValue;
  onChange: (v: ContexteValue) => void;
  snapshot?: { entreprise?: string; nation?: string };
}) {
  if (!client) return null;

  const entreprise = affiliationActive(client.affiliations, "entreprise");
  const nation = affiliationActive(client.affiliations, "nation");
  const nomEntreprise = entreprise?.organisation.nom ?? snapshot?.entreprise;
  const nomNation = nation?.organisation.nom ?? snapshot?.nation;

  const options: { value: ContexteValue; label: string; sub: string; disabled?: boolean }[] = [
    { value: "civil", label: "En civil", sub: "Commande personnelle" },
    {
      value: "entreprise",
      label: "Pour l'entreprise",
      sub: nomEntreprise ?? "Aucune entreprise actuelle",
      disabled: !nomEntreprise,
    },
    {
      value: "nation",
      label: "Pour la nation",
      sub: nomNation ?? "Aucune nation actuelle",
      disabled: !nomNation,
    },
  ];

  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
      <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Qui demande la commande</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={`text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${
              value === o.value
                ? "bg-[#6b3e22] border-[#a06b3c] text-[#f3d7a5]"
                : o.disabled
                  ? "bg-[#1c140e] border-white/5 text-white/20 cursor-not-allowed"
                  : "bg-[#1c140e] border-white/10 text-white/60 hover:text-white hover:border-white/20"
            }`}
          >
            <span className="block font-medium">{o.label}</span>
            <span className="block text-xs opacity-60 truncate">{o.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
