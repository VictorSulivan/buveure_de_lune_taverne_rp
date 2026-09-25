import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { fmtDate } from "@/utils/formatDate";
import { fmtArgent } from "@/utils/fmtArgent";
import { debutSemaine, labelSemaine } from "@/utils/semaine";
import VerserSalairesForm from "@/components/employes/VerserSalairesForm";

export default async function SalairesPage() {
  const semaine = debutSemaine();

  const [employes, paiements, payesCetteSemaine] = await Promise.all([
    prisma.employe.findMany({
      where: { actif: true },
      orderBy: { nom: "asc" },
    }),
    prisma.paiementSalaire.findMany({
      orderBy: { semaineDebut: "desc" },
      take: 60,
      include: { employe: true },
    }),
    prisma.paiementSalaire.findMany({
      where: { semaineDebut: semaine },
      select: { employeId: true },
    }),
  ]);

  const deja = new Set(payesCetteSemaine.map((p) => p.employeId));
  const aPayer = employes.filter((e) => (e.salaire ?? 0) > 0 && !deja.has(e.id));
  const totalPrevu = aPayer.reduce((acc, e) => acc + (e.salaire ?? 0), 0);

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/employes" className="text-xs text-white/40 hover:text-white transition-colors mb-2 inline-block">
          ← Employés
        </Link>
        <h1 className="text-2xl font-medium text-white">Salaires hebdomadaires</h1>
        <p className="text-white/40 text-sm mt-1">
          Chaque semaine, le patron verse les salaires définis sur chaque fiche. La banque est débitée.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <VerserSalairesForm
          totalPrevu={totalPrevu}
          nbAPayer={aPayer.length}
          labelSemaine={labelSemaine(semaine)}
          dejaVerse={aPayer.length === 0 && employes.some((e) => (e.salaire ?? 0) > 0)}
        />

        <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-xs text-white/40 uppercase tracking-widest">Barème actuel</p>
          </div>
          <div className="divide-y divide-white/5">
            {employes.map((e) => (
              <div key={e.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-white text-sm">{e.prenom} {e.nom}</p>
                  <p className="text-white/30 text-xs capitalize">{e.role.replace("_", " ")}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#f3d7a5] text-sm">{e.salaire ? fmtArgent(e.salaire) : "—"}</p>
                  {deja.has(e.id) && <p className="text-green-400/70 text-xs">payé cette semaine</p>}
                </div>
              </div>
            ))}
            {employes.length === 0 && (
              <p className="px-5 py-8 text-center text-white/30 text-sm">Aucun employé actif.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-widest">Historique des versements</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Semaine</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Employé</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Montant</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Versé le</th>
            </tr>
          </thead>
          <tbody>
            {paiements.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="px-5 py-3 text-white/70">{labelSemaine(p.semaineDebut)}</td>
                <td className="px-5 py-3 text-white">{p.employe.prenom} {p.employe.nom}</td>
                <td className="px-5 py-3 text-right text-red-400">{fmtArgent(-p.montant, { signe: true })}</td>
                <td className="px-5 py-3 text-right text-white/40 text-xs">
                  {fmtDate(p.createdAt, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paiements.length === 0 && (
          <div className="text-center py-12 text-white/30 text-sm">Aucun salaire versé pour le moment.</div>
        )}
      </div>
    </div>
  );
}
