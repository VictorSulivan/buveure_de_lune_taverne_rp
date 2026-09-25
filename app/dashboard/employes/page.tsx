import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import EmployeActions from "@/components/employes/EmployeActions";
import { fmtArgent } from "@/utils/fmtArgent";
import { COULEUR_GRADE, labelGrade } from "@/lib/grades";

export default async function EmployesPage() {
  const employes = await prisma.employe.findMany({
    orderBy: { nom: "asc" },
    include: { utilisateur: true },
  });

  const roleColor = COULEUR_GRADE;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-white">Employés</h1>
          <p className="text-white/40 text-sm mt-1">{employes.filter(e => e.actif).length} actifs</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/employes/salaires"
            className="flex items-center gap-2 text-[#e4b56a] hover:text-[#f0c888] border border-[#e4b56a]/20 hover:border-[#e4b56a]/40 bg-[#e4b56a]/5 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Salaires
          </Link>
          <Link
            href="/dashboard/employes/nouveau"
            className="flex items-center gap-2 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            + Nouvel employé
          </Link>
        </div>
      </div>

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Employé</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Rôle</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Compte</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Salaire / sem.</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Statut</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {employes.map((e) => (
              <tr key={e.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#6b3e22] border border-[#a06b3c] flex items-center justify-center text-[#e4b56a] text-xs font-medium uppercase">
                      {e.prenom[0]}{e.nom[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium">{e.prenom} {e.nom}</p>
                      {e.utilisateur && (
                        <p className="text-white/30 text-xs">@{e.utilisateur.username}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${roleColor[e.role] ?? ""}`}>
                    {labelGrade(e.role)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {e.utilisateur ? (
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">Actif</span>
                  ) : (
                    <span className="text-xs text-white/20">Aucun</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right text-white/60">
                  {e.salaire ? fmtArgent(e.salaire) : "—"}
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    e.actif
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-white/5 text-white/30 border-white/10"
                  }`}>
                    {e.actif ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <EmployeActions id={e.id} actif={e.actif} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employes.length === 0 && (
          <div className="text-center py-16 text-white/30">
            Aucun employé.
          </div>
        )}
      </div>
    </div>
  );
}
