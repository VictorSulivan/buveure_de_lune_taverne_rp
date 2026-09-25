"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChampsAffiliations } from "@/components/clients/ChampsAffiliations";

export default function ClientEditForm({
  client,
}: {
  client: { id: number; nom: string; prenom: string | null; entrepriseNom: string; nationNom: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nom: client.nom,
    prenom: client.prenom ?? "",
    entrepriseNom: client.entrepriseNom,
    nationNom: client.nationNom,
  });

  function set(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/clients/${client.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-xs text-white/40 uppercase tracking-widest">Modifier</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Prénom</label>
          <input value={form.prenom} onChange={(e) => set("prenom", e.target.value)} className="input-dark" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Nom</label>
          <input value={form.nom} onChange={(e) => set("nom", e.target.value)} className="input-dark" />
        </div>
      </div>

      <ChampsAffiliations
        entrepriseNom={form.entrepriseNom}
        nationNom={form.nationNom}
        onChange={set}
      />

      <button onClick={handleSave} disabled={loading}
        className={`w-full text-sm font-medium py-2.5 rounded-lg border transition-colors ${
          saved
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-[#6b3e22] hover:bg-[#8a532c] border-[#a06b3c] text-[#f3d7a5] disabled:opacity-50"
        }`}>
        {saved ? "✓ Sauvegardé" : loading ? "Sauvegarde..." : "Sauvegarder"}
      </button>
    </div>
  );
}
