import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { setAffiliation } from "@/lib/organisations";

const includeClient = {
  affiliations: {
    include: { organisation: true },
    orderBy: { dateDebut: "desc" as const },
  },
  _count: { select: { ventes: true } },
};

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const clients = await prisma.client.findMany({
    orderBy: { nom: "asc" },
    include: includeClient,
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { nom, prenom, entrepriseNom, nationNom } = body;

  if (!nom) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const entreprise = await prisma.entreprise.findFirst();
  if (!entreprise) return NextResponse.json({ error: "Entreprise introuvable" }, { status: 500 });

  const client = await prisma.client.create({
    data: {
      nom,
      prenom: prenom || null,
      typeClient: "particulier",
      entrepriseId: entreprise.id,
    },
  });

  if (entrepriseNom) await setAffiliation(client.id, "entreprise", entrepriseNom);
  if (nationNom) await setAffiliation(client.id, "nation", nationNom);

  const complet = await prisma.client.findUnique({
    where: { id: client.id },
    include: includeClient,
  });

  return NextResponse.json(complet, { status: 201 });
}
