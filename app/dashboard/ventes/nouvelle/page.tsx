// Exemple : app/dashboard/ventes/nouvelle/page.tsx
import { prisma } from "@/lib/db/prisma";
import NouvelleVenteForm from "@/components/ventes/NouvelleVenteForm"; // Ajuste le chemin

export default async function NouvelleVentePage() {
  // 1. Récupère les données brutes depuis Prisma
  const clientsRaw = await prisma.client.findMany({
    orderBy: { nom: "asc" },
    include: {
      affiliations: {
        include: { organisation: true },
        orderBy: { dateDebut: "desc" },
      },
    },
  });

  const produitsRaw = await prisma.produit.findMany({
    orderBy: { nom: "asc" },
    // Optionnel : ne prendre que les produits actifs pour la vente
    where: { actif: true } 
  });

  // 2. Sérialise les types complexes (Prisma.Decimal ou Float selon le schéma -> number)
  const produits = produitsRaw.map(p => ({
    ...p, // On garde toutes les propriétés requises par le type Produit de Prisma
    prixVente: typeof p.prixVente === 'object' && p.prixVente !== null && 'toNumber' in p.prixVente
      ? (p.prixVente as { toNumber: () => number }).toNumber()
      : Number(p.prixVente)
  }));

  // On passe tout l'objet client pour satisfaire le type Client de Prisma attendu par le formulaire
  const clients = clientsRaw.map(c => ({
    ...c
  }));

  // 3. Passe les données nettoyées au composant Client
  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-white mb-6">Nouvelle Vente</h1>
      <NouvelleVenteForm clients={clients} produits={produits} />
    </div>
  );
}