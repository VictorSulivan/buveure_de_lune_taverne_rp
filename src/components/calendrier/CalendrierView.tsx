"use client";

import { useState } from "react";
import Link from "next/link";
import { fmtDate } from "@/utils/formatDate";

type Evenement = {
  id: number;
  titre: string;
  type: string;
  statut: string;
  dateDebut: string;
  dateFin: string | null;
  responsable: { nom: string; prenom: string } | null;
  employes: { employe: { nom: string; prenom: string } }[];
  clients: { client: { nom: string; prenom: string | null } }[];
};

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const JOURS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

const typeColor: Record<string, string> = {
  reservation: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  soiree:      "bg-amber-700/25 text-amber-200 border-amber-600/35",
};

const statutColor: Record<string, string> = {
  planifie: "bg-white/10 text-white/60",
  en_cours: "bg-green-500/20 text-green-400",
  termine:  "bg-white/5 text-white/30",
  annule:   "bg-red-500/10 text-red-400",
};

export default function CalendrierView({ evenements }: { evenements: Evenement[] }) {
  const now = new Date();
  const [mois, setMois] = useState(now.getMonth());
  const [annee, setAnnee] = useState(now.getFullYear());
  const [selected, setSelected] = useState<Evenement | null>(null);

  const premier = new Date(annee, mois, 1);
  const dernier = new Date(annee, mois + 1, 0);
  const startDay = (premier.getDay() + 6) % 7; // lundi = 0
  const nbJours = dernier.getDate();

  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: nbJours }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function getEvenementsJour(jour: number) {
    return evenements.filter((e) => {
      const d = new Date(e.dateDebut);
      return d.getFullYear() === annee && d.getMonth() === mois && d.getDate() === jour;
    });
  }

  function prev() {
    if (mois === 0) { setMois(11); setAnnee(a => a - 1); }
    else setMois(m => m - 1);
  }

  function next() {
    if (mois === 11) { setMois(0); setAnnee(a => a + 1); }
    else setMois(m => m + 1);
  }

  return (
    <div className="flex gap-6">
      {/* Calendrier */}
      <div className="flex-1">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">‹</button>
          <h2 className="text-white font-medium">{MOIS[mois]} {annee}</h2>
          <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">›</button>
        </div>

        {/* Grille */}
        <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
          {/* Jours */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {JOURS.map((j) => (
              <div key={j} className="px-2 py-2 text-center text-xs text-white/30 font-medium">{j}</div>
            ))}
          </div>

          {/* Cellules */}
          <div className="grid grid-cols-7">
            {cells.map((jour, i) => {
              const evs = jour ? getEvenementsJour(jour) : [];
              const isToday = jour === now.getDate() && mois === now.getMonth() && annee === now.getFullYear();
              return (
                <div key={i} className={`min-h-[90px] p-1.5 border-b border-r border-white/5 ${!jour ? "bg-white/2" : "hover:bg-white/3"} transition-colors`}>
                  {jour && (
                    <>
                      <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? "bg-[#e4b56a] text-[#1c140e]" : "text-white/40"}`}>
                        {jour}
                      </div>
                      <div className="space-y-0.5">
                        {evs.slice(0, 2).map((e) => (
                          <button key={e.id} onClick={() => setSelected(e)}
                            className={`w-full text-left text-xs px-1.5 py-0.5 rounded border truncate ${typeColor[e.type] ?? "bg-white/10 text-white/60 border-white/10"}`}>
                            {e.titre}
                          </button>
                        ))}
                        {evs.length > 2 && (
                          <div className="text-xs text-white/30 px-1">+{evs.length - 2}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel détail */}
      <div className="w-72 shrink-0">
        {selected ? (
          <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 space-y-4 sticky top-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-xs px-2 py-1 rounded-full border ${typeColor[selected.type]}`}>
                  {selected.type}
                </span>
                <h3 className="text-white font-medium mt-2">{selected.titre}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/20 hover:text-white text-lg">✕</button>
            </div>

            <div className="space-y-1 text-xs text-white/50">
              <div>📅 {fmtDate(selected.dateDebut, { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              {selected.dateFin && <div>⏱ Fin : {fmtDate(selected.dateFin, { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}</div>}
            </div>

            <div>
              <span className={`text-xs px-2 py-1 rounded-full ${statutColor[selected.statut]}`}>
                {selected.statut.replace("_", " ")}
              </span>
            </div>

            {selected.responsable && (
              <div>
                <p className="text-xs text-white/30 mb-1">Responsable</p>
                <p className="text-sm text-white">{selected.responsable.prenom} {selected.responsable.nom}</p>
              </div>
            )}

            {selected.employes.length > 0 && (
              <div>
                <p className="text-xs text-white/30 mb-1">Équipe ({selected.employes.length})</p>
                <div className="flex flex-wrap gap-1">
                  {selected.employes.map((e, i) => (
                    <span key={i} className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded-full">
                      {e.employe.prenom} {e.employe.nom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selected.clients.length > 0 && (
              <div>
                <p className="text-xs text-white/30 mb-1">Clients ({selected.clients.length})</p>
                <div className="flex flex-wrap gap-1">
                  {selected.clients.map((c, i) => (
                    <span key={i} className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded-full">
                      {c.client.prenom} {c.client.nom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link href={`/dashboard/calendrier/${selected.id}`}
              className="block w-full text-center text-sm bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] py-2 rounded-lg transition-colors">
              Voir le détail →
            </Link>
          </div>
        ) : (
          <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5">
            <p className="text-white/30 text-sm text-center">Clique sur un événement pour voir les détails</p>
            <div className="mt-4 space-y-2">
              <p className="text-xs text-white/20 uppercase tracking-widest">Prochains événements</p>
              {evenements
                .filter(e => new Date(e.dateDebut) >= new Date() && e.statut !== "annule")
                .slice(0, 5)
                .map((e) => (
                  <button key={e.id} onClick={() => setSelected(e)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                    <p className="text-white text-xs font-medium truncate">{e.titre}</p>
                    <p className="text-white/30 text-xs">
                      {fmtDate(e.dateDebut, { day: "2-digit", month: "short" })}
                    </p>
                  </button>
                ))}
              {evenements.filter(e => new Date(e.dateDebut) >= new Date()).length === 0 && (
                <p className="text-white/20 text-xs text-center py-4">Aucun événement à venir</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
