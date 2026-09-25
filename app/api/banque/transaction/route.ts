import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user;
  const body = await req.json();
  const { type, montant, description } = body;

  if (!type || !montant) return NextResponse.json({ error: "Données manquantes" }, { status: 400 });

  const employe = await prisma.employe.findFirst({
    where: { utilisateur: { id: parseInt(user.id) } },
  });

  const isRetrait = type === "retrait";

  await prisma.$transaction(async (tx) => {
    await tx.banque.updateMany({
      data: { solde: { increment: isRetrait ? -montant : montant } },
    });

    await tx.transactionBanque.create({
      data: {
        typeTransaction: type,
        montant,
        description: description || (isRetrait ? "Retrait manuel" : "Versement manuel"),
        employeId: employe?.id ?? null,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
