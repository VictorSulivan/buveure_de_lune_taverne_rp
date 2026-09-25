import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { findOrCreateOrganisation } from "@/lib/organisations";
import type { TypeOrganisation } from "@prisma/client";

function typeValide(type: unknown): type is TypeOrganisation {
  return type === "entreprise" || type === "nation";
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const typeFiltre = typeValide(type) ? type : undefined;

  const organisations = await prisma.organisation.findMany({
    where: typeFiltre ? { type: typeFiltre } : {},
    orderBy: [{ type: "asc" }, { nom: "asc" }],
  });

  return NextResponse.json(organisations);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const nom = typeof body.nom === "string" ? body.nom.trim() : "";
  const type = body.type;

  if (!nom) return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  if (!typeValide(type)) return NextResponse.json({ error: "Type invalide" }, { status: 400 });

  const organisation = await findOrCreateOrganisation(nom, type);
  return NextResponse.json(organisation, { status: 201 });
}
