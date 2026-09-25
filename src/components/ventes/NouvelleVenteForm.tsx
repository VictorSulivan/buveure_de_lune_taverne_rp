"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormExtras from "./FormExtras";
import NouveauClientModal from "../clients/NouveauClientModal";
import FormClients from "../clients/FormClients";
import { Produit } from "@prisma/client";
import { fmtArgent } from "@/utils/fmtArgent";
import { ContexteCommande } from "./ContexteCommande";
import type { ClientAvecAffiliations } from "@/types/client";
import type { ContexteValue } from "@/lib/clients";

// Modification du type Ligne pour stocker le prix d'achat et le flag employé
type Ligne = { 
  produitId: number; 
  nom: string; 
  quantite: number; 
  prixVente: number;
  prixAchat: number;
  prixEtudiant: boolean; 
  prixEmploye: boolean; // <-- Ajout de l'option employé
};
type Extra = { label: string; montant: number };

export type VenteEdition = {
  id: number;
  clientId: number;
  contexte: ContexteValue;
  organisationId: number | null;
  organisationNom: string | null;
  organisationType: string | null;
  dateVente: string;
  lignes: Ligne[];
  extras: Extra[];
};

export default function NouvelleVenteForm({
  clients: initialClients,
  produits,
  vente,
}: {
  clients: ClientAvecAffiliations[];
  produits: Produit[];
  vente?: VenteEdition;
}) {
  const router = useRouter();
  const [clients, setClients] = useState<ClientAvecAffiliations[]>(initialClients);
  const [clientId, setClientId] = useState<number | null>(vente?.clientId ?? null);
  const [contexte, setContexte] = useState<ContexteValue>(vente?.contexte ?? "civil");
  const [organisationId, setOrganisationId] = useState<number | null>(vente?.organisationId ?? null);
  const [dateVente, setDateVente] = useState(vente?.dateVente ?? "");
  const [lignes, setLignes] = useState<Ligne[]>(vente?.lignes ?? []);
  const [extras, setExtras] = useState<Extra[]>(vente?.extras ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const selectedClient = clients.find((c) => c.id === clientId);

  // Calcul dynamique du total des produits à l'affichage selon le mode tarifaire coché
  const totalProduits = lignes.reduce((acc, l) => {
    const prixEffectif = l.prixEmploye ? l.prixAchat : l.prixVente;
    return acc + l.quantite * prixEffectif;
  }, 0);

  const totalExtras = extras.reduce((acc, e) => acc + e.montant, 0);
  const total = totalProduits + totalExtras;

  const clientSelectionFormat = selectedClient 
    ? [{ clientId: selectedClient.id, nbPersonnes: 1, commentaire: "" }] 
    : [];

  function ajouterProduit(p: Produit) {
    const prixVenteNum = Number(p.prixVente);
    const prixAchatNum = Number(p.prixAchat);
    
    setLignes((prev) => {
      const exist = prev.find((l) => l.produitId === p.id);
      if (exist) return prev.map((l) => l.produitId === p.id ? { ...l, quantite: l.quantite + 1 } : l);
      return [...prev, { 
        produitId: p.id, 
        nom: p.nom, 
        quantite: 1, 
        prixVente: prixVenteNum, 
        prixAchat: prixAchatNum, 
        prixEtudiant: false, 
        prixEmploye: false 
      }];
    });
  }
  
  function setQuantite(id: number, q: number) {
    if (q <= 0) return setLignes((p) => p.filter((l) => l.produitId !== id));
    setLignes((p) => p.map((l) => l.produitId === id ? { ...l, quantite: q } : l));
  }

  function togglePrixEmploye(id: number) {
    setLignes((p) => p.map((l) => l.produitId === id ? { 
      ...l, 
      prixEmploye: !l.prixEmploye,
      prixEtudiant: false,
    } : l));
  }

  async function handleSubmit() {
    if (!clientId) return setError("Sélectionnez un client");
    if (!lignes.length && !extras.length) return setError("Ajoutez au moins un produit ou un extra");
    setLoading(true); setError("");

    const payload = {
      clientId,
      lignes,
      extras,
      contexteCommande: contexte,
      organisationId,
      ...(dateVente ? { dateVente } : {}),
    };
    const res = await fetch(vente ? `/api/ventes/${vente.id}` : "/api/ventes", {
      method: vente ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (res.ok) { 
      router.push("/dashboard/ventes"); 
      router.refresh(); 
    } else { 
      const d = await res.json(); 
      setError(d.error ?? "Erreur"); 
      setLoading(false); 
    }
  }

  return (
    <>
      {showModal && (
        <NouveauClientModal
          onClose={() => setShowModal(false)} 
          onCreated={(c) => { setClients((p) => [...p, c]); setClientId(c.id); setShowModal(false); }} 
        />
      )}

      <div className="space-y-6">
        {/* CLIENT */}
        <FormClients
          clients={clients} 
          selectedClients={clientSelectionFormat} 
          onSelectClient={(id) => { setClientId(id); setContexte("civil"); setOrganisationId(null); }}
          onRemoveClient={() => { setClientId(null); setContexte("civil"); setOrganisationId(null); }} 
          onUpdateNbPersonnes={() => {}} 
          onOpenModal={() => setShowModal(true)} 
        />

        <ContexteCommande
          client={selectedClient}
          value={contexte}
          onChange={(v) => {
            setContexte(v);
            if (v === "civil") setOrganisationId(null);
            else if (v === vente?.organisationType) setOrganisationId(vente.organisationId);
            else setOrganisationId(null);
          }}
          snapshot={{
            entreprise: vente?.organisationType === "entreprise" ? vente.organisationNom ?? undefined : undefined,
            nation: vente?.organisationType === "nation" ? vente.organisationNom ?? undefined : undefined,
          }}
        />

        {vente && (
          <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
            <label className="block text-xs text-white/40 mb-1.5">Date de la vente</label>
            <input
              type="datetime-local"
              value={dateVente}
              onChange={(e) => setDateVente(e.target.value)}
              className="input-dark max-w-xs"
            />
          </div>
        )}

        {/* PRODUITS */}
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Produits</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {produits.map((p) => {
              const inCart = lignes.find((l) => l.produitId === p.id);
              return (
                <button key={p.id} type="button" onClick={() => ajouterProduit(p)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${inCart ? "bg-[#6b3e22] border-[#a06b3c] text-[#f3d7a5]" : "bg-[#1c140e] border-white/10 text-white/60 hover:text-white hover:border-white/20"}`}>
                  <span className="block truncate">{p.nom}</span>
                  <span className="text-xs opacity-60">{fmtArgent(Number(p.prixVente))} · stock {p.stock}</span>
                </button>
              );
            })}
          </div>

          {lignes.length > 0 && (
            <div className="border-t border-white/10 pt-4 space-y-3">
              {lignes.map((l) => {
                const prixEffectifLigne = l.prixEmploye ? l.prixAchat : l.prixVente;
                
                return (
                  <div key={l.produitId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1c140e]/40 p-3 rounded-lg border border-white/5">
                    <span className="text-sm text-white flex-1 truncate font-medium">{l.nom}</span>
                    
                    <div className="flex items-center gap-4 my-1 sm:my-0">
                      <label className="relative flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={l.prixEmploye}
                          onChange={() => togglePrixEmploye(l.produitId)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-white/5 peer-focus:outline-none rounded-full peer border border-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white/30 peer-checked:after:bg-[#bbf7d0] after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-[#14281d] peer-checked:border-emerald-800"></div>
                        <span className="ml-1.5 text-[11px] font-medium text-white/40 peer-checked:text-emerald-400">💼 Employé</span>
                      </label>
                    </div>

                    {/* Controles Quantités, prix de la ligne et suppression */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-white/5 pt-2 sm:pt-0 sm:border-none">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setQuantite(l.produitId, l.quantite - 1)} className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors">−</button>
                        <span className="text-white text-sm w-5 text-center">{l.quantite}</span>
                        <button type="button" onClick={() => setQuantite(l.produitId, l.quantite + 1)} className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors">+</button>
                      </div>

                      <span className="text-sm text-white/60 w-20 text-right">{fmtArgent(l.quantite * prixEffectifLigne)}</span>
                      <button type="button" onClick={() => setQuantite(l.produitId, 0)} className="text-white/20 hover:text-red-400 text-xs transition-colors pl-2">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* EXTRAS */}
        <FormExtras 
          extras={extras} 
          onAddExtra={(label, montant) => setExtras((p) => [...p, { label, montant }])} 
          onRemoveExtra={(index) => setExtras((p) => p.filter((_, j) => j !== index))} 
        />

        {/* TOTAL & SUBMIT */}
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
          {extras.length > 0 && (
            <div className="space-y-1.5 mb-4 pb-4 border-b border-white/10">
              <div className="flex justify-between text-sm text-white/50"><span>Produits</span><span>{fmtArgent(totalProduits)}</span></div>
              <div className="flex justify-between text-sm text-white/50"><span>Extras</span><span>{fmtArgent(totalExtras)}</span></div>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/40 text-sm">Total</span>
            <span className="text-2xl font-medium text-white">{fmtArgent(total)}</span>
          </div>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {loading ? "Enregistrement..." : vente ? "Sauvegarder" : "✓ Valider la vente"}
            </button>
            {vente && (
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  if (!confirm("Supprimer cette vente ? Le stock et la banque seront recalculés.")) return;
                  setLoading(true);
                  const res = await fetch(`/api/ventes/${vente.id}`, { method: "DELETE" });
                  if (res.ok) {
                    router.push("/dashboard/ventes");
                    router.refresh();
                  } else {
                    const d = await res.json();
                    setError(d.error ?? "Erreur");
                    setLoading(false);
                  }
                }}
                className="px-4 text-sm text-red-400/70 hover:text-red-300 border border-red-500/20 rounded-lg disabled:opacity-50"
              >
                Supprimer
              </button>
            )}
            <button type="button" onClick={() => router.back()}
              className="px-4 text-sm text-white/40 hover:text-white border border-white/10 rounded-lg transition-colors">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </>
  );
}