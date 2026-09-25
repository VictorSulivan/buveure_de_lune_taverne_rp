import { ClassementEmployes } from "@/components/banque/ClassementEmployes";
import { ClassementProduits } from "@/components/banque/ClassementProduits";
import { FiltrePeriode } from "@/components/banque/FiltrePeriode";
import { GraphiqueMensuel } from "@/components/banque/GraphiqueMensuel";
import { KpiGrid } from "@/components/banque/KpiGrid";
import { RepartitionTypes } from "@/components/banque/RepartitionTypes";
import { ResumeTextuel } from "@/components/banque/ResumeTextuel";
import { prisma }             from "@/lib/db/prisma";
import Link                   from "next/link";

import {
  getDateRange,
  periodeLabel,
  buildMoisStats,
  grainPourPeriode,
} from "src/utils/buildMoisStats";

import type { Periode, KpiData, EmployeStat, ProduitStat, TypeStat } from "types/analyse";

const TYPES_POSITIFS = ["vente", "versement"];
const TYPES_NEGATIFS = ["retrait", "salaire", "achat", "prime"];

interface PageProps {
  searchParams: Promise<{
    periode?: string;
    debut?: string;
    fin?: string;
  }>;
}

export default async function AnalyseBanquePage({ searchParams }: PageProps) {
  const params  = await searchParams;
  const periode = (params.periode ?? "7j") as Periode;
  const debut   = params.debut;
  const fin     = params.fin;

  const { from, to } = getDateRange(periode, debut, fin);

  const dateFilter =
    from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to   ? { lte: to  } : {}),
          },
        }
      : {};

  const venteDateFilter =
    from || to
      ? {
          dateVente: {
            ...(from ? { gte: from } : {}),
            ...(to   ? { lte: to  } : {}),
          },
        }
      : {};

  const [transactions, ventes] = await Promise.all([
    prisma.transactionBanque.findMany({
      where:   dateFilter,
      include: { employe: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.vente.findMany({
      where: {
        statut: "validee",
        ...venteDateFilter,
      },
      include: {
        employe: true,
        produits: { include: { produit: true } },
      },
    }),
  ]);

  let gains = 0, depenses = 0, taxes = 0;

  for (const t of transactions) {
    const m = t.montant ?? 0;
    if (TYPES_POSITIFS.includes(t.typeTransaction ?? ""))      gains    += m;
    else if (t.typeTransaction === "taxe")                     taxes    += m;
    else if (TYPES_NEGATIFS.includes(t.typeTransaction ?? "")) depenses += m;
  }

  const kpi: KpiData = {
    gains,
    depenses,
    taxes,
    net: gains - depenses - taxes,
    nbTransactions: transactions.length,
  };

  const typeMap = new Map<string, number>();
  for (const t of transactions) {
    const k = t.typeTransaction ?? "inconnu";
    typeMap.set(k, (typeMap.get(k) ?? 0) + (t.montant ?? 0));
  }

  const typesGains: TypeStat[] = [...typeMap.entries()]
    .filter(([k]) => TYPES_POSITIFS.includes(k))
    .map(([type, montant]) => ({ type, montant }));

  const typesCharges: TypeStat[] = [...typeMap.entries()]
    .filter(([k]) => !TYPES_POSITIFS.includes(k))
    .map(([type, montant]) => ({ type, montant }));

  const employeMap = new Map<number, EmployeStat>();
  const sansEmploye = { gains: 0, depenses: 0, taxes: 0 };

  for (const t of transactions) {
    const m = t.montant ?? 0;

    if (!t.employeId || !t.employe) {
      if (TYPES_POSITIFS.includes(t.typeTransaction ?? ""))      sansEmploye.gains    += m;
      else if (t.typeTransaction === "taxe")                     sansEmploye.taxes    += m;
      else if (TYPES_NEGATIFS.includes(t.typeTransaction ?? "")) sansEmploye.depenses += m;
      continue;
    }

    const id = t.employeId;
    if (!employeMap.has(id)) {
      employeMap.set(id, {
        id,
        nom: `${t.employe.prenom} ${t.employe.nom}`,
        gains: 0,
        depenses: 0,
        taxes: 0,
        nbTransactions: 0,
        caVentes: 0,
        nbVentes: 0,
      });
    }

    const s = employeMap.get(id)!;
    s.nbTransactions++;
    if (TYPES_POSITIFS.includes(t.typeTransaction ?? ""))      s.gains    += m;
    else if (t.typeTransaction === "taxe")                     s.taxes    += m;
    else if (TYPES_NEGATIFS.includes(t.typeTransaction ?? "")) s.depenses += m;
  }

  const produitMap = new Map<number, ProduitStat>();
  for (const v of ventes) {
    if (v.employe) {
      const id = v.employeId;
      if (!employeMap.has(id)) {
        employeMap.set(id, {
          id,
          nom: `${v.employe.prenom} ${v.employe.nom}`,
          gains: 0,
          depenses: 0,
          taxes: 0,
          nbTransactions: 0,
          caVentes: 0,
          nbVentes: 0,
        });
      }
      const s = employeMap.get(id)!;
      s.caVentes += v.montantTotal ?? 0;
      s.nbVentes += 1;
    }

    for (const ligne of v.produits) {
      const pid = ligne.produitId;
      if (!produitMap.has(pid)) {
        produitMap.set(pid, {
          id: pid,
          nom: ligne.produit.nom,
          quantite: 0,
          ca: 0,
        });
      }
      const p = produitMap.get(pid)!;
      p.quantite += ligne.quantite;
      p.ca += ligne.totalLigne;
    }
  }

  const produits: ProduitStat[] = [...produitMap.values()].sort((a, b) => b.ca - a.ca);

  const employes: EmployeStat[] = [...employeMap.values()].sort(
    (a, b) => b.caVentes - a.caVentes || (b.gains - b.depenses - b.taxes) - (a.gains - a.depenses - a.taxes)
  );

  const fromGraph = from ?? (transactions[0] ? new Date(transactions[0].createdAt) : undefined);
  const toGraph = to ?? new Date();
  const grain = grainPourPeriode(periode, fromGraph, toGraph);
  const moisStats = buildMoisStats(
    transactions.map((t) => ({
      typeTransaction: t.typeTransaction,
      montant:        t.montant,
      createdAt:      t.createdAt,
    })),
    { from: fromGraph, to: toGraph, grain }
  );

  return (
    <div className="space-y-5">

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Link
            href="/dashboard/banque"
            className="text-xs text-white/40 hover:text-white transition-colors mb-2 inline-block"
          >
            ← Retour aux finances
          </Link>
          <h1 className="text-2xl font-medium text-white">Analyse financière</h1>
          <p className="text-sm text-white/30 mt-0.5">
            {periodeLabel(periode, debut, fin)}
          </p>
        </div>
        <Link
          href="/dashboard/banque/historique"
          className="text-xs text-white/40 hover:text-white border border-white/10 rounded-lg px-3 py-2 transition-colors self-start sm:self-auto"
        >
          Historique complet →
        </Link>
      </div>

      <FiltrePeriode />

      <KpiGrid kpi={kpi} />

      <GraphiqueMensuel mois={moisStats} grain={grain} />

      <RepartitionTypes
        gains={typesGains}
        charges={typesCharges}
        totalGains={gains}
        totalCharges={depenses + taxes}
      />

      <ClassementProduits produits={produits} />

      <ClassementEmployes employes={employes} sansEmploye={sansEmploye} />

      <ResumeTextuel
        kpi={kpi}
        topEmploye={employes[0] ?? null}
        topProduit={produits[0] ?? null}
        periode={periode}
        debut={debut}
        fin={fin}
      />

    </div>
  );
}
