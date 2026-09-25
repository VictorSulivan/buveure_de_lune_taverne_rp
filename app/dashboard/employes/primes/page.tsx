import { prisma } from "@/lib/db/prisma";
import NouvelleprimeForm from "@/components/employes/NouvellePrimeForm";
import { fmtDate } from "@/utils/formatDate";
import { fmtArgent } from "@/utils/fmtArgent";

export default async function PrimesPage() {
  const [primes, employes] = await Promise.all([
    prisma.prime.findMany({
      orderBy: { createdAt: "desc" },
      include: { employe: true, attribuePar: true },
    }),
    prisma.employe.findMany({ where: { actif: true }, orderBy: { nom: "asc" } }),
  ]);

  const totalPrimes = primes.reduce((acc, p) => acc + p.montant, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-white">Primes</h1>
          <p className="text-white/40 text-sm mt-1">{primes.length} primes — total {fmtArgent(totalPrimes)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Formulaire */}
        <NouvelleprimeForm employes={employes} />

        {/* Historique */}
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-xs text-white/40 uppercase tracking-widest">Historique</p>
          </div>
          <div className="divide-y divide-white/5">
            {primes.map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6b3e22] border border-[#a06b3c] flex items-center justify-center text-[#e4b56a] text-xs font-medium uppercase shrink-0">
                    {p.employe.prenom[0]}{p.employe.nom[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{p.employe.prenom} {p.employe.nom}</p>
                    <p className="text-white/40 text-xs">
                      S{p.semestre}/{p.annee}
                      {p.commentaire && ` · ${p.commentaire}`}
                    </p>
                    {p.attribuePar && (
                      <p className="text-white/20 text-xs">par {p.attribuePar.prenom} {p.attribuePar.nom}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-orange-400 font-medium text-sm">{fmtArgent(p.montant, { signe: true })}</p>
                  <p className="text-white/20 text-xs">
                    {fmtDate(p.createdAt, { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
            {primes.length === 0 && (
              <div className="text-center py-12 text-white/30 text-sm">Aucune prime attribuée.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
