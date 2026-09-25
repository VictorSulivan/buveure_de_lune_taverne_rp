import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import type { TypeOrganisation } from "@prisma/client";

function typeValide(type: unknown): type is TypeOrganisation {
  return type === "entreprise" || type === "nation";
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const organisation = await prisma.organisation.findUnique({ where: { id: parseInt(id) } });
  if (!organisation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(organisation);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const nom = typeof body.nom === "string" ? body.nom.trim() : "";
  const type = body.type;

  if (!nom) return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  if (!typeValide(type)) return NextResponse.json({ error: "Type invalide" }, { status: 400 });

  const organisation = await prisma.organisation.update({
    where: { id: parseInt(id) },
    data: { nom, type },
  });
  return NextResponse.json(organisation);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const orgId = parseInt(id);

  const ventes = await prisma.vente.count({ where: { organisationId: orgId } });
  if (ventes > 0) {
    return NextResponse.json(
      { error: "Impossible de supprimer : des ventes y sont encore rattachées." },
      { status: 400 }
    );
  }

  await prisma.affiliation.deleteMany({ where: { organisationId: orgId } });
  await prisma.organisation.delete({ where: { id: orgId } });
  return NextResponse.json({ ok: true });
}
