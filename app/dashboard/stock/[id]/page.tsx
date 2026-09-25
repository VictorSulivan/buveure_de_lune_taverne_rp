"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DEVISE } from "@/lib/branding";

export default function EditProduit() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  interface ProduitForm {
    nom: string;
    categorie: "plat" | "boisson";
    stock: number;
    prixAchat: number;
    prixVente: number;
    description: string | null;
    actif: boolean;
  }
  const [form, setForm] = useState<ProduitForm | null>(null);

  useEffect(() => {
    fetch(`/api/produits/${id}`).then((r) => r.json()).then((p) => setForm({
      ...p,
      categorie: p.categorie === "boisson" ? "boisson" : "plat",
      actif: p.actif !== false,
    }));
  }, [id]);

  function set(key: keyof ProduitForm, val: string | number | boolean) {
    setForm((f) => f ? ({ ...f, [key]: val }) : f);
  }

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/produits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/dashboard/stock");
    router.refresh();
  }

  if (!form) return <div className="text-white/40">Chargement...</div>;

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white">Modifier le produit</h1>
        <p className="text-white/40 text-sm mt-1">{form.nom}</p>
      </div>

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Nom</label>
          <input value={form.nom} onChange={(e) => set("nom", e.target.value)} className="input-dark" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Catégorie</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "plat", label: "🍽️  Plat" },
              { value: "boisson", label: "🥤  Boisson" },
            ] as const).map(({ value, label }) => (
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
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Stock</label>
          <input type="number" value={form.stock} onChange={(e) => set("stock", parseInt(e.target.value) || 0)} className="input-dark" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Prix achat ({DEVISE})</label>
            <input type="number" value={form.prixAchat} onChange={(e) => set("prixAchat", parseFloat(e.target.value) || 0)} className="input-dark" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Prix vente ({DEVISE})</label>
            <input type="number" value={form.prixVente} onChange={(e) => set("prixVente", parseFloat(e.target.value) || 0)} className="input-dark" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Description</label>
          <textarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} className="input-dark resize-none" />
        </div>
        <label className="flex items-center gap-2 text-sm text-white/60">
          <input
            type="checkbox"
            checked={form.actif}
            onChange={(e) => set("actif", e.target.checked)}
          />
          Produit actif (visible à la vente)
        </label>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={loading}
            className="flex-1 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Sauvegarde..." : "Sauvegarder"}
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
