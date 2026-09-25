import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { DEVISE } from "@/lib/branding";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const ventes = await prisma.vente.findMany({
    orderBy: { dateVente: "desc" },
    take: 50,
    include: {
      client: true,
      employe: true,
      organisation: true,
      produits: { include: { produit: true } },
    },
  });
  return NextResponse.json(ventes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user;
  const body = await req.json();
  const { clientId, lignes, extras, contexteCommande } = body; 
  // lignes attendues : Array<{ produitId: number, quantite: number, prixEmploye: boolean }>

  if (!clientId || (!lignes?.length && !extras?.length)) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const employe = await prisma.employe.findFirst({
    where: { utilisateur: { id: parseInt(user.id) } },
  });
  if (!employe) return NextResponse.json({ error: "Employé introuvable" }, { status: 400 });

  try {
    const vente = await prisma.$transaction(async (tx) => {
      let totalProduitsCalculs = 0;
      const produitsCreatePayload = [];

      for (const l of lignes ?? []) {
        const produitBDD = await tx.produit.findUnique({
          where: { id: l.produitId }
        });

        if (!produitBDD) {
          throw new Error(`Produit #${l.produitId} introuvable en base.`);
        }

        // Conversion des champs Decimal de Prisma en Number
        const prixVenteDeBase = typeof produitBDD.prixVente === 'object' && produitBDD.prixVente !== null && 'toNumber' in produitBDD.prixVente
          ? (produitBDD.prixVente as { toNumber: () => number }).toNumber()
          : Number(produitBDD.prixVente);

        const prixAchatDeBase = typeof produitBDD.prixAchat === 'object' && produitBDD.prixAchat !== null && 'toNumber' in produitBDD.prixAchat
          ? (produitBDD.prixAchat as { toNumber: () => number }).toNumber()
          : Number(produitBDD.prixAchat);

        // Détermination du prix final unitaire selon l'option choisie
        let prixUnitaireFinal = prixVenteDeBase;
        
        if (l.prixEmploye) {
          prixUnitaireFinal = prixAchatDeBase;
        }

        const totalLigne = l.quantite * prixUnitaireFinal;
        totalProduitsCalculs += totalLigne;

        produitsCreatePayload.push({
          produitId: l.produitId,
          quantite: l.quantite,
          prixUnitaire: prixUnitaireFinal,
          totalLigne: totalLigne,
        });
      }

      type Extra = { label: string; montant: number };
      const totalExtras = ((extras ?? []) as Extra[]).reduce(
        (acc: number, e: Extra) => acc + e.montant, 0
      );
      
      const montantTotal = totalProduitsCalculs + totalExtras;

      const contexte = contexteCommande === "entreprise" || contexteCommande === "nation"
        ? contexteCommande
        : "civil";

      let organisationId: number | null = null;
      if (contexte !== "civil") {
        const affiliation = await tx.affiliation.findFirst({
          where: {
            clientId: parseInt(clientId),
            dateFin: null,
            organisation: { type: contexte },
          },
        });
        if (!affiliation) {
          throw new Error(contexte === "nation"
            ? "Ce client n'a pas de nation actuelle."
            : "Ce client n'a pas d'entreprise actuelle.");
        }
        organisationId = affiliation.organisationId;
      }

      const v = await tx.vente.create({
        data: {
          employeId: employe.id,
          clientId: parseInt(clientId),
          contexteCommande: contexte,
          organisationId,
          montantTotal,
          statut: "validee",
          produits: {
            create: produitsCreatePayload,
          },
        },
      });

      // Diminuer le stock
      for (const l of lignes ?? []) {
        await tx.produit.update({
          where: { id: l.produitId },
          data: { stock: { decrement: l.quantite } },
        });
      }

      await tx.banque.updateMany({
        data: { solde: { increment: montantTotal } },
      });

      const extrasDesc = (extras ?? []).length > 0
        ? ` + extras: ${(extras as Extra[]).map((e) => `${e.label} (${e.montant}) ${DEVISE}`).join(", ")}`
        : "";

      await tx.transactionBanque.create({
        data: {
          typeTransaction: "vente",
          montant: montantTotal,
          description: `Vente #${v.id}${extrasDesc} (Tarification ajustée)`,
          employeId: employe.id,
          venteId: v.id,
        },
      });

      return v;
    });

    return NextResponse.json(vente, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur lors de la transaction";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}