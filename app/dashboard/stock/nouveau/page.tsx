"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEVISE } from "@/lib/branding";

export default function NouveauProduit() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nom: "", categorie: "plat", stock: 0,
    prixAchat: 0, prixVente: 0, description: "",
  });

  function set(key: string, val: string | number) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/produits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/dashboard/stock");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur inconnue");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white">Nouveau produit</h1>
        <p className="text-white/40 text-sm mt-1">Ajouter un produit au catalogue</p>
      </div>

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-6 space-y-5">
        <Field label="Nom du produit">
          <input
            placeholder="ex: Burger Los Santos"
            value={form.nom}
            onChange={(e) => set("nom", e.target.value)}
            className="input-dark"
          />
        </Field>

        <Field label="Catégorie">
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "plat",    label: "🍽️  Plat" },
              { value: "boisson", label: "🥤  Boisson" },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => set("categorie", value)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.categorie === value
                    ? "bg-[#6b3e22] border-[#a06b3c] text-[#f3d7a5]"
                    : "bg-[#1c140e] border-white/10 text-white/40 hover:text-white hover:border-white/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Stock initial">
          <input
            type="number" min={0}
            value={form.stock}
            onChange={(e) => set("stock", parseInt(e.target.value) || 0)}
            className="input-dark"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={`Prix d'achat (${DEVISE})`}>
            <input
              type="number" min={0} step={0.01}
              value={form.prixAchat}
              onChange={(e) => set("prixAchat", parseFloat(e.target.value) || 0)}
              className="input-dark"
            />
          </Field>
          <Field label={`Prix de vente (${DEVISE})`}>
            <input
              type="number" min={0} step={0.01}
              value={form.prixVente}
              onChange={(e) => set("prixVente", parseFloat(e.target.value) || 0)}
              className="input-dark"
            />
          </Field>
        </div>

        <Field label="Description (optionnel)">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="input-dark resize-none"
          />
        </Field>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer le produit"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 text-sm text-white/40 hover:text-white border border-white/10 rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
