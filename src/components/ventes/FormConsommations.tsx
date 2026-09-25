"use client";

import { Produit } from "@prisma/client";
import { fmtArgent } from "@/utils/fmtArgent";

type ConsoItem = { produitId: number; nom: string; quantite: number; prixUnitaire: number };

// --- 5. COMPOSANT : CONSOMMATIONS ---
export default function FormConsommations({ produits, conso, onToggleProduit, onUpdateConsoQte }: { produits: Produit[]; conso: ConsoItem[]; onToggleProduit: (p: Produit) => void; onUpdateConsoQte: (id: number, q: number) => void }) {
  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-xs text-white/40 uppercase tracking-widest">Consommations prévues</p>
      <div className="grid grid-cols-2 gap-2">
        {produits.map((p) => (
          <button key={p.id} type="button" onClick={() => onToggleProduit(p)}
            className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${conso.find((c) => c.produitId === p.id) ? "bg-[#6b3e22] border-[#a06b3c] text-[#f3d7a5]" : "bg-[#1c140e] border-white/10 text-white/50 hover:text-white"}`}>
            <span className="block">{p.nom}</span>
            <span className="text-xs opacity-60">{fmtArgent(Number(p.prixVente))}</span>
          </button>
        ))}
      </div>
      {conso.length > 0 && (
        <div className="space-y-2 border-t border-white/10 pt-3">
          {conso.map((c) => (
            <div key={c.produitId} className="flex items-center gap-3">
              <span className="text-white/60 text-sm flex-1">{c.nom}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onUpdateConsoQte(c.produitId, Math.max(1, c.quantite - 1))} className="w-7 h-7 rounded bg-white/5 text-white/60 text-sm">−</button>
                <span className="text-white text-sm w-5 text-center">{c.quantite}</span>
                <button type="button" onClick={() => onUpdateConsoQte(c.produitId, c.quantite + 1)} className="w-7 h-7 rounded bg-white/5 text-white/60 text-sm">+</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}