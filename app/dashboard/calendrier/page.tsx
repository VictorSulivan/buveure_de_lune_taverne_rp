import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import CalendrierView from "@/components/calendrier/CalendrierView";

export default async function CalendrierPage() {
  const evenements = await prisma.evenement.findMany({
    orderBy: { dateDebut: "asc" },
    include: {
      responsable: true,
      employes: { include: { employe: true } },
      clients: { include: { client: true } },
      consommations: { include: { produit: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-white">Calendrier</h1>
          <p className="text-white/40 text-sm mt-1">{evenements.length} événements</p>
        </div>
        <Link
          href="/dashboard/calendrier/nouveau"
          className="flex items-center gap-2 bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouvel événement
        </Link>
      </div>
      <CalendrierView evenements={JSON.parse(JSON.stringify(evenements))} />
    </div>
  );
}
