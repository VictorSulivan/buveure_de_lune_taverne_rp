"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrganisationEditForm({
  organisation,
}: {
  organisation: { id: number; nom: string; type: "entreprise" | "nation" };
}) {
  const router = useRouter();
  const [nom, setNom] = useState(organisation.nom);
  const [type, setType] = useState<"entreprise" | "nation">(organisation.type);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!nom.trim()) return setError("Le nom est requis");
    setLoading(true);
    setError("");
    const res = await fetch(`/api/organisations/${organisation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: nom.trim(), type }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur");
      setLoading(false);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(`Supprimer « ${organisation.nom} » ?`)) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/organisations/${organisation.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur");
      setLoading(false);
      return;
    }
    router.push("/dashboard/organisations");
    router.refresh();
  }

  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-xs text-white/40 uppercase tracking-widest">Modifier</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Nom</label>
          <input value={nom} onChange={(e) => setNom(e.target.value)} className="input-dark" />
        </div>
        <div>
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
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className={`flex-1 text-sm font-medium py-2.5 rounded-lg border transition-colors ${
            saved
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-[#6b3e22] hover:bg-[#8a532c] border-[#a06b3c] text-[#f3d7a5] disabled:opacity-50"
          }`}
        >
          {saved ? "✓ Sauvegardé" : loading ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="px-4 text-sm text-red-400/70 hover:text-red-300 border border-red-500/20 rounded-lg disabled:opacity-50"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
