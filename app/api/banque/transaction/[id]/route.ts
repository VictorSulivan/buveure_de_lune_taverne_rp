import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

const POSITIF = ["vente", "versement"];

function getSign(type: string | null) {
  return POSITIF.includes(type ?? "") ? 1 : -1;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  const body = await req.json();
  const { montant, description, typeTransaction, employeId } = body;

  if (!montant || !typeTransaction) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const existing = await prisma.transactionBanque.findUnique({ where: { id: numId } });
  if (!existing) return NextResponse.json({ error: "Transaction introuvable" }, { status: 404 });

  const oldImpact = getSign(existing.typeTransaction) * (existing.montant ?? 0);
  const newImpact = getSign(typeTransaction) * (montant as number);
  const delta = newImpact - oldImpact;

  await prisma.$transaction([
    prisma.banque.updateMany({
      data: { solde: { increment: delta } },
    }),
    prisma.transactionBanque.update({
      where: { id: numId },
      data: {
        montant: montant as number,
        description: description ?? existing.description,
        typeTransaction,
        employeId: employeId ? parseInt(employeId, 10) : null,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  const existing = await prisma.transactionBanque.findUnique({ where: { id: numId } });
  if (!existing) return NextResponse.json({ error: "Transaction introuvable" }, { status: 404 });

  const impact = getSign(existing.typeTransaction) * (existing.montant ?? 0);

  await prisma.$transaction([
    prisma.banque.updateMany({
      data: { solde: { increment: -impact } },
    }),
    prisma.transactionBanque.delete({ where: { id: numId } }),
  ]);

  return NextResponse.json({ ok: true });
}
