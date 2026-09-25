"use client";

import { useState } from "react";
import { DEVISE, NOM_BANQUE } from "@/lib/branding";

type Mode = "versement" | "retrait";

export default function CalculateurTaxe() {
  const [mode, setMode] = useState<Mode>("versement");

  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden mb-8">
      <div className="flex border-b border-white/10">
        {([
          { id: "versement", label: "💸 Versement" },
          { id: "retrait", label: "🏧 Retrait" },
        ] as { id: Mode; label: string }[]).map(({ id, label }) => (
          <button key={id} onClick={() => setMode(id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              mode === id
                ? "text-white border-b-2 border-[#e4b56a] bg-white/3"
                : "text-white/40 hover:text-white/70"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {mode === "versement" && <Transaction type="versement" />}
        {mode === "retrait" && <Transaction type="retrait" />}
      </div>
    </div>
  );
}

function Transaction({ type }: { type: "versement" | "retrait" }) {
  const [montant, setMontant] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isRetrait = type === "retrait";
  const montantNum = parseFloat(montant) || 0;

  async function handleSubmit() {
    if (!montantNum) return setError("Montant requis");
    setLoading(true); setError("");

    const res = await fetch("/api/banque/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        montant: montantNum,
        description: description || (isRetrait ? "Retrait manuel" : "Versement manuel"),
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setMontant(""); setDescription("");
      setTimeout(() => { setSuccess(false); window.location.reload(); }, 1500);
    } else {
      const d = await res.json();
      setError(d.error ?? "Erreur");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
          {isRetrait ? `Retrait depuis la ${NOM_BANQUE.toLowerCase()}` : `Versement vers la ${NOM_BANQUE.toLowerCase()}`}
        </p>
        <p className="text-white/30 text-xs mb-4">
          {isRetrait
            ? "Le montant est débité tel quel, sans taxe."
            : "Ajouter de l'argent au solde bancaire directement."}
        </p>
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">
          {isRetrait ? `Montant à retirer (${DEVISE})` : `Montant à verser (${DEVISE})`}
        </label>
        <input type="number" value={montant} onChange={(e) => setMontant(e.target.value)}
          placeholder="Ex: 5000" className="input-dark" />
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Description (optionnel)</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder={isRetrait ? "Achat véhicule, loyer..." : "Remboursement, apport..."}
          className="input-dark" />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className={`w-full text-sm font-medium py-2.5 rounded-lg border transition-colors ${
          success
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : isRetrait
              ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400 disabled:opacity-50"
              : "bg-[#6b3e22] hover:bg-[#8a532c] border-[#a06b3c] text-[#f3d7a5] disabled:opacity-50"
        }`}>
        {success ? "✓ Opération effectuée" : loading ? "En cours..." : isRetrait ? "Effectuer le retrait" : "Effectuer le versement"}
      </button>
    </div>
  );
}
