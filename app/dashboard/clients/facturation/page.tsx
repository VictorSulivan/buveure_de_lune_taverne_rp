import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { debutSemaine, finSemaine, labelSemaine } from "@/utils/semaine";
import { fmtDate } from "@/utils/formatDate";
import { fmtArgent } from "@/utils/fmtArgent";
import { badgeContexte, labelContexte, nomClient } from "@/lib/clients";
import { FiltreFacturation } from "@/components/clients/FiltreFacturation";
import { BoutonImprimer } from "@/components/clients/BoutonImprimer";
import type { TypeOrganisation } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ semaine?: string; type?: string }>;
}

function isoLundi(date = new Date()): string {
  const d = debutSemaine(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function FacturationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const semaineIso = params.semaine ?? isoLundi();
  const typeFiltre = params.type === "entreprise" || params.type === "nation" ? params.type : "all";

  const lundi = debutSemaine(new Date(`${semaineIso}T00:00:00`));
  const dimanche = finSemaine(lundi);
  const types: TypeOrganisation[] = typeFiltre === "all" ? ["entreprise", "nation"] : [typeFiltre];

  const ventes = await prisma.vente.findMany({
    where: {
      statut: "validee",
      dateVente: { gte: lundi, lte: dimanche },
      contexteCommande: { in: types },
      organisationId: { not: null },
    },
    orderBy: { dateVente: "asc" },
    include: {
      client: true,
      employe: true,
      organisation: true,
      produits: { include: { produit: true } },
    },
  });

  type ProduitAgg = { nom: string; quantite: number; ca: number };
  type Groupe = {
    cle: string;
    nom: string;
    type: string;
    total: number;
    ventes: typeof ventes;
    produits: ProduitAgg[];
  };

  const groupesMap = new Map<string, Groupe>();
  for (const v of ventes) {
    if (!v.organisation) continue;
    const cle = `org-${v.organisation.id}`;
    if (!groupesMap.has(cle)) {
      groupesMap.set(cle, {
        cle,
        nom: v.organisation.nom,
        type: v.organisation.type,
        total: 0,
        ventes: [],
        produits: [],
      });
    }
    const g = groupesMap.get(cle)!;
    g.total += v.montantTotal ?? 0;
    g.ventes.push(v);
  }

  for (const g of groupesMap.values()) {
    const pMap = new Map<string, ProduitAgg>();
    for (const v of g.ventes) {
      for (const ligne of v.produits) {
        const nom = ligne.produit.nom;
        if (!pMap.has(nom)) pMap.set(nom, { nom, quantite: 0, ca: 0 });
        const p = pMap.get(nom)!;
        p.quantite += ligne.quantite;
        p.ca += ligne.totalLigne;
      }
    }
    g.produits = [...pMap.values()].sort((a, b) => b.ca - a.ca);
  }

  const groupes = [...groupesMap.values()].sort((a, b) => b.total - a.total);
  const totalGeneral = groupes.reduce((acc, g) => acc + g.total, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Link href="/dashboard/clients" className="text-xs text-white/40 hover:text-white transition-colors mb-2 inline-block print:hidden">
            ← Clients
          </Link>
          <h1 className="text-2xl font-medium text-white">Facturation de la semaine</h1>
          <p className="text-white/40 text-sm mt-1">
            Commandes faites pour une entreprise ou une nation — {labelSemaine(lundi)}
          </p>
        </div>
        <BoutonImprimer />
      </div>

      <FiltreFacturation semaineIso={isoLundi(lundi)} type={typeFiltre} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-2">À facturer</p>
          <p className="text-xl font-semibold text-[#e4b56a]">{fmtArgent(totalGeneral)}</p>
        </div>
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-2">Organisations</p>
          <p className="text-xl font-semibold text-white">{groupes.length}</p>
        </div>
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-2">Commandes</p>
          <p className="text-xl font-semibold text-white">{ventes.length}</p>
        </div>
      </div>

      {groupes.length === 0 ? (
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl px-5 py-16 text-center text-white/30 text-sm">
          Aucune commande entreprise/nation validée sur cette semaine.
        </div>
      ) : (
        <div className="space-y-5">
          {groupes.map((g) => (
            <div key={g.cle} className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-medium">{g.nom}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full border ${badgeContexte(g.type)}`}>
                    {labelContexte(g.type)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[#e4b56a] font-semibold">{fmtArgent(g.total)}</p>
                  <p className="text-white/30 text-xs">{g.ventes.length} commande{g.ventes.length > 1 ? "s" : ""}</p>
                </div>
              </div>

              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-3">À facturer</p>
                <div className="space-y-2">
                  {g.produits.map((p) => (
                    <div key={p.nom} className="flex items-center justify-between text-sm">
                      <span className="text-white/80">{p.nom} <span className="text-white/35">×{p.quantite}</span></span>
                      <span className="text-white/70 tabular-nums">{fmtArgent(p.ca)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {g.ventes.map((v) => (
                  <div key={v.id} className="px-5 py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white text-sm">{nomClient(v.client)}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {v.produits.map((p) => `${p.produit.nom} ×${p.quantite}`).join(", ")}
                      </p>
                      <p className="text-white/25 text-xs mt-0.5">
                        {fmtDate(v.dateVente, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {" · "}{v.employe.prenom} {v.employe.nom}
                      </p>
                    </div>
                    <p className="text-white text-sm tabular-nums shrink-0">{fmtArgent(v.montantTotal)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
