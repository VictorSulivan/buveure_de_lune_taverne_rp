import { prisma } from "@/lib/db/prisma";
import NouvelEvenementForm from "@/components/calendrier/NouvelEvenementForm";

export default async function NouvelEvenementPage() {
  const [employes, clients, produits] = await Promise.all([
    prisma.employe.findMany({ where: { actif: true }, orderBy: { nom: "asc" } }),
    prisma.client.findMany({
      orderBy: { nom: "asc" },
      include: { affiliations: { include: { organisation: true }, orderBy: { dateDebut: "desc" } } },
    }),
    prisma.produit.findMany({ where: { actif: true }, orderBy: { nom: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white">Nouvel événement</h1>
        <p className="text-white/40 text-sm mt-1">Planifier une réservation ou une soirée</p>
      </div>
      <NouvelEvenementForm
        employes={JSON.parse(JSON.stringify(employes))}
        clients={JSON.parse(JSON.stringify(clients))}
        produits={JSON.parse(JSON.stringify(produits))}
      />
    </div>
  );
}
