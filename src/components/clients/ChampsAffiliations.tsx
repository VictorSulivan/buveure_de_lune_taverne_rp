"use client";

import { useEffect, useMemo, useState } from "react";
import type { OrganisationLite } from "@/types/client";

const NOUVEAU = "__new__";

export function ChampsAffiliations({
  entrepriseNom,
  nationNom,
  onChange,
}: {
  entrepriseNom: string;
  nationNom: string;
  onChange: (key: "entrepriseNom" | "nationNom", value: string) => void;
}) {
  const [orgs, setOrgs] = useState<OrganisationLite[]>([]);
  const [nouveau, setNouveau] = useState<{ type: "entreprise" | "nation"; nom: string } | null>(null);
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch("/api/organisations")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: OrganisationLite[]) => setOrgs(Array.isArray(data) ? data : []))
      .catch(() => setOrgs([]));
  }, []);

  const entreprises = useMemo(() => orgs.filter((o) => o.type === "entreprise"), [orgs]);
  const nations = useMemo(() => orgs.filter((o) => o.type === "nation"), [orgs]);

  function handleSelect(type: "entreprise" | "nation", value: string) {
    if (value === NOUVEAU) {
      setNouveau({ type, nom: "" });
      setErreur("");
      return;
    }
    onChange(type === "entreprise" ? "entrepriseNom" : "nationNom", value);
  }

  async function creerOrganisation() {
    if (!nouveau) return;
    const nom = nouveau.nom.trim();
    if (!nom) return setErreur("Le nom est requis");
    setAjoutEnCours(true);
    setErreur("");
    const res = await fetch("/api/organisations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, type: nouveau.type }),
    });
    const data = await res.json().catch(() => ({}));
    setAjoutEnCours(false);
    if (!res.ok) {
      setErreur(data.error ?? "Erreur");
      return;
    }
    setOrgs((prev) => (prev.some((o) => o.id === data.id) ? prev : [...prev, data]));
    onChange(nouveau.type === "entreprise" ? "entrepriseNom" : "nationNom", data.nom);
    setNouveau(null);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectOrganisation
          label="Entreprise actuelle"
          hint="Laisser vide si aucune. Un changement clôt l'ancienne."
          value={entrepriseNom}
          options={entreprises}
          extraValue={entrepriseNom}
          onChange={(v) => handleSelect("entreprise", v)}
        />
        <SelectOrganisation
          label="Nation actuelle"
          hint="Indépendant de l'entreprise."
          value={nationNom}
          options={nations}
          extraValue={nationNom}
          onChange={(v) => handleSelect("nation", v)}
        />
      </div>

      {nouveau && (
        <div className="bg-[#1c140e] border border-white/10 rounded-xl p-3 space-y-2">
          <p className="text-xs text-white/40">
            Nouvelle {nouveau.type === "nation" ? "nation" : "entreprise"}
          </p>
          <div className="flex gap-2">
            <input
              autoFocus
              value={nouveau.nom}
              onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), creerOrganisation())}
              className="input-dark"
              placeholder={nouveau.type === "nation" ? "Garde royale" : "Compagnie du Nord"}
            />
            <button
              type="button"
              onClick={creerOrganisation}
              disabled={ajoutEnCours}
              className="shrink-0 px-3 py-2 rounded-lg text-sm bg-[#6b3e22] border border-[#a06b3c] text-[#f3d7a5] disabled:opacity-50"
            >
              {ajoutEnCours ? "..." : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={() => { setNouveau(null); setErreur(""); }}
              className="shrink-0 px-3 py-2 rounded-lg text-sm text-white/40 border border-white/10"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
      {erreur && <p className="text-red-400 text-sm">{erreur}</p>}
    </div>
  );
}

function SelectOrganisation({
  label,
  hint,
  value,
  options,
  extraValue,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  options: OrganisationLite[];
  extraValue: string;
  onChange: (value: string) => void;
}) {
  const extra = extraValue && !options.some((o) => o.nom === extraValue);

  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-dark">
        <option value="">Aucune</option>
        {options.map((o) => (
          <option key={o.id} value={o.nom}>{o.nom}</option>
        ))}
        {extra && <option value={extraValue}>{extraValue}</option>}
        <option value={NOUVEAU}>+ En enregistrer une nouvelle…</option>
      </select>
      <p className="text-[11px] text-white/25 mt-1">{hint}</p>
    </div>
  );
}
