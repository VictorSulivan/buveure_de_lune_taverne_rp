"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEVISE } from "@/lib/branding";

import { GRADES, labelGrade } from "@/lib/grades";

const ROLES_EMPLOYE = [...GRADES];
const ROLES_SITE = ["employe", "co_patron", "patron", "admin"];

export default function NouvelEmploye() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avecCompte, setAvecCompte] = useState(true);
  const [form, setForm] = useState({
    nom: "", prenom: "", role: "employe",
    salaire: "", dateEmbauche: "",
    username: "", password: "", roleSite: "employe",
  });

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/employes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        ...(avecCompte ? {} : { username: undefined, password: undefined }),
      }),
    });
    if (res.ok) {
      router.push("/dashboard/employes");
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
        <h1 className="text-2xl font-medium text-white">Nouvel employé</h1>
        <p className="text-white/40 text-sm mt-1">Ajouter un membre à l&apos;équipe</p>
      </div>

      <div className="space-y-5">
        {/* Infos personnelles */}
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 space-y-4">
          <p className="text-xs text-white/40 uppercase tracking-widest">Informations</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Prénom</label>
              <input value={form.prenom} onChange={(e) => set("prenom", e.target.value)} className="input-dark" placeholder="Trevor" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Nom</label>
              <input value={form.nom} onChange={(e) => set("nom", e.target.value)} className="input-dark" placeholder="Phillips" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Rôle dans l&apos;entreprise</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES_EMPLOYE.map((r) => (
                <button key={r} type="button" onClick={() => set("role", r)}
                  className={`py-2.5 rounded-lg text-sm border transition-colors ${
                    form.role === r
                      ? "bg-[#6b3e22] border-[#a06b3c] text-[#f3d7a5]"
                      : "bg-[#1c140e] border-white/10 text-white/40 hover:text-white hover:border-white/20"
                  }`}>
                  {labelGrade(r)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Salaire hebdomadaire ({DEVISE})</label>
              <input type="number" value={form.salaire} onChange={(e) => set("salaire", e.target.value)} className="input-dark" placeholder="5000" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Date d&apos;embauche</label>
              <input type="date" value={form.dateEmbauche} onChange={(e) => set("dateEmbauche", e.target.value)} className="input-dark" />
            </div>
          </div>
        </div>

        {/* Compte site */}
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/40 uppercase tracking-widest">Compte site</p>
            <button
              onClick={() => setAvecCompte(!avecCompte)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                avecCompte
                  ? "bg-[#6b3e22] border-[#a06b3c] text-[#f3d7a5]"
                  : "bg-white/5 border-white/10 text-white/40"
              }`}
            >
              {avecCompte ? "Activé" : "Désactivé"}
            </button>
          </div>

          {avecCompte && (
            <>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Nom d&apos;utilisateur</label>
                <input value={form.username} onChange={(e) => set("username", e.target.value)} className="input-dark" placeholder="trevor_p" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Mot de passe</label>
                <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className="input-dark" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Rôle sur le site</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES_SITE.map((r) => (
                    <button key={r} type="button" onClick={() => set("roleSite", r)}
                      className={`py-2 rounded-lg text-sm border transition-colors ${
                        form.roleSite === r
                          ? "bg-[#6b3e22] border-[#a06b3c] text-[#f3d7a5]"
                          : "bg-[#1c140e] border-white/10 text-white/40 hover:text-white hover:border-white/20"
                      }`}>
                      {labelGrade(r)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Création..." : "Créer l'employé"}
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
