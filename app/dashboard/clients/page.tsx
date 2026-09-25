import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { affiliationActive, badgeContexte, labelTypeOrg, nomClient } from "@/lib/clients";

interface PageProps {
  searchParams: Promise<{ org?: string; type?: string; q?: string }>;
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const { org, type, q } = await searchParams;
  const orgId = org ? parseInt(org) : undefined;
  const typeOrg = type === "entreprise" || type === "nation" ? type : undefined;

  const organisations = await prisma.organisation.findMany({ orderBy: { nom: "asc" } });

  const clients = await prisma.client.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { nom: { contains: q, mode: "insensitive" } },
              { prenom: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(orgId || typeOrg
        ? {
            affiliations: {
              some: {
                dateFin: null,
                ...(orgId ? { organisationId: orgId } : {}),
                ...(typeOrg ? { organisation: { type: typeOrg } } : {}),
              },
            },
          }
        : {}),
    },
    orderBy: { nom: "asc" },
    include: {
      affiliations: {
        include: { organisation: true },
        orderBy: { dateDebut: "desc" },
      },
      _count: { select: { ventes: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-white">Clients</h1>
          <p className="text-white/40 text-sm mt-1">{clients.length} personne{clients.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/organisations"
            className="flex items-center gap-2 text-[#e4b56a] hover:text-[#f0c888] border border-[#e4b56a]/20 hover:border-[#e4b56a]/40 bg-[#e4b56a]/5 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Entreprises & nations
          </Link>
          <Link
            href="/dashboard/clients/facturation"
            className="flex items-center gap-2 text-[#e4b56a] hover:text-[#f0c888] border border-[#e4b56a]/20 hover:border-[#e4b56a]/40 bg-[#e4b56a]/5 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Facturation semaine
          </Link>
          <Link
            href="/dashboard/clients/nouveau"
            className="flex items-center gap-2 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            + Nouveau client
          </Link>
        </div>
      </div>

      <form className="flex flex-wrap gap-2 mb-6" action="/dashboard/clients">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Nom..."
          className="input-dark !w-auto min-w-48"
        />
        <select name="type" defaultValue={typeOrg ?? ""} className="input-dark !w-auto">
          <option value="">Tous les rattachements</option>
          <option value="entreprise">Liés à une entreprise</option>
          <option value="nation">Liés à une nation</option>
        </select>
        <select name="org" defaultValue={orgId ? String(orgId) : ""} className="input-dark !w-auto">
          <option value="">Toutes les organisations</option>
          {organisations.map((o) => (
            <option key={o.id} value={o.id}>{o.nom} ({labelTypeOrg(o.type)})</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 rounded-lg text-sm border border-[#a06b3c] bg-[#6b3e22] text-[#f3d7a5]">
          Filtrer
        </button>
      </form>

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Personne</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Entreprise</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Nation</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Ventes</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const entreprise = affiliationActive(c.affiliations, "entreprise");
              const nation = affiliationActive(c.affiliations, "nation");
              return (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3d2818] border border-white/10 flex items-center justify-center text-white/50 text-xs font-medium uppercase">
                        {c.prenom?.[0] ?? c.nom[0]}{c.nom[0]}
                      </div>
                      <span className="text-white font-medium">{nomClient(c)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {entreprise ? (
                      <Link href={`/dashboard/organisations/${entreprise.organisation.id}`} className={`text-xs px-2 py-1 rounded-full border ${badgeContexte("entreprise")}`}>
                        {entreprise.organisation.nom}
                      </Link>
                    ) : <span className="text-white/25">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    {nation ? (
                      <Link href={`/dashboard/organisations/${nation.organisation.id}`} className={`text-xs px-2 py-1 rounded-full border ${badgeContexte("nation")}`}>
                        {nation.organisation.nom}
                      </Link>
                    ) : <span className="text-white/25">—</span>}
                  </td>
                  <td className="px-5 py-4 text-right text-white">{c._count.ventes}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/dashboard/clients/${c.id}`} className="text-xs text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors">
                      Modifier
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="text-center py-16 text-white/30">
            Aucun client. <Link href="/dashboard/clients/nouveau" className="text-[#e4b56a] underline">Créer le premier</Link>
          </div>
        )}
      </div>
    </div>
  );
}
