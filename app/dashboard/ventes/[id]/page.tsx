import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import NouvelleVenteForm from "@/components/ventes/NouvelleVenteForm";
import { extrasDepuisVente, flagsDepuisPrix, toDatetimeLocal } from "@/lib/ventes";
import type { ContexteValue } from "@/lib/clients";

export default async function ModifierVentePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venteId = parseInt(id);

  const [vente, clientsRaw, produitsRaw] = await Promise.all([
    prisma.vente.findUnique({
      where: { id: venteId },
      include: {
        organisation: true,
        produits: { include: { produit: true } },
        transactions: true,
      },
    }),
    prisma.client.findMany({
      orderBy: { nom: "asc" },
      include: {
        affiliations: {
          include: { organisation: true },
          orderBy: { dateDebut: "desc" },
        },
      },
    }),
    prisma.produit.findMany({ orderBy: { nom: "asc" } }),
  ]);

  if (!vente) notFound();

  const produits = produitsRaw.map((p) => ({
    ...p,
    prixVente: Number(p.prixVente),
    prixAchat: Number(p.prixAchat),
  }));

  const totalLignes = vente.produits.reduce((acc, l) => acc + Number(l.totalLigne), 0);
  const extras = extrasDepuisVente(
    vente.transactions[0]?.description,
    Number(vente.montantTotal) - totalLignes
  );

  const lignes = vente.produits.map((l) => {
    const catalogue = produits.find((p) => p.id === l.produitId);
    const prixVente = catalogue ? Number(catalogue.prixVente) : Number(l.prixUnitaire);
    const prixAchat = catalogue ? Number(catalogue.prixAchat) : Number(l.prixUnitaire);
    return {
      produitId: l.produitId,
      nom: l.produit.nom,
      quantite: l.quantite,
      prixVente,
      prixAchat,
      ...flagsDepuisPrix(Number(l.prixUnitaire), prixVente, prixAchat),
    };
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-white mb-6">Modifier la vente #{vente.id}</h1>
      <NouvelleVenteForm
        clients={clientsRaw}
        produits={produits}
        vente={{
          id: vente.id,
          clientId: vente.clientId,
          contexte: vente.contexteCommande as ContexteValue,
          organisationId: vente.organisationId,
          organisationNom: vente.organisation?.nom ?? null,
          organisationType: vente.organisation?.type ?? null,
          dateVente: toDatetimeLocal(vente.dateVente),
          lignes,
          extras,
        }}
      />
    </div>
  );
}
