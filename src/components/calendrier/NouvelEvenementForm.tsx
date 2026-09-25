"use client";

import { Employe, Produit } from "@prisma/client";
import type { ClientAvecAffiliations } from "@/types/client";
import FormClients from "../clients/FormClients";
import NouveauClientModal from "../clients/NouveauClientModal";
import FormEquipe from "../employes/FormEquipe";
import FormConsommations from "../ventes/FormConsommations";
import FormExtras from "../ventes/FormExtras";
import FormInformations from "./FormInformations";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Extra = { label: string; montant: number };
type SelectedClient = { clientId: number; nbPersonnes: number; commentaire: string };
type ConsoItem = { produitId: number; nom: string; quantite: number; prixUnitaire: number };

// --- COMPOSANT CONTENEUR PRINCIPAL ---
export default function NouvelEvenementForm({ employes, clients: initialClients, produits }: { employes: Employe[]; clients: ClientAvecAffiliations[]; produits: Produit[] }) {
  const router = useRouter();
  const [clients, setClients] = useState<ClientAvecAffiliations[]>(initialClients);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({ titre: "", type: "reservation", dateDebut: "", dateFin: "", description: "", responsableId: "" });
  const [selectedEmployes, setSelectedEmployes] = useState<number[]>([]);
  const [selectedClients, setSelectedClients] = useState<SelectedClient[]>([]);
  const [conso, setConso] = useState<ConsoItem[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);

  const handleFormChange = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleToggleEmploye = (id: number) => {
    setSelectedEmployes((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  };

  const handleSelectClient = (id: number) => {
    setSelectedClients((prev) => prev.some((c) => c.clientId === id) ? prev : [...prev, { clientId: id, nbPersonnes: 1, commentaire: "" }]);
  };

  const handleClientCreated = (c: ClientAvecAffiliations) => {
    setClients((p) => [...p, c]);
    handleSelectClient(c.id);
    setShowModal(false);
  };

  const handleToggleProduit = (p: Produit) => {
    setConso((prev) => {
      if (prev.find((c) => c.produitId === p.id)) return prev.filter((c) => c.produitId !== p.id);
      return [...prev, { produitId: p.id, nom: p.nom, quantite: 1, prixUnitaire: p.prixVente }];
    });
  };

  async function handleSubmit() {
    if (!form.titre || !form.dateDebut) return setError("Titre et date requis");
    setLoading(true); setError("");
    const res = await fetch("/api/evenements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, responsableId: form.responsableId || null, employeIds: selectedEmployes, clientIds: selectedClients, consommations: conso, extras }),
    });
    if (res.ok) { router.push("/dashboard/calendrier"); router.refresh(); } 
    else { const data = await res.json(); setError(data.error ?? "Erreur"); setLoading(false); }
  }

  return (
    <>
      {showModal && <NouveauClientModal onClose={() => setShowModal(false)} onCreated={handleClientCreated} />}

      <div className="space-y-5">
        <FormInformations form={form} onChange={handleFormChange} />

        <FormEquipe employes={employes} responsableId={form.responsableId} selectedEmployes={selectedEmployes} onResponsableChange={(id) => handleFormChange("responsableId", id)} onToggleEmploye={handleToggleEmploye} />

        <FormClients clients={clients} selectedClients={selectedClients} onSelectClient={handleSelectClient} onRemoveClient={(id) => setSelectedClients((p) => p.filter((c) => c.clientId !== id))} onUpdateNbPersonnes={(id, count) => setSelectedClients((p) => p.map((c) => c.clientId === id ? { ...c, nbPersonnes: count } : c))} onOpenModal={() => setShowModal(true)} />

        <FormConsommations produits={produits} conso={conso} onToggleProduit={handleToggleProduit} onUpdateConsoQte={(id, q) => setConso((p) => p.map((c) => c.produitId === id ? { ...c, quantite: q } : c))} />

        <FormExtras extras={extras} onAddExtra={(label, montant) => setExtras((p) => [...p, { label, montant }])} onRemoveExtra={(index) => setExtras((p) => p.filter((_, j) => j !== index))} />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Création..." : "Créer l'événement"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-4 text-sm text-white/40 hover:text-white border border-white/10 rounded-lg transition-colors">
            Annuler
          </button>
        </div>
      </div>
    </>
  );
}