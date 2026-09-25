"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChampsAffiliations } from "@/components/clients/ChampsAffiliations";

export default function NouveauClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nom: "", prenom: "", entrepriseNom: "", nationNom: "",
  });

  function set(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    if (!form.nom) return setError("Le nom est requis");
    setLoading(true);
    setError("");
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/dashboard/clients");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white">Nouveau client</h1>
        <p className="text-white/40 text-sm mt-1">Une personne, éventuellement liée à une entreprise et une nation</p>
      </div>

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Prénom</label>
            <input value={form.prenom} onChange={(e) => set("prenom", e.target.value)}
              className="input-dark" placeholder="Iria" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Nom</label>
            <input value={form.nom} onChange={(e) => set("nom", e.target.value)}
              className="input-dark" placeholder="Valen" />
          </div>
        </div>

        <ChampsAffiliations
          entrepriseNom={form.entrepriseNom}
          nationNom={form.nationNom}
          onChange={set}
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Création..." : "Créer le client"}
          </button>
          <button onClick={() => router.back()}
            className="px-4 text-sm text-white/40 hover:text-white border border-white/10 rounded-lg transition-colors">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
