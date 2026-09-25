import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import EmployeEditForm from "@/components/employes/EmployeEditForm";
import { fmtDate } from "@/utils/formatDate";
import { fmtArgent } from "@/utils/fmtArgent";
import { COULEUR_GRADE, labelGrade } from "@/lib/grades";

export default async function EmployePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const employe = await prisma.employe.findUnique({
    where: { id: parseInt(id) },
    include: {
      utilisateur: true,
      rolesHistorique: { orderBy: { dateChangement: "desc" } },
      ventes: {
        orderBy: { dateVente: "desc" },
        take: 5,
        include: { client: true },
      },
      primes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!employe) notFound();

  const totalVentes = await prisma.vente.aggregate({
    where: { employeId: employe.id, statut: "validee" },
    _sum: { montantTotal: true },
    _count: true,
  });

  const roleColor = COULEUR_GRADE;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-[#6b3e22] border border-[#a06b3c] flex items-center justify-center text-[#e4b56a] text-lg font-medium uppercase">
          {employe.prenom[0]}{employe.nom[0]}
        </div>
        <div>
          <h1 className="text-2xl font-medium text-white">{employe.prenom} {employe.nom}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full border ${roleColor[employe.role] ?? ""}`}>
              {labelGrade(employe.role)}
            </span>
            {employe.utilisateur && (
              <span className="text-xs text-white/30">@{employe.utilisateur.username}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Ventes réalisées", value: totalVentes._count.toString() },
          { label: "CA généré",        value: fmtArgent(totalVentes._sum.montantTotal ?? 0) },
          { label: "Salaire",          value: employe.salaire ? fmtArgent(employe.salaire) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#2b1d14] border border-white/10 rounded-xl p-4">
            <p className="text-xl font-medium text-white">{value}</p>
            <p className="text-white/40 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Formulaire édition */}
      <EmployeEditForm employe={{ id: employe.id, nom: employe.nom, prenom: employe.prenom, role: employe.role, salaire: employe.salaire, notes: employe.notes }} />

      {/* Historique rôles */}
      {employe.rolesHistorique.length > 0 && (
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Historique des rôles</p>
          <div className="space-y-3">
            {employe.rolesHistorique.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  {h.ancienRole ? (
                    <>
                      <span>{labelGrade(h.ancienRole)}</span>
                      <span className="text-white/20">→</span>
                      <span className="text-white">{h.nouveauRole ? labelGrade(h.nouveauRole) : ""}</span>
                    </>
                  ) : (
                    <span className="text-white">Embauche — {h.nouveauRole ? labelGrade(h.nouveauRole) : ""}</span>
                  )}
                </div>
                <span className="text-white/30 text-xs">
                  {fmtDate(h.dateChangement, { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dernières ventes */}
      {employe.ventes.length > 0 && (
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Dernières ventes</p>
          <div className="space-y-2">
            {employe.ventes.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-sm">
                <span className="text-white/60">{v.client.prenom} {v.client.nom}</span>
                <div className="flex items-center gap-4">
                  <span className="text-white">{fmtArgent(v.montantTotal)}</span>
                  <span className="text-white/30 text-xs">
                    {fmtDate(v.dateVente, { day: "2-digit", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
