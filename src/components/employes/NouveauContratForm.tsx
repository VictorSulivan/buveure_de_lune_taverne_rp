"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEVISE, NOM_ENTREPRISE } from "@/lib/branding";
import { ArticlesContratEditor } from "@/components/employes/ArticlesContratEditor";
import { articlesProposition, type ArticleContrat } from "@/lib/contrats";
import { TYPES_CONTRAT, labelGrade, typeContratDepuisRole } from "@/lib/grades";

export type RepresentantContrat = {
  id: number;
  prenom: string;
  nom: string;
  role: string;
};

export default function NouveauContratForm({
  employe,
  representants,
}: {
  employe: { id: number; prenom: string; nom: string; role: string };
  representants: RepresentantContrat[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const premier = representants[0] ?? null;
  const [form, setForm] = useState({
    typeContrat: typeContratDepuisRole(employe.role),
    dateDebut: new Date().toISOString().split("T")[0],
    dateFin: "",
    salaire: "",
    pourcentagePrime: "",
    commentaire: "",
    signataireId: premier?.id ?? 0,
    signatairePatronPrenom: premier?.prenom ?? "",
    signatairePatronNom: premier?.nom ?? "",
    signataireRole: premier?.role ?? "patron",
  });
  const [articles, setArticles] = useState<ArticleContrat[]>(
    articlesProposition({
      entreprise: NOM_ENTREPRISE,
      employePrenom: employe.prenom,
      employeNom: employe.nom,
      grade: typeContratDepuisRole(employe.role),
    }),
  );

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function choisirGrade(grade: string) {
    setForm((f) => ({ ...f, typeContrat: grade }));
    setArticles((actuels) =>
      actuels.length === 0
        ? articlesProposition({
            entreprise: NOM_ENTREPRISE,
            employePrenom: employe.prenom,
            employeNom: employe.nom,
            grade,
          })
        : actuels,
    );
  }

  function choisirRepresentant(r: RepresentantContrat) {
    setForm((f) => ({
      ...f,
      signataireId: r.id,
      signatairePatronPrenom: r.prenom,
      signatairePatronNom: r.nom,
      signataireRole: r.role,
    }));
  }

  function reproposerClauses() {
    setArticles(articlesProposition({
      entreprise: NOM_ENTREPRISE,
      employePrenom: employe.prenom,
      employeNom: employe.nom,
      grade: form.typeContrat,
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/contrats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, employeId: employe.id, articles }),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setForm((f) => ({ ...f, dateFin: "", commentaire: "" }));
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur");
    }
    setLoading(false);
  }

  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-xs text-white/40 uppercase tracking-widest">Nouveau pacte</p>

      <div className="bg-[#1c140e]/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70">
        Employé lié : <span className="text-[#f3d7a5]">{employe.prenom} {employe.nom}</span>
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Grade</label>
        <div className="grid grid-cols-4 gap-2">
          {TYPES_CONTRAT.map((t) => (
            <button key={t} type="button" onClick={() => choisirGrade(t)}
              className={`py-2 rounded-lg text-sm border transition-colors ${
                form.typeContrat === t
                  ? "bg-[#6b3e22] border-[#a06b3c] text-[#f3d7a5]"
                  : "bg-[#1c140e] border-white/10 text-white/40 hover:text-white hover:border-white/20"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Date de début</label>
          <input type="date" value={form.dateDebut}
            onChange={(e) => set("dateDebut", e.target.value)}
            className="input-dark" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Date de fin (optionnel)</label>
          <input type="date" value={form.dateFin}
            onChange={(e) => set("dateFin", e.target.value)}
            className="input-dark" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Salaire hebdomadaire ({DEVISE})</label>
          <input type="number" value={form.salaire}
            onChange={(e) => set("salaire", e.target.value)}
            className="input-dark" placeholder="5000" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Prime (%)</label>
          <input type="number" value={form.pourcentagePrime}
            onChange={(e) => set("pourcentagePrime", e.target.value)}
            className="input-dark" placeholder="10" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-white/40">Clauses proposées — tu peux tout réécrire</span>
          <button type="button" onClick={reproposerClauses}
            className="text-xs text-[#e4b56a] hover:text-[#f0c888]">
            Remettre la proposition
          </button>
        </div>
        <ArticlesContratEditor articles={articles} onChange={setArticles} />
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Note interne (optionnel)</label>
        <input value={form.commentaire}
          onChange={(e) => set("commentaire", e.target.value)}
          className="input-dark" placeholder="Promotion, renouvellement..." />
      </div>

      <div>
        <p className="text-xs text-white/40 mb-2">Pour l&apos;auberge — patron ou co-patron</p>
        {representants.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {representants.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => choisirRepresentant(r)}
                className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                  form.signataireId === r.id
                    ? "bg-[#6b3e22] border-[#a06b3c] text-[#f3d7a5]"
                    : "bg-[#1c140e] border-white/10 text-white/50 hover:text-white hover:border-white/20"
                }`}
              >
                <span className="block">{r.prenom} {r.nom}</span>
                <span className="text-xs opacity-70">{labelGrade(r.role)}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-red-300/80">Aucun patron ou co-patron actif pour signer.</p>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button onClick={handleSubmit} disabled={loading || representants.length === 0}
        className={`w-full text-sm font-medium py-2.5 rounded-lg border transition-colors ${
          success
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-[#6b3e22] hover:bg-[#8a532c] border-[#a06b3c] text-[#f3d7a5] disabled:opacity-50"
        }`}>
        {success ? "✓ Pacte scellé" : loading ? "Rédaction..." : "Sceller le pacte"}
      </button>
    </div>
  );
}
