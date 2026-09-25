import { prisma } from "../lib/db/prisma";
import { NOM_ENTREPRISE } from "../lib/branding";

async function main() {
  const entreprise = await prisma.entreprise.upsert({
    where: { id: 1 },
    update: { nom: NOM_ENTREPRISE },
    create: { nom: NOM_ENTREPRISE },
  });

  await prisma.banque.upsert({
    where: { entrepriseId: entreprise.id },
    update: {},
    create: { entrepriseId: entreprise.id, solde: 50000 },
  });

  await prisma.produit.createMany({
    skipDuplicates: true,
    data: [
      { nom: "Hydromel de lune", categorie: "boisson", stock: 40, prixAchat: 4, prixVente: 12 },
      { nom: "Bière brune maison", categorie: "boisson", stock: 60, prixAchat: 2, prixVente: 7 },
      { nom: "Vin d'hiver", categorie: "boisson", stock: 25, prixAchat: 6, prixVente: 16 },
      { nom: "Cidre aux pommes sauvages", categorie: "boisson", stock: 35, prixAchat: 3, prixVente: 9 },
      { nom: "Ragoût du voyageur", categorie: "plat", stock: 20, prixAchat: 5, prixVente: 14 },
      { nom: "Pain de campagne", categorie: "plat", stock: 50, prixAchat: 1, prixVente: 4 },
      { nom: "Fromage fumé", categorie: "plat", stock: 18, prixAchat: 3, prixVente: 8 },
      { nom: "Soupe aux racines", categorie: "plat", stock: 22, prixAchat: 2, prixVente: 6 },
    ],
  });

  await prisma.client.createMany({
    skipDuplicates: true,
    data: [
      { nom: "Valen", prenom: "Iria", typeClient: "particulier", entrepriseId: entreprise.id },
      { nom: "Dorn", prenom: "Kael", typeClient: "particulier", entrepriseId: entreprise.id },
      { nom: "Serren", prenom: "Maelis", typeClient: "particulier", entrepriseId: entreprise.id },
    ],
  });

  console.log("✅ Seed terminé");
}

main().catch(console.error).finally(() => prisma.$disconnect());
