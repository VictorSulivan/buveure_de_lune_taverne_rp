import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { setAffiliation } from "@/lib/organisations";

const includeClient = {
  affiliations: {
    include: { organisation: true },
    orderBy: { dateDebut: "desc" as const },
  },
  ventes: {
    orderBy: { dateVente: "desc" as const },
    take: 20,
    include: {
      employe: true,
      organisation: true,
      produits: { include: { produit: true } },
    },
  },
};

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: includeClient,
  });
  if (!client) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const clientId = parseInt(id);
  const body = await req.json();
  const { nom, prenom, entrepriseNom, nationNom } = body;

  await prisma.client.update({
    where: { id: clientId },
    data: {
      nom,
      prenom: prenom || null,
    },
  });

  if (entrepriseNom !== undefined) await setAffiliation(clientId, "entreprise", entrepriseNom);
  if (nationNom !== undefined) await setAffiliation(clientId, "nation", nationNom);

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: includeClient,
  });
  return NextResponse.json(client);
}
