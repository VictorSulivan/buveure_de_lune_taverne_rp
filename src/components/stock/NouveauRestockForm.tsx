"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fmtArgent } from "@/utils/fmtArgent";

interface Produit {
  id: number;
  nom: string;
  categorie: string;
  stock: number;
  prixAchat: number;
}

interface LigneRestock {
  produitId: string;
  quantite: number;
}

export default function NouveauRestockForm({ produits }: { produits: Produit[] }) {
  const router = useRouter();
  const [lignes, setLignes] = useState<LigneRestock[]>([{ produitId: "", quantite: 1 }]);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const ajouterLigne = () => {
    setLignes([...lignes, { produitId: "", quantite: 1 }]);
  };

  const supprimerLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const handleChangeLigne = (index: number, champ: keyof LigneRestock, valeur: string | number) => {
    const nouvellesLignes = [...lignes];
    nouvellesLignes[index] = { ...nouvellesLignes[index], [champ]: valeur };
    setLignes(nouvellesLignes);
  };

  // Calcul purement indicatif de la valeur marchande du restock
  const valeurTotalRestock = lignes.reduce((acc, ligne) => {
    const produit = produits.find((p) => p.id === parseInt(ligne.produitId));
    if (!produit) return acc;
    return acc + produit.prixAchat * (ligne.quantite || 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErreur("");

    const lignesValides = lignes.filter((l) => l.produitId && l.quantite > 0);
    if (lignesValides.length === 0) {
      setErreur("Veuillez sélectionner au moins un produit.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/produits/restocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lignes: lignesValides.map((l) => ({
            produitId: parseInt(l.produitId),
            quantite: l.quantite,
          })),
        }),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || "Une erreur est survenue");
      }

      router.push("/dashboard/stock");
      router.refresh();
    } catch (err: unknown) {
      setErreur(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erreur && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
          {erreur}
        </div>
      )}

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden p-6 space-y-4">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">
          Articles à réapprovisionner
        </h2>

        {lignes.map((ligne, index) => {
          const produitSelectionne = produits.find((p) => p.id === parseInt(ligne.produitId));

          return (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-4 items-start sm:items-end bg-white/2 p-4 rounded-lg border border-white/5 transition-colors"
            >
              {/* Sélection du produit */}
              <div className="flex-1 w-full">
                <label className="block text-xs text-white/40 mb-1.5 font-medium">Produit</label>
                <select
                  value={ligne.produitId}
                  onChange={(e) => handleChangeLigne(index, "produitId", e.target.value)}
                  className="w-full bg-[#111122] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                  required
                >
                  <option value="" className="bg-[#2b1d14]">Choisir un produit...</option>
                  {produits.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#2b1d14]">
                      {p.nom} ({p.categorie === "plat" ? "Plat" : "Boisson"}) — Stock : {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantité d'items */}
              <div className="w-full sm:w-32">
                <label className="block text-xs text-white/40 mb-1.5 font-medium">Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={ligne.quantite}
                  onChange={(e) => handleChangeLigne(index, "quantite", parseInt(e.target.value) || 0)}
                  className="w-full bg-[#111122] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                  required
                />
              </div>

              {/* Valeur indicative de la ligne */}
              <div className="w-full sm:w-32 text-left sm:text-right py-2 sm:py-0">
                <span className="block text-xs text-white/30 mb-1">Coût indicatif</span>
                <span className="text-sm font-medium text-white/80">
                  {produitSelectionne ? fmtArgent(produitSelectionne.prixAchat * ligne.quantite) : fmtArgent(0)}
                </span>
              </div>

              {/* Action supprimer */}
              {lignes.length > 1 && (
                <button
                  type="button"
                  onClick={() => supprimerLigne(index)}
                  className="text-xs text-red-400/60 hover:text-red-400 px-3 h-10 rounded-lg hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-colors w-full sm:w-auto"
                >
                  Supprimer
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={ajouterLigne}
          className="flex items-center gap-2 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-xs font-medium px-4 py-2 rounded-lg transition-colors mt-2"
        >
          + Ajouter un produit
        </button>
      </div>

      {/* Footer de validation */}
      <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div>
          <span className="text-xs text-white/40 block mb-0.5">Valeur totale de la commande</span>
          <span className="text-2xl font-semibold text-[#f3d7a5]">{fmtArgent(valeurTotalRestock)}</span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard/stock"
            className="text-sm text-white/40 hover:text-white px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-center w-full sm:w-auto"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors text-center w-full sm:w-auto shadow-lg shadow-emerald-900/20"
          >
            {loading ? "Mise à jour..." : "Confirmer le Restock"}
          </button>
        </div>
      </div>
    </form>
  );
}