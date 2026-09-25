import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { debutSemaine } from "@/utils/semaine";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const paiements = await prisma.paiementSalaire.findMany({
    orderBy: { semaineDebut: "desc" },
    take: 80,
    include: { employe: true },
  });
  return NextResponse.json(paiements);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const role = session.user.role;
  if (!["admin", "patron", "co_patron"].includes(role)) {
    return NextResponse.json({ error: "Réservé au patron" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const semaine = body.semaineDebut ? debutSemaine(new Date(body.semaineDebut)) : debutSemaine();

  const employes = await prisma.employe.findMany({
    where: { actif: true, salaire: { gt: 0 } },
    orderBy: { nom: "asc" },
  });

  if (employes.length === 0) {
    return NextResponse.json({ error: "Aucun employé actif avec un salaire défini." }, { status: 400 });
  }

  const dejaPayes = await prisma.paiementSalaire.findMany({
    where: { semaineDebut: semaine },
    select: { employeId: true },
  });
  const deja = new Set(dejaPayes.map((p) => p.employeId));
  const aPayer = employes.filter((e) => !deja.has(e.id));

  if (aPayer.length === 0) {
    return NextResponse.json({ error: "Les salaires de cette semaine sont déjà versés." }, { status: 409 });
  }

  const total = aPayer.reduce((acc, e) => acc + (e.salaire ?? 0), 0);

  const payes = await prisma.$transaction(async (tx) => {
    await tx.banque.updateMany({
      data: { solde: { decrement: total } },
    });

    const created = [];
    for (const e of aPayer) {
      const montant = e.salaire ?? 0;
      await tx.transactionBanque.create({
        data: {
          typeTransaction: "salaire",
          montant,
          description: `Salaire semaine du ${semaine.toLocaleDateString("fr-FR")} — ${e.prenom} ${e.nom}`,
          employeId: e.id,
        },
      });
      created.push(
        await tx.paiementSalaire.create({
          data: {
            employeId: e.id,
            semaineDebut: semaine,
            montant,
          },
        })
      );
    }
    return created;
  });

  return NextResponse.json({
    ok: true,
    semaineDebut: semaine,
    nbPayes: payes.length,
    total,
  }, { status: 201 });
}
