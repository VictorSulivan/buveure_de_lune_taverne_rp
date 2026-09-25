import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EvenementActions from "@/components/calendrier/EvenementActions";
import { fmtDate } from "@/utils/formatDate";
import { fmtArgent } from "@/utils/fmtArgent";

export default async function EvenementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const e = await prisma.evenement.findUnique({
    where: { id: parseInt(id) },
    include: {
      responsable: true,
      employes: { include: { employe: true } },
      clients: { include: { client: true } },
      consommations: { include: { produit: true } },
    },
  });

  if (!e) notFound();

  const totalConso = e.consommations.reduce((acc, c) => acc + c.quantite * c.prixUnitaire, 0);
  const totalPersonnes = e.clients.reduce((acc, c) => acc + c.nbPersonnes, 0);

  const typeColor: Record<string, string> = {
    reservation: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    soiree:      "bg-amber-700/20 text-amber-300 border-amber-600/30",
  };

  const statutColor: Record<string, string> = {
    planifie: "bg-white/10 text-white/60 border-white/10",
    en_cours: "bg-green-500/10 text-green-400 border-green-500/20",
    termine:  "bg-white/5 text-white/30 border-white/5",
    annule:   "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/calendrier" className="text-white/30 hover:text-white text-sm transition-colors">
          ← Calendrier
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-2xl font-medium text-white truncate">{e.titre}</h1>
      </div>

      {/* Header */}
      <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full border ${typeColor[e.type]}`}>{e.type}</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${statutColor[e.statut]}`}>{e.statut.replace("_", " ")}</span>
            </div>
            <div className="text-white/50 text-sm">
              📅 {fmtDate(e.dateDebut, { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              {e.dateFin && <> → {fmtDate(e.dateFin, { hour: "2-digit", minute: "2-digit" })}</>}
            </div>
          </div>
          <EvenementActions id={e.id} statut={e.statut} />
        </div>

        {e.description && <p className="text-white/50 text-sm border-t border-white/10 pt-4">{e.description}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Clients", value: e.clients.length.toString() },
          { label: "Personnes", value: totalPersonnes.toString() },
          { label: "Conso estimée", value: fmtArgent(totalConso) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#2b1d14] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-xl font-medium text-white">{value}</p>
            <p className="text-white/40 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Responsable + équipe */}
      {(e.responsable || e.employes.length > 0) && (
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-widest">Équipe</p>
          {e.responsable && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6b3e22] border border-[#a06b3c] flex items-center justify-center text-[#e4b56a] text-xs uppercase">
                {e.responsable.prenom[0]}{e.responsable.nom[0]}
              </div>
              <div>
                <p className="text-white text-sm">{e.responsable.prenom} {e.responsable.nom}</p>
                <p className="text-white/30 text-xs">Responsable</p>
              </div>
            </div>
          )}
          {e.employes.map((emp) => (
            <div key={emp.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-xs uppercase">
                {emp.employe.prenom[0]}{emp.employe.nom[0]}
              </div>
              <p className="text-white/60 text-sm">{emp.employe.prenom} {emp.employe.nom}</p>
            </div>
          ))}
        </div>
      )}

      {/* Clients */}
      {e.clients.length > 0 && (
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-widest">Clients ({e.clients.length})</p>
          {e.clients.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <p className="text-white text-sm">{c.client.prenom} {c.client.nom}</p>
              <div className="text-right">
                <p className="text-white/50 text-xs">{c.nbPersonnes} pers.</p>
                {c.commentaire && <p className="text-white/30 text-xs">{c.commentaire}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consommations */}
      {e.consommations.length > 0 && (
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-widest">Consommations</p>
          {e.consommations.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <span className="text-white/60">{c.produit.nom} ×{c.quantite}</span>
              <span className="text-white">{fmtArgent(c.quantite * c.prixUnitaire)}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-medium">
            <span className="text-white/40">Total</span>
            <span className="text-white">{fmtArgent(totalConso)}</span>
          </div>
        </div>
      )}

      {/* Commentaire */}
      {e.commentaire && (
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Commentaire</p>
          <p className="text-white/60 text-sm">{e.commentaire}</p>
        </div>
      )}
    </div>
  );
}
