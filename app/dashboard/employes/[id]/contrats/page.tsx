import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import NouveauContratForm from "@/components/employes/NouveauContratForm";
import ContratActions from "@/components/employes/ContratActions";
import Link from "next/link";
import { fmtDate } from "@/utils/formatDate";
import { fmtArgent } from "@/utils/fmtArgent";
import { COULEUR_GRADE } from "@/lib/grades";

export default async function ContratsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const employe = await prisma.employe.findUnique({
    where: { id: parseInt(id) },
    include: { contrats: { orderBy: { dateDebut: "desc" } } },
  });

  if (!employe) notFound();

  const representants = await prisma.employe.findMany({
    where: { actif: true, role: { in: ["patron", "co_patron"] }, id: { not: employe.id } },
    select: { id: true, prenom: true, nom: true, role: true },
    orderBy: [{ role: "desc" }, { nom: "asc" }],
  });

  const typeColor: Record<string, string> = {
    Admin: COULEUR_GRADE.admin,
    Employé: COULEUR_GRADE.employe,
    "Co-Patron": COULEUR_GRADE.co_patron,
    Patron: COULEUR_GRADE.patron,
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/dashboard/employes/${id}`}
          className="text-white/30 hover:text-white text-sm transition-colors">
          ← {employe.prenom} {employe.nom}
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-2xl font-medium text-white">Contrats</h1>
      </div>

      <NouveauContratForm
        employe={{ id: employe.id, prenom: employe.prenom, nom: employe.nom, role: employe.role }}
        representants={representants}
      />

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-widest">Historique des contrats</p>
        </div>

        {employe.contrats.length === 0 ? (
          <div className="text-center py-12 text-white/30 text-sm">Aucun contrat enregistré.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {employe.contrats.map((c) => (
              <div key={c.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${typeColor[c.typeContrat] ?? "bg-white/5 text-white/40 border-white/10"}`}>
                        {c.typeContrat}
                      </span>
                      {c.estActif && (
                        <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">
                          Actif
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>
                        {fmtDate(c.dateDebut, { day: "2-digit", month: "short", year: "numeric" })}
                        {c.dateFin && ` → ${fmtDate(c.dateFin, { day: "2-digit", month: "short", year: "numeric" })}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {c.salaire && <span className="text-white">{fmtArgent(c.salaire)}/sem.</span>}
                      {c.pourcentagePrime && <span className="text-[#e4b56a]">{c.pourcentagePrime}% prime</span>}
                    </div>
                    {c.commentaire && (
                      <p className="text-white/30 text-xs">{c.commentaire}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/employes/${id}/contrats/${c.id}`}
                      className="text-xs text-white/50 hover:text-white px-2 py-1 rounded transition-colors"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/dashboard/employes/${id}/contrats/${c.id}?download=1`}
                      className="text-xs text-[#e4b56a] hover:underline px-2 py-1 rounded transition-colors"
                    >
                      Télécharger
                    </Link>
                    <ContratActions id={c.id} estActif={c.estActif} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
