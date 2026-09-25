import { prisma } from "@/lib/db/prisma";
import NouveauRestockForm from "@/components/stock/NouveauRestockForm";

export default async function RestockPage() {
  // Récupère uniquement les produits actifs pour le restock
  const produitsRaw = await prisma.produit.findMany({
    where: { actif: true },
    orderBy: { nom: "asc" },
  });

  // Sérialisation propre des types complexes en number
  const produits = produitsRaw.map((p) => ({
    ...p,
    prixAchat: typeof p.prixAchat === "object" && p.prixAchat !== null && "toNumber" in p.prixAchat
      ? (p.prixAchat as { toNumber: () => number }).toNumber()
      : Number(p.prixAchat),
    prixVente: typeof p.prixVente === "object" && p.prixVente !== null && "toNumber" in p.prixVente
      ? (p.prixVente as { toNumber: () => number }).toNumber()
      : Number(p.prixVente),
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white">Nouveau Restock</h1>
        <p className="text-white/40 text-sm mt-1">
          Ajoutez des articles au stock. Réapprovisionnement physique, sans impact sur le solde bancaire.
        </p>
      </div>

      <NouveauRestockForm produits={produits} />
    </div>
  );
}