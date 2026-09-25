"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NouvelleOrganisationForm() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [type, setType] = useState<"entreprise" | "nation">("entreprise");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim()) return setError("Le nom est requis");
    setLoading(true);
    setError("");
    const res = await fetch("/api/organisations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: nom.trim(), type }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur");
      setLoading(false);
      return;
    }
    setNom("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 mb-6">
      <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Ajouter</p>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs text-white/40 mb-1.5">Nom</label>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="input-dark"
            placeholder={type === "nation" ? "Garde royale" : "Compagnie du Nord"}
          />
        </div>
        <div className="w-48">
          <label className="block text-xs text-white/40 mb-1.5">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "entreprise" | "nation")}
            className="input-dark"
          >
            <option value="entreprise">Entreprise</option>
            <option value="nation">Nation</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] disabled:opacity-50"
        >
          {loading ? "Ajout..." : "+ Enregistrer"}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </form>
  );
}
