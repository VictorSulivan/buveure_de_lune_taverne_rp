"use client";

import { useState } from "react";
import { fmtArgent } from "@/utils/fmtArgent";

type Extra = { label: string; montant: number };

// --- 6. COMPOSANT : EXTRAS ---
export default function FormExtras({ extras, onAddExtra, onRemoveExtra }: { extras: Extra[]; onAddExtra: (label: string, montant: number) => void; onRemoveExtra: (index: number) => void }) {
  const [label, setLabel] = useState("");
  const [montantStr, setMontantStr] = useState("");

  const handleAdd = () => {
    const val = parseFloat(montantStr);
    if (!label.trim() || !val || val <= 0) return;
    onAddExtra(label.trim(), val);
    setLabel(""); setMontantStr("");
  };

  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
      <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Extras</p>
      <div className="flex gap-2 mb-3">
        <input value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="Description (ex: Sono, Location salle)" className="input-dark flex-1" />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
          <input type="number" min={0} value={montantStr} onChange={(e) => setMontantStr(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="0" className="input-dark w-24 pl-7 text-right" />
        </div>
        <button type="button" onClick={handleAdd} disabled={!label.trim() || !montantStr} className="px-4 bg-[#6b3e22] border border-[#a06b3c] text-[#f3d7a5] text-sm rounded-lg disabled:opacity-30">+</button>
      </div>
      {extras.length > 0 ? (
        <div className="space-y-2">
          {extras.map((e, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 bg-[#1c140e] rounded-lg border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#e4b56a] bg-[#6b3e22] border border-[#a06b3c] px-1.5 py-0.5 rounded">Extra</span>
                <span className="text-sm text-white/70">{e.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white">{fmtArgent(e.montant)}</span>
                <button type="button" onClick={() => onRemoveExtra(i)} className="text-white/20 hover:text-red-400 text-xs">✕</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/20 text-xs text-center py-3">Aucun extra — matériel, sécurité...</p>
      )}
    </div>
  );
}