import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import ContratPDF from "@/components/contrats/ContratPDF";
import Link from "next/link";
import { NOM_ENTREPRISE } from "@/lib/branding";

export default async function ContratPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; contratId: string }>;
  searchParams: Promise<{ download?: string }>;
}) {
  const { id, contratId } = await params;
  const { download } = await searchParams;

  const [employe, contrat, entreprise] = await Promise.all([
    prisma.employe.findUnique({ where: { id: parseInt(id) } }),
    prisma.contrat.findUnique({ where: { id: parseInt(contratId) } }),
    prisma.entreprise.findFirst(),
  ]);

  if (!employe || !contrat) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/dashboard/employes/${id}/contrats`}
          className="text-white/30 hover:text-white text-sm transition-colors"
        >
          ← Contrats
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-2xl font-medium text-white">
          Contrat {contrat.typeContrat}
        </h1>
      </div>

      <ContratPDF
        autoDownload={download === "1"}
        employe={{
          nom: employe.nom,
          prenom: employe.prenom,
          role: employe.role,
          salaire: employe.salaire,
          dateEmbauche: employe.dateEmbauche?.toISOString() ?? null,
        }}
        contrat={{
          typeContrat: contrat.typeContrat,
          dateDebut: contrat.dateDebut.toISOString(),
          dateFin: contrat.dateFin?.toISOString() ?? null,
          salaire: contrat.salaire,
          pourcentagePrime: contrat.pourcentagePrime,
          commentaire: contrat.commentaire,
          articles: contrat.articles,
          signatairePatronPrenom: contrat.signatairePatronPrenom,
          signatairePatronNom: contrat.signatairePatronNom,
          signataireRole: contrat.signataireRole,
        }}
        entreprise={entreprise?.nom ?? NOM_ENTREPRISE}
      />
    </div>
  );
}
