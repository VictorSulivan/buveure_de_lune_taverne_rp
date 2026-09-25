import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { NOM_BANQUE } from "@/lib/branding";
import { fmtArgent } from "@/utils/fmtArgent";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const [totalProduits, stockCritique, totalEmployes, soldeBanque, ventesAujourdhui] =
    await Promise.all([
      prisma.produit.count({ where: { actif: true } }),
      prisma.produit.count({ where: { actif: true, stock: { lte: 5 } } }),
      prisma.employe.count({ where: { actif: true } }),
      prisma.banque.findFirst().then((g) => g?.solde ?? 0),
      prisma.vente.count({
        where: {
          dateVente: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          statut: "validee",
        },
      }),
    ]);

  const stats = [
    { label: `Solde ${NOM_BANQUE.toLowerCase()}`, value: fmtArgent(soldeBanque), icon: "🏦", alert: false },
    { label: "Ventes aujourd'hui", value: ventesAujourdhui.toString(),           icon: "💰", alert: false },
    { label: "Employés actifs",    value: totalEmployes.toString(),               icon: "👷", alert: false },
    { label: "Stock critique",     value: stockCritique.toString(),               icon: "📦", alert: stockCritique > 0 },
  ];

  const user = session.user;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-[#f3d7a5]">Bienvenue, {user.username}</h1>
        <p className="text-[#f4e6cf]/45 text-sm mt-1">Voici l&apos;état de l&apos;auberge en temps réel.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon, alert }) => (
          <div
            key={label}
            className={`bg-[#2b1d14] border rounded-xl p-5 ${
              alert ? "border-orange-500/40" : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{icon}</span>
              {alert && (
                <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                  Attention
                </span>
              )}
            </div>
            <p className="text-2xl font-medium text-white">{value}</p>
            <p className="text-white/40 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Infos rapides */}
      <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Infos rapides</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Produits actifs</span>
            <span className="text-white">{totalProduits}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Ton rôle</span>
            <span className="text-[#e4b56a] capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
