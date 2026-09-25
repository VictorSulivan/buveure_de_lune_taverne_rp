import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { badgeContexte, labelTypeOrg } from "@/lib/clients";
import { fmtArgent } from "@/utils/fmtArgent";
import NouvelleOrganisationForm from "@/components/organisations/NouvelleOrganisationForm";

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function OrganisationsPage({ searchParams }: PageProps) {
  const { type } = await searchParams;
  const typeFiltre = type === "entreprise" || type === "nation" ? type : undefined;

  const organisations = await prisma.organisation.findMany({
    where: typeFiltre ? { type: typeFiltre } : {},
    orderBy: { nom: "asc" },
    include: {
      _count: { select: { affiliations: true, ventes: true } },
    },
  });

  const ventesParOrg = await prisma.vente.groupBy({
    by: ["organisationId"],
    where: { statut: "validee", organisationId: { not: null } },
    _sum: { montantTotal: true },
  });
  const totaux = new Map(ventesParOrg.map((v) => [v.organisationId, v._sum.montantTotal ?? 0]));

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/clients" className="text-xs text-white/40 hover:text-white mb-2 inline-block">← Clients</Link>
        <h1 className="text-2xl font-medium text-white">Entreprises & nations</h1>
        <p className="text-white/40 text-sm mt-1">Enregistre-les ici, puis choisis-les sur une fiche client</p>
      </div>

      <NouvelleOrganisationForm />

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: "", label: "Toutes" },
          { value: "entreprise", label: "Entreprises" },
          { value: "nation", label: "Nations" },
        ].map((f) => {
          const actif = (f.value === "" && !typeFiltre) || f.value === typeFiltre;
          return (
            <Link
              key={f.value || "all"}
              href={f.value ? `/dashboard/organisations?type=${f.value}` : "/dashboard/organisations"}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                actif ? "bg-[#e4b56a]/15 border-[#e4b56a]/40 text-[#e4b56a]" : "bg-white/5 border-white/10 text-white/40"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Nom</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Type</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Personnes</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Commandes</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Facturé</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {organisations.map((o) => (
              <tr key={o.id} className="border-b border-white/5">
                <td className="px-5 py-4">
                  <Link href={`/dashboard/organisations/${o.id}`} className="text-white hover:text-[#e4b56a] font-medium">
                    {o.nom}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${badgeContexte(o.type)}`}>{labelTypeOrg(o.type)}</span>
                </td>
                <td className="px-5 py-4 text-right text-white/70">{o._count.affiliations}</td>
                <td className="px-5 py-4 text-right text-white/70">{o._count.ventes}</td>
                <td className="px-5 py-4 text-right text-[#e4b56a]">{fmtArgent(totaux.get(o.id) ?? 0)}</td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/dashboard/organisations/${o.id}`} className="text-xs text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5">
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {organisations.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">Aucune organisation. Enregistre-en une ci-dessus.</div>
        )}
      </div>
    </div>
  );
}
