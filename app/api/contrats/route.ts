import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { parseArticles } from "@/lib/contrats";
import { roleDepuisTypeContrat } from "@/lib/grades";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const {
    employeId, typeContrat, dateDebut, dateFin, salaire, pourcentagePrime, commentaire,
    articles, signatairePatronPrenom, signatairePatronNom, signataireRole,
  } = body;

  if (!employeId || !typeContrat || !dateDebut || !signatairePatronPrenom || !signatairePatronNom) {
    return NextResponse.json({ error: "Il faut un employé, un grade et un patron ou co-patron pour signer" }, { status: 400 });
  }

  try {
    await prisma.contrat.updateMany({
      where: { employeId: parseInt(employeId), estActif: true },
      data: { estActif: false },
    });

    const contrat = await prisma.contrat.create({
      data: {
        employeId: parseInt(employeId),
        typeContrat,
        dateDebut: new Date(dateDebut),
        dateFin: dateFin ? new Date(dateFin) : null,
        salaire: salaire ? parseFloat(salaire) : null,
        pourcentagePrime: pourcentagePrime ? parseFloat(pourcentagePrime) : null,
        commentaire: commentaire || null,
        articles: parseArticles(articles),
        signatairePatronPrenom: signatairePatronPrenom || null,
        signatairePatronNom: signatairePatronNom || null,
        signataireRole: signataireRole || null,
        estActif: true,
      },
    });

    const employeActuel = await prisma.employe.findUnique({
      where: { id: parseInt(employeId) },
      select: { role: true },
    });
    const nouveauRole = roleDepuisTypeContrat(typeContrat);
    await prisma.employe.update({
      where: { id: parseInt(employeId) },
      data: {
        role: nouveauRole,
        ...(salaire ? { salaire: parseFloat(salaire) } : {}),
      },
    });
    if (employeActuel && employeActuel.role !== nouveauRole) {
      await prisma.historiqueRole.create({
        data: {
          employeId: parseInt(employeId),
          ancienRole: employeActuel.role,
          nouveauRole,
        },
      });
    }

    return NextResponse.json(contrat, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de sceller le pacte" }, { status: 500 });
  }
}
