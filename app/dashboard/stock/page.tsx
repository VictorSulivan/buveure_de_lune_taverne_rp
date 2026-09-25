import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import StockActions from "@/components/stock/StockActions";
import { fmtDate } from "@/utils/formatDate";
import { fmtArgent } from "@/utils/fmtArgent";

export default async function StockPage() {
  // 1. Récupération parallèle des produits et des 5 derniers restocks
  const [produits, derniersRestocks] = await Promise.all([
    prisma.produit.findMany({
      orderBy: { nom: "asc" },
    }),
    prisma.restock.findMany({
      orderBy: { dateRestock: "desc" },
      take: 5,
      include: {
        employe: true,
        produits: {
          include: { produit: true },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-10">
      {/* SECTION PRODUITS */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Stock & Produits</h1>
            <p className="text-white/40 text-sm mt-1">{produits.length} produits au total</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/stock/restock"
              className="flex items-center gap-2 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              Restock
            </Link>
            <Link
              href="/dashboard/stock/nouveau"
              className="flex items-center gap-2 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              + Nouveau produit
            </Link>
          </div>
        </div>

        <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Produit</th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Catégorie</th>
                <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Stock</th>
                <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Prix achat</th>
                <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Prix vente</th>
                <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Statut</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/stock/${p.id}`} className="text-white font-medium hover:text-[#e4b56a]">
                      {p.nom}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      p.categorie === "plat"
                        ? "bg-[#1a2a1a] text-green-400 border-green-500/30"
                        : "bg-[#1a1a2a] text-blue-400 border-blue-500/30"
                    }`}>
                      {p.categorie}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`font-medium ${p.stock <= 5 ? "text-orange-400" : "text-white"}`}>
                      {p.stock}
                      {p.stock <= 5 && <span className="ml-1 text-xs">⚠️</span>}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-white/60">{fmtArgent(p.prixAchat)}</td>
                  <td className="px-5 py-4 text-right text-white">{fmtArgent(p.prixVente)}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      p.actif
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-white/5 text-white/30 border-white/10"
                    }`}>
                      {p.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <StockActions id={p.id} actif={p.actif} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {produits.length === 0 && (
            <div className="text-center py-16 text-white/30">
              Aucun produit. <Link href="/dashboard/stock/nouveau" className="text-[#e4b56a] underline">Créer le premier</Link>
            </div>
          )}
        </div>
      </div>

      {/* SECTION VERSION RÉDUITE DE L'HISTORIQUE */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-white">Derniers Réapprovisionnements</h2>
            <p className="text-white/40 text-xs mt-0.5">Aperçu des 5 dernièr restock</p>
          </div>
          <Link 
            href="/dashboard/stock/historique" 
            className="text-xs text-[#f3d7a5] hover:text-white border border-[#a06b3c] hover:bg-[#6b3e22] px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            Voir l&apos;historique complet →
          </Link>
        </div>

        <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden text-sm">
          <div className="divide-y divide-white/5">
            {derniersRestocks.length === 0 ? (
              <div className="p-6 text-center text-white/30 italic">Aucun restock récent.</div>
            ) : (
              derniersRestocks.map((r) => (
                <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/1 transition-colors">
                  <div>
                    <div className="text-xs text-white/40">
                      {fmtDate(r.dateRestock, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      {" · par "}
                      <span className="text-[#f3d7a5] font-medium">{r.employe.prenom} {r.employe.nom}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-white/70">
                      {r.produits.map((p) => (
                        <span key={p.id}>
                          • {p.produit.nom} <span className="text-white font-medium">(x{p.quantite})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right sm:border-l sm:border-white/5 sm:pl-4">
                    <span className="text-xs text-white/30 block">Valeur estimée</span>
                    <span className="font-medium text-emerald-400">{fmtArgent(r.valeurTotale)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}