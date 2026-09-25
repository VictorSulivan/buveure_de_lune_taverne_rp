"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fmtArgent } from "@/utils/fmtArgent";

export default function VerserSalairesForm({
  totalPrevu,
  nbAPayer,
  labelSemaine,
  dejaVerse,
}: {
  totalPrevu: number;
  nbAPayer: number;
  labelSemaine: string;
  dejaVerse: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function handleVerser() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/salaires", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    if (res.ok) {
      setOk(true);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur");
    }
    setLoading(false);
  }

  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-xs text-white/40 uppercase tracking-widest">Semaine en cours</p>
      <p className="text-white font-medium">{labelSemaine}</p>
      <div className="flex justify-between text-sm">
        <span className="text-white/50">À débiter</span>
        <span className="text-[#f3d7a5]">{dejaVerse ? "Déjà versé" : fmtArgent(totalPrevu)}</span>
      </div>
      <p className="text-xs text-white/35">
        {dejaVerse
          ? "Tous les salaires de cette semaine ont déjà été prélevés sur la banque."
          : nbAPayer === 0
            ? "Aucun salaire défini. Renseignez-les sur les fiches employés."
            : `${nbAPayer} employé${nbAPayer > 1 ? "s" : ""} ${nbAPayer > 1 ? "seront payés" : "sera payé"}. Le solde banque sera débité.`}
      </p>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        onClick={handleVerser}
        disabled={loading || dejaVerse || nbAPayer === 0}
        className={`w-full text-sm font-medium py-2.5 rounded-lg border transition-colors ${
          ok || dejaVerse
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-[#6b3e22] hover:bg-[#8a532c] border-[#a06b3c] text-[#f3d7a5] disabled:opacity-50"
        }`}
      >
        {ok || dejaVerse ? "✓ Salaires versés" : loading ? "Versement..." : "Verser les salaires de la semaine"}
      </button>
    </div>
  );
}
