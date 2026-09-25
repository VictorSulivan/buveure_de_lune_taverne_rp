import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { DEVISE } from "@/lib/branding";
import {
  organisationPourContexte,
  prixEffectif,
  type ExtraVente,
  type LigneVenteInput,
} from "@/lib/ventes";
import type { ContexteCommande } from "@prisma/client";

const includeVente = {
  client: {
    include: {
      affiliations: {
        include: { organisation: true },
        orderBy: { dateDebut: "desc" as const },
      },
    },
  },
  employe: true,
  organisation: true,
  produits: { include: { produit: true } },
  transactions: true,
};

function contexteValide(value: unknown): value is ContexteCommande {
  return value === "civil" || value === "entreprise" || value === "nation";
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const vente = await prisma.vente.findUnique({
    where: { id: parseInt(id) },
    include: includeVente,
  });
  if (!vente) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(vente);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const venteId = parseInt(id);
  const body = await req.json();
  const { clientId, lignes, extras, contexteCommande, organisationId, dateVente } = body as {
    clientId?: number;
    lignes?: LigneVenteInput[];
    extras?: ExtraVente[];
    contexteCommande?: string;
    organisationId?: number | null;
    dateVente?: string;
  };

  if (!clientId || (!(lignes?.length) && !(extras?.length))) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const contexte: ContexteCommande = contexteValide(contexteCommande) ? contexteCommande : "civil";

  try {
    const vente = await prisma.$transaction(async (tx) => {
      const actuelle = await tx.vente.findUnique({
        where: { id: venteId },
        include: { produits: true, transactions: true },
      });
      if (!actuelle) throw new Error("Vente introuvable");

      for (const ligne of actuelle.produits) {
        await tx.produit.update({
          where: { id: ligne.produitId },
          data: { stock: { increment: ligne.quantite } },
        });
      }

      let totalProduits = 0;
      const produitsCreate = [];
      for (const l of lignes ?? []) {
        const produit = await tx.produit.findUnique({ where: { id: l.produitId } });
        if (!produit) throw new Error(`Produit #${l.produitId} introuvable.`);
        const { prixUnitaire, totalLigne } = prixEffectif(Number(produit.prixVente), Number(produit.prixAchat), l);
        totalProduits += totalLigne;
        produitsCreate.push({
          produitId: l.produitId,
          quantite: l.quantite,
          prixUnitaire,
          totalLigne,
        });
        await tx.produit.update({
          where: { id: l.produitId },
          data: { stock: { decrement: l.quantite } },
        });
      }

      const totalExtras = (extras ?? []).reduce((acc, e) => acc + Number(e.montant || 0), 0);
      const montantTotal = totalProduits + totalExtras;
      const orgId = await organisationPourContexte(tx, Number(clientId), contexte, organisationId);

      await tx.venteProduit.deleteMany({ where: { venteId } });

      const miseAJour = await tx.vente.update({
        where: { id: venteId },
        data: {
          clientId: Number(clientId),
          contexteCommande: contexte,
          organisationId: orgId,
          montantTotal,
          ...(dateVente ? { dateVente: new Date(dateVente) } : {}),
          produits: { create: produitsCreate },
        },
        include: includeVente,
      });

      const delta = montantTotal - actuelle.montantTotal;
      if (delta !== 0) {
        await tx.banque.updateMany({ data: { solde: { increment: delta } } });
      }

      const extrasDesc = (extras ?? []).length > 0
        ? ` + extras: ${(extras ?? []).map((e) => `${e.label} (${e.montant}) ${DEVISE}`).join(", ")}`
        : "";

      const txBanque = actuelle.transactions[0];
      if (txBanque) {
        await tx.transactionBanque.update({
          where: { id: txBanque.id },
          data: {
            montant: montantTotal,
            description: `Vente #${venteId}${extrasDesc} (modifiée)`,
          },
        });
      }

      return miseAJour;
    });

    return NextResponse.json(vente);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur lors de la modification";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const venteId = parseInt(id);

  try {
    await prisma.$transaction(async (tx) => {
      const vente = await tx.vente.findUnique({
        where: { id: venteId },
        include: { produits: true },
      });
      if (!vente) throw new Error("Vente introuvable");

      for (const ligne of vente.produits) {
        await tx.produit.update({
          where: { id: ligne.produitId },
          data: { stock: { increment: ligne.quantite } },
        });
      }

      await tx.banque.updateMany({
        data: { solde: { decrement: vente.montantTotal } },
      });
      await tx.transactionBanque.deleteMany({ where: { venteId } });
      await tx.venteProduit.deleteMany({ where: { venteId } });
      await tx.vente.delete({ where: { id: venteId } });
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur lors de la suppression";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
