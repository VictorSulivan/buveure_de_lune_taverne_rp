import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { fmtDate } from "@/utils/formatDate";
import { fmtArgent } from "@/utils/fmtArgent";
import { badgeContexte, nomClient } from "@/lib/clients";
import { filtreNomClient, labelStatutCommande } from "@/lib/ventesFiltres";
import { FiltresVentes } from "@/components/ventes/FiltresVentes";
import type { ContexteCommande, Prisma } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    client?: string;
    org?: string;
    entreprise?: string;
    nation?: string;
    contexte?: string;
  }>;
}

export default async function VentesPage({ searchParams }: PageProps) {
  const { q, client, org, entreprise, nation, contexte } = await searchParams;
  const recherche = (q ?? "").trim();
  const entrepriseId = entreprise ? parseInt(entreprise) : undefined;
  const nationId = nation ? parseInt(nation) : undefined;
  const orgLegacyId = org ? parseInt(org) : undefined;
  const clientId = client && /^\d+$/.test(client) ? parseInt(client) : undefined;
  const contexteFiltre = contexte === "civil" || contexte === "entreprise" || contexte === "nation"
    ? (contexte as ContexteCommande)
    : undefined;

  const organisations = await prisma.organisation.findMany({ orderBy: { nom: "asc" } });
  const entreprises = organisations.filter((o) => o.type === "entreprise");
  const nations = organisations.filter((o) => o.type === "nation");

  const idsOrg: number[] = [];
  if (entrepriseId) idsOrg.push(entrepriseId);
  if (nationId) idsOrg.push(nationId);
  if (!entrepriseId && !nationId && orgLegacyId) idsOrg.push(orgLegacyId);

  const where: Prisma.VenteWhereInput = {
    ...(clientId ? { clientId } : {}),
    ...(filtreNomClient(recherche) ? { client: filtreNomClient(recherche) } : {}),
    ...(idsOrg.length === 1 ? { organisationId: idsOrg[0] } : {}),
    ...(idsOrg.length > 1 ? { organisationId: { in: idsOrg } } : {}),
    ...(contexteFiltre ? { contexteCommande: contexteFiltre } : {}),
  };

  const ventes = await prisma.vente.findMany({
    where,
    orderBy: { dateVente: "desc" },
    take: 80,
    include: {
      client: true,
      employe: true,
      organisation: true,
      produits: { include: { produit: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-white">Ventes</h1>
          <p className="text-white/40 text-sm mt-1">
            {ventes.length} vente{ventes.length > 1 ? "s" : ""}
            {recherche ? ` · client « ${recherche} »` : ""}
          </p>
        </div>
        <Link
          href="/dashboard/ventes/nouvelle"
          className="flex items-center gap-2 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouvelle vente
        </Link>
      </div>

      <FiltresVentes
        entreprises={entreprises.map((o) => ({ id: o.id, nom: o.nom }))}
        nations={nations.map((o) => ({ id: o.id, nom: o.nom }))}
        valeurs={{
          q: recherche,
          entreprise: entrepriseId ? String(entrepriseId) : "",
          nation: nationId ? String(nationId) : "",
          contexte: contexteFiltre ?? "",
        }}
      />

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">#</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Qui a commandé</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Statut</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Au nom de</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Produits</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Total</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Date</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {ventes.map((v) => (
              <tr key={v.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-5 py-4 text-white/30">#{v.id}</td>
                <td className="px-5 py-4">
                  <Link href={`/dashboard/clients/${v.client.id}`} className="text-white hover:text-[#e4b56a]">
                    {nomClient(v.client)}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${badgeContexte(v.contexteCommande)}`}>
                    {labelStatutCommande(v.contexteCommande)}
                  </span>
                </td>
                <td className="px-5 py-4 text-white/70">
                  {v.organisation ? v.organisation.nom : "Lui-même"}
                </td>
                <td className="px-5 py-4 text-white/60">
                  {v.produits.map((p) => `${p.produit.nom} ×${p.quantite}`).join(", ")}
                </td>
                <td className="px-5 py-4 text-right text-white font-medium">{fmtArgent(v.montantTotal)}</td>
                <td className="px-5 py-4 text-right text-white/40 text-xs">
                  {fmtDate(v.dateVente, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/dashboard/ventes/${v.id}`} className="text-xs text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5">
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ventes.length === 0 && (
          <div className="text-center py-16 text-white/30">
            Aucune vente pour ces filtres.{" "}
            <Link href="/dashboard/ventes/nouvelle" className="text-[#e4b56a] underline">Créer une vente</Link>
          </div>
        )}
      </div>
    </div>
  );
}
