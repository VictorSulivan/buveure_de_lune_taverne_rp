import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fmtDate } from "@/utils/formatDate";
import { fmtArgent } from "@/utils/fmtArgent";
import { badgeContexte, labelContexte, labelTypeOrg, nomClient } from "@/lib/clients";
import OrganisationEditForm from "@/components/organisations/OrganisationEditForm";

export default async function OrganisationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await prisma.organisation.findUnique({
    where: { id: parseInt(id) },
    include: {
      affiliations: {
        include: { client: true },
        orderBy: { dateDebut: "desc" },
      },
      ventes: {
        where: { statut: "validee" },
        orderBy: { dateVente: "desc" },
        include: {
          client: true,
          employe: true,
          produits: { include: { produit: true } },
        },
      },
    },
  });
  if (!org) notFound();

  const total = org.ventes.reduce((acc, v) => acc + (v.montantTotal ?? 0), 0);
  const membresActuels = org.affiliations.filter((a) => !a.dateFin);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/organisations" className="text-xs text-white/40 hover:text-white mb-2 inline-block">← Organisations</Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium text-white">{org.nom}</h1>
          <span className={`text-xs px-2 py-1 rounded-full border ${badgeContexte(org.type)}`}>{labelTypeOrg(org.type)}</span>
        </div>
        <p className="text-white/40 text-sm mt-1">
          Commandes faites au nom de cette {labelTypeOrg(org.type).toLowerCase()}, quel que soit le rattachement actuel de la personne
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-4">
          <p className="text-xl font-medium text-[#e4b56a]">{fmtArgent(total)}</p>
          <p className="text-white/40 text-xs mt-1">Total facturé</p>
        </div>
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-4">
          <p className="text-xl font-medium text-white">{org.ventes.length}</p>
          <p className="text-white/40 text-xs mt-1">Commandes</p>
        </div>
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-4">
          <p className="text-xl font-medium text-white">{membresActuels.length}</p>
          <p className="text-white/40 text-xs mt-1">Membres actuels</p>
        </div>
      </div>

      <OrganisationEditForm organisation={{ id: org.id, nom: org.nom, type: org.type }} />

      <div className="flex gap-2">
        <Link href={`/dashboard/ventes?org=${org.id}`} className="text-xs text-[#e4b56a] border border-[#e4b56a]/20 rounded-lg px-3 py-2">
          Voir toutes les ventes →
        </Link>
      </div>

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-widest">Personnes liées</p>
        </div>
        <div className="divide-y divide-white/5">
          {org.affiliations.map((a) => (
            <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <Link href={`/dashboard/clients/${a.client.id}`} className="text-white text-sm hover:text-[#e4b56a]">
                {nomClient(a.client)}
              </Link>
              <p className="text-white/40 text-xs">
                {fmtDate(a.dateDebut, { day: "2-digit", month: "short", year: "numeric" })}
                {" → "}
                {a.dateFin ? fmtDate(a.dateFin, { day: "2-digit", month: "short", year: "numeric" }) : "en cours"}
              </p>
            </div>
          ))}
          {org.affiliations.length === 0 && (
            <p className="px-5 py-8 text-center text-white/30 text-sm">Personne n&apos;y a encore été rattaché.</p>
          )}
        </div>
      </div>

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-widest">Commandes au nom de {org.nom}</p>
        </div>
        <div className="divide-y divide-white/5">
          {org.ventes.map((v) => (
            <div key={v.id} className="px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <Link href={`/dashboard/ventes/${v.id}`} className="text-white text-sm hover:text-[#e4b56a]">
                  {nomClient(v.client)}
                </Link>
                <p className="text-white/40 text-xs mt-0.5">
                  {v.produits.map((p) => `${p.produit.nom} ×${p.quantite}`).join(", ")}
                </p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${badgeContexte(v.contexteCommande)}`}>
                  {labelContexte(v.contexteCommande)}
                </span>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white font-medium text-sm">{fmtArgent(v.montantTotal)}</p>
                <p className="text-white/30 text-xs">{fmtDate(v.dateVente, { day: "2-digit", month: "short" })}</p>
              </div>
            </div>
          ))}
          {org.ventes.length === 0 && (
            <p className="px-5 py-8 text-center text-white/30 text-sm">Aucune commande facturée ici.</p>
          )}
        </div>
      </div>
    </div>
  );
}
