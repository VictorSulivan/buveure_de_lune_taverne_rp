import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { fmtDate } from "@/utils/formatDate";
import { fmtArgent } from "@/utils/fmtArgent";

export const dynamic = "force-dynamic";

export default async function HistoriqueRestocksPage() {
  const restocks = await prisma.restock.findMany({
    orderBy: { dateRestock: "desc" },
    include: {
      employe: true,
      produits: {
        include: { produit: true },
      },
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-white">Historique des Restocks</h1>
          <p className="text-sm text-white/40">Suivi des réapprovisionnements physiques, sans impact sur la banque</p>
        </div>
            <Link
              href="/dashboard/stock/restock"
              className="flex items-center gap-2 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              Restock
            </Link>
      </div>

      <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/2 text-white/40 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Employé</th>
                <th className="p-4 font-medium">Produits ajoutés</th>
                <th className="p-4 font-medium text-right">Valeur Estimée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-white/80">
              {restocks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-white/30 italic">Aucun restock enregistré</td>
                </tr>
              ) : (
                restocks.map((r) => (
                  <tr key={r.id} className="hover:bg-white/1 transition-colors">
                    <td className="p-4 text-white/60">
                      {fmtDate(r.dateRestock, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="p-4 font-medium text-[#f3d7a5]">
                      {r.employe.prenom} {r.employe.nom}
                    </td>
                    <td className="p-4 space-y-1">
                      {r.produits.map((p) => (
                        <div key={p.id} className="text-xs text-white/60">
                          • <span className="text-white font-medium">{p.produit.nom}</span> (x{p.quantite}) 
                          <span className="text-white/30"> — acheté à {fmtArgent(p.prixAchatUnitaire)}/u</span>
                        </div>
                      ))}
                    </td>
                    <td className="p-4 text-right font-semibold text-emerald-400">
                      {fmtArgent(r.valeurTotale)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}