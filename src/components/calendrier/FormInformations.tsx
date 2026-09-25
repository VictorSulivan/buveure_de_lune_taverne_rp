"use client";

// --- 2. COMPOSANT : INFORMATIONS DE BASE ---
interface EvenementForm {
  type: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  description: string;
}

export default function FormInformations({ form, onChange }: { form: EvenementForm; onChange: (key: string, val: string) => void }) {
  return (
    <div className="bg-[#2b1d14] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-xs text-white/40 uppercase tracking-widest">Informations</p>
      <div>
        <label className="block text-xs text-white/40 mb-1.5">Type</label>
        <div className="grid grid-cols-2 gap-2">
          {[{ v: "reservation", l: "📋  Réservation" }, { v: "soiree", l: "🎉  Soirée" }].map(({ v, l }) => (
            <button key={v} type="button" onClick={() => onChange("type", v)}
              className={`py-2.5 rounded-lg text-sm border transition-colors ${form.type === v ? "bg-[#6b3e22] border-[#a06b3c] text-[#f3d7a5]" : "bg-[#1c140e] border-white/10 text-white/40 hover:text-white"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs text-white/40 mb-1.5">Titre</label>
        <input value={form.titre} onChange={(e) => onChange("titre", e.target.value)} className="input-dark" placeholder="Soirée d'anniversaire..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Date de début</label>
          <input type="datetime-local" value={form.dateDebut} onChange={(e) => onChange("dateDebut", e.target.value)} className="input-dark" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Date de fin</label>
          <input type="datetime-local" value={form.dateFin} onChange={(e) => onChange("dateFin", e.target.value)} className="input-dark" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-white/40 mb-1.5">Description</label>
        <textarea rows={2} value={form.description} onChange={(e) => onChange("description", e.target.value)} className="input-dark resize-none" placeholder="Détails de l'événement..." />
      </div>
    </div>
  );
}