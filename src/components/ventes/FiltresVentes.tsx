"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type OrgOption = { id: number; nom: string };

export function FiltresVentes({
  entreprises,
  nations,
  valeurs,
}: {
  entreprises: OrgOption[];
  nations: OrgOption[];
  valeurs: {
    q: string;
    entreprise: string;
    nation: string;
    contexte: string;
  };
}) {
  const router = useRouter();
  const [q, setQ] = useState(valeurs.q);
  const [entreprise, setEntreprise] = useState(valeurs.entreprise);
  const [nation, setNation] = useState(valeurs.nation);
  const [contexte, setContexte] = useState(valeurs.contexte);

  const actif = Boolean(q || entreprise || nation || contexte);

  function appliquer(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (entreprise) params.set("entreprise", entreprise);
    if (nation) params.set("nation", nation);
    if (contexte) params.set("contexte", contexte);
    const query = params.toString();
    router.push(query ? `/dashboard/ventes?${query}` : "/dashboard/ventes");
  }

  return (
    <form onSubmit={appliquer} className="bg-[#2b1d14] border border-white/10 rounded-xl p-4 mb-6 space-y-3">
      <p className="text-xs text-white/40 uppercase tracking-widest">Filtres (cumulables)</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="block">
          <span className="block text-xs text-white/40 mb-1.5">Client</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input-dark"
            placeholder="Nom ou prénom…"
          />
        </label>
        <label className="block">
          <span className="block text-xs text-white/40 mb-1.5">Entreprise</span>
          <select value={entreprise} onChange={(e) => setEntreprise(e.target.value)} className="input-dark">
            <option value="">Toutes</option>
            {entreprises.map((o) => (
              <option key={o.id} value={o.id}>{o.nom}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs text-white/40 mb-1.5">Nation</span>
          <select value={nation} onChange={(e) => setNation(e.target.value)} className="input-dark">
            <option value="">Toutes</option>
            {nations.map((o) => (
              <option key={o.id} value={o.id}>{o.nom}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs text-white/40 mb-1.5">Statut de la commande</span>
          <select value={contexte} onChange={(e) => setContexte(e.target.value)} className="input-dark">
            <option value="">Tous</option>
            <option value="civil">En civil</option>
            <option value="entreprise">Pour l&apos;entreprise</option>
            <option value="nation">Pour la nation</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="px-4 py-2 rounded-lg text-sm border border-[#a06b3c] bg-[#6b3e22] text-[#f3d7a5]">
          Filtrer
        </button>
        {actif && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setEntreprise("");
              setNation("");
              setContexte("");
              router.push("/dashboard/ventes");
            }}
            className="px-4 py-2 rounded-lg text-sm border border-white/10 text-white/40 hover:text-white"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </form>
  );
}
