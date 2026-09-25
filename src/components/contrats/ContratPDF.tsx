"use client";

import { useEffect, useRef, useState } from "react";
import { fmtDate } from "@/utils/formatDate";
import { LIEU } from "@/lib/branding";
import { fmtArgent } from "@/utils/fmtArgent";
import { articlesProposition, chiffreRomain, parseArticles, type ArticleContrat } from "@/lib/contrats";
import { labelGrade } from "@/lib/grades";
import { telechargerParchemin } from "@/lib/telechargerParchemin";

type Props = {
  employe: {
    nom: string;
    prenom: string;
    role: string;
    salaire: number | null;
    dateEmbauche: string | null;
  };
  contrat: {
    typeContrat: string;
    dateDebut: string;
    dateFin: string | null;
    salaire: number | null;
    pourcentagePrime: number | null;
    commentaire: string | null;
    articles?: unknown;
    signatairePatronPrenom?: string | null;
    signatairePatronNom?: string | null;
    signataireRole?: string | null;
  };
  entreprise: string;
  autoDownload?: boolean;
};

function articlesParDefaut(
  employe: Props["employe"],
  contrat: Props["contrat"],
  entreprise: string,
): ArticleContrat[] {
  const proposes = articlesProposition({
    entreprise,
    employePrenom: employe.prenom,
    employeNom: employe.nom,
    grade: contrat.typeContrat,
  });
  if (contrat.salaire) {
    proposes.push({
      titre: "De la bourse officielle",
      contenu: `Pour que personne ne jure n'avoir rien vu, ${employe.prenom} ${employe.nom} percevra ${fmtArgent(contrat.salaire)} chaque semaine${
        contrat.pourcentagePrime ? `, plus une prime de ${contrat.pourcentagePrime} % quand la maison le jugera bon` : ""
      }.`,
    });
  }
  if (contrat.commentaire) {
    proposes.push({ titre: "Dispositions particulières", contenu: contrat.commentaire });
  }
  return proposes;
}

export default function ContratPDF({ employe, contrat, entreprise, autoDownload = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [etat, setEtat] = useState<"idle" | "loading" | "ok" | "erreur">("idle");
  const articles = parseArticles(contrat.articles);
  const clauses = articles.length > 0
    ? articles
    : articlesParDefaut(employe, contrat, entreprise);

  const nomRepresentant = [contrat.signatairePatronPrenom, contrat.signatairePatronNom]
    .filter(Boolean)
    .join(" ");
  const titreRepresentant = labelGrade(contrat.signataireRole ?? "patron");
  const nomEmploye = `${employe.prenom} ${employe.nom}`;

  async function handleDownload() {
    if (!ref.current || etat === "loading") return;
    setEtat("loading");
    try {
      await telechargerParchemin(
        ref.current,
        `pacte_${employe.nom}_${employe.prenom}.png`,
      );
      setEtat("ok");
      setTimeout(() => setEtat("idle"), 2000);
    } catch (error) {
      console.error(error);
      setEtat("erreur");
    }
  }

  useEffect(() => {
    if (!autoDownload) return;
    const t = window.setTimeout(() => {
      void handleDownload();
    }, 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={handleDownload}
          disabled={etat === "loading"}
          className="flex items-center gap-2 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {etat === "loading" ? "Préparation du parchemin..." : etat === "ok" ? "✓ Parchemin téléchargé" : "↓ Télécharger le parchemin"}
        </button>
        {etat === "erreur" && (
          <p className="text-sm text-red-300">Le parchemin n&apos;a pas pu être généré. Réessaie dans un instant.</p>
        )}
      </div>

      <div className="rounded-sm overflow-hidden shadow-2xl">
        <div ref={ref} className="parchemin px-10 py-12">
          <div className="text-center mb-10 pb-6 border-b-2 border-[#8a5a28]/40">
            <div className="parchemin-titre text-2xl tracking-[0.28em] uppercase text-[#4a2c12]">
              {entreprise}
            </div>
            <div className="mt-1 text-sm italic text-[#6b4420]">{LIEU}</div>
            <div className="parchemin-titre mt-6 text-xl tracking-widest uppercase text-[#6b3e22]">
              Pacte de service — {contrat.typeContrat}
            </div>
          </div>

          <div className="mb-8">
            <div className="parchemin-titre text-[11px] uppercase tracking-[0.2em] text-[#8a5a28] mb-3">
              Entre les parties
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-[#8a5a28]/35 bg-[#f7e7c4]/50 px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest text-[#8a5a28] mb-1">L&apos;auberge</div>
                <div className="parchemin-titre font-semibold">{entreprise}</div>
                <div className="text-sm text-[#5a3a1c] mt-1">
                  Représentée par {nomRepresentant || "—"}, {titreRepresentant}
                </div>
              </div>
              <div className="border border-[#8a5a28]/35 bg-[#f7e7c4]/50 px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest text-[#8a5a28] mb-1">L&apos;employé</div>
                <div className="parchemin-titre font-semibold">{nomEmploye}</div>
                <div className="text-sm text-[#5a3a1c] mt-1">
                  Grade : {contrat.typeContrat}
                </div>
              </div>
            </div>
          </div>

          {clauses.map((article, i) => (
            <div key={i} className="mb-6">
              <div className="parchemin-titre text-sm uppercase tracking-wide text-[#6b3e22] mb-2">
                Article {chiffreRomain(i + 1)} — {article.titre}
              </div>
              <p className="text-[15px] leading-8 text-[#3b2414] whitespace-pre-wrap">
                {article.contenu}
              </p>
            </div>
          ))}

          <div className="mt-12 pt-6 border-t border-[#8a5a28]/35">
            <div className="text-center text-sm italic text-[#6b4420] mb-10">
              Fait à {LIEU}, le {fmtDate(new Date(), { day: "2-digit", month: "long", year: "numeric" })}
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div className="text-center">
                <div className="text-[11px] uppercase tracking-widest text-[#8a5a28] mb-3">
                  Pour l&apos;auberge — {titreRepresentant}
                </div>
                <div className="parchemin-signature text-[34px] leading-none text-[#3b2414] min-h-[48px]">
                  {nomRepresentant || "—"}
                </div>
                <div className="mt-3 border-t border-[#5a3a1c]/40 pt-2 text-xs text-[#5a3a1c]">
                  {nomRepresentant || entreprise}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[11px] uppercase tracking-widest text-[#8a5a28] mb-3">
                  Signature de l&apos;employé
                </div>
                <div className="parchemin-signature text-[34px] leading-none text-[#3b2414] min-h-[48px]">
                  {nomEmploye}
                </div>
                <div className="mt-3 border-t border-[#5a3a1c]/40 pt-2 text-xs text-[#5a3a1c]">
                  {nomEmploye}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
