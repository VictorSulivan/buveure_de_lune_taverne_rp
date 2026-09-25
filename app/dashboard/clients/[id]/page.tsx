import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ClientEditForm from "@/components/clients/ClientEditForm";
import { fmtDate } from "@/utils/formatDate";
import { fmtArgent } from "@/utils/fmtArgent";
import { affiliationActive, badgeContexte, labelContexte, labelTypeOrg, nomClient } from "@/lib/clients";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      affiliations: {
        include: { organisation: true },
        orderBy: { dateDebut: "desc" },
      },
      ventes: {
        orderBy: { dateVente: "desc" },
        take: 30,
        include: { employe: true, organisation: true, produits: { include: { produit: true } } },
      },
    },
  });

  if (!client) notFound();

  const entreprise = affiliationActive(client.affiliations, "entreprise");
  const nation = affiliationActive(client.affiliations, "nation");

  const totalVentes = await prisma.vente.aggregate({
    where: { clientId: client.id, statut: "validee" },
    _sum: { montantTotal: true },
    _count: true,
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 rounded-full bg-[#3d2818] border border-white/10 flex items-center justify-center text-white/50 text-lg font-medium uppercase">
          {client.prenom?.[0] ?? client.nom[0]}{client.nom[0]}
        </div>
        <div>
          <h1 className="text-2xl font-medium text-white">{nomClient(client)}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {entreprise && (
              <Link href={`/dashboard/organisations/${entreprise.organisation.id}`} className={`text-xs px-2 py-1 rounded-full border ${badgeContexte("entreprise")}`}>
                {entreprise.organisation.nom}
              </Link>
            )}
            {nation && (
              <Link href={`/dashboard/organisations/${nation.organisation.id}`} className={`text-xs px-2 py-1 rounded-full border ${badgeContexte("nation")}`}>
                {nation.organisation.nom}
              </Link>
            )}
            {!entreprise && !nation && (
              <span className={`text-xs px-2 py-1 rounded-full border ${badgeContexte("civil")}`}>Sans rattachement actuel</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/dashboard/ventes?client=${client.id}`} className="text-xs text-[#e4b56a] border border-[#e4b56a]/20 rounded-lg px-3 py-2">
          Toutes ses ventes →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Commandes", value: totalVentes._count.toString() },
          { label: "Total dépensé", value: fmtArgent(totalVentes._sum.montantTotal ?? 0) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#2b1d14] border border-white/10 rounded-xl p-4">
            <p className="text-xl font-medium text-white">{value}</p>
            <p className="text-white/40 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <ClientEditForm client={{
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        entrepriseNom: entreprise?.organisation.nom ?? "",
        nationNom: nation?.organisation.nom ?? "",
      }} />

      {client.affiliations.length > 0 && (
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-xs text-white/40 uppercase tracking-widest">Historique des rattachements</p>
          </div>
          <div className="divide-y divide-white/5">
            {client.affiliations.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <Link href={`/dashboard/organisations/${a.organisation.id}`} className="text-white text-sm hover:text-[#e4b56a]">
                    {a.organisation.nom}
                  </Link>
                  <p className="text-white/30 text-xs">{labelTypeOrg(a.organisation.type)}</p>
                </div>
                <p className="text-white/40 text-xs text-right">
                  {fmtDate(a.dateDebut, { day: "2-digit", month: "short", year: "numeric" })}
                  {" → "}
                  {a.dateFin ? fmtDate(a.dateFin, { day: "2-digit", month: "short", year: "numeric" }) : "en cours"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {client.ventes.length > 0 && (
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-xs text-white/40 uppercase tracking-widest">Commandes</p>
          </div>
          <div className="divide-y divide-white/5">
            {client.ventes.map((v) => (
              <div key={v.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <Link href={`/dashboard/ventes/${v.id}`} className="text-white text-sm hover:text-[#e4b56a]">
                    {v.produits.map((p) => `${p.produit.nom} ×${p.quantite}`).join(", ")}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeContexte(v.contexteCommande)}`}>
                      {labelContexte(v.contexteCommande)}
                      {v.organisation ? ` · ${v.organisation.nom}` : ""}
                    </span>
                    <span className="text-white/30 text-xs">par {v.employe.prenom} {v.employe.nom}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-medium text-sm">{fmtArgent(v.montantTotal)}</p>
                  <p className="text-white/30 text-xs">
                    {fmtDate(v.dateVente, { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
