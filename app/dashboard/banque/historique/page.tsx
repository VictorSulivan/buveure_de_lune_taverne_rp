import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import HistoriqueTableau from "@/components/banque/HistoriqueTableau";

const TYPES_TRANSACTION = ["vente", "versement", "retrait", "salaire", "prime", "taxe", "achat"];

interface PageProps {
  searchParams: Promise<{ type?: string; employeId?: string; search?: string }>;
}

export default async function HistoriqueBanquePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentType = params.type || "";
  const currentEmployeId = params.employeId || "";
  const currentSearch = params.search || "";

  const employes = await prisma.employe.findMany({
    orderBy: { prenom: "asc" },
  });

  const whereClause: Prisma.TransactionBanqueWhereInput = {};
  
  if (currentType) {
    whereClause.typeTransaction = currentType;
  }
  if (currentEmployeId) {
    const parsedId = parseInt(currentEmployeId, 10);
    if (!isNaN(parsedId)) {
      whereClause.employeId = parsedId;
    }  
  }
  if (currentSearch) {
    whereClause.description = {
      contains: currentSearch,
      mode: 'insensitive',
    };
  }

  const transactions = await prisma.transactionBanque.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 200, 
    include: { employe: true },
  });

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/banque" className="text-xs text-white/40 hover:text-white transition-colors mb-2 inline-block">
            ← Retour aux finances
          </Link>
          <h1 className="text-2xl font-medium text-white">Historique complet</h1>
        </div>
        <div className="text-sm text-white/40">
          {transactions.length} transaction(s) trouvée(s)
        </div>
      </div>

      <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 bg-[#2b1d14] border border-white/10 rounded-xl p-4">
        <div>
          <label className="block text-xs text-white/40 mb-1">Recherche</label>
          <input 
            type="text" 
            name="search"
            defaultValue={currentSearch}
            placeholder="Description label" 
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e4b56a]"
          />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1">Type de mouvement</label>
          <select 
            name="type" 
            defaultValue={currentType}
            className="w-full bg-[#2b1d14] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e4b56a]"
          >
            <option value="">Tous les types</option>
            {TYPES_TRANSACTION.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1">Par Employé</label>
          <select 
            name="employeId" 
            defaultValue={currentEmployeId}
            className="w-full bg-[#2b1d14] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e4b56a]"
          >
            <option value="">Tous les employés</option>
            {employes.map((e) => (
              <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button 
            type="submit" 
            className="flex-1 bg-[#6b3e22] hover:bg-[#a06b3c] border border-[#a06b3c] text-[#e4b56a] text-sm rounded-lg py-2 font-medium transition-colors"
          >
            Filtrer
          </button>
          {(currentType || currentEmployeId || currentSearch) && (
            <Link 
              href="/dashboard/banque/historique" 
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm rounded-lg text-center transition-colors"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      <HistoriqueTableau transactions={transactions} employes={employes} />
    </div>
  );
}
