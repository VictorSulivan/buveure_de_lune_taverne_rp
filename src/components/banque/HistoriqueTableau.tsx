"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fmtDate } from "@/utils/formatDate";
import { NOM_BANQUE } from "@/lib/branding";
import { fmtArgent } from "@/utils/fmtArgent";

const POSITIF = ["vente", "versement"];

const typeBadge: Record<string, string> = {
  vente:     "bg-green-500/10 text-green-400 border-green-500/20",
  versement: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  retrait:   "bg-red-500/10 text-red-400 border-red-500/20",
  salaire:   "bg-red-500/10 text-red-400 border-red-500/20",
  prime:     "bg-orange-500/10 text-orange-400 border-orange-500/20",
  taxe:      "bg-orange-500/10 text-orange-400 border-orange-500/20",
  achat:     "bg-red-500/10 text-red-400 border-red-500/20",
};

interface Employe {
  id: number;
  prenom: string;
  nom: string;
}

interface Transaction {
  id: number;
  typeTransaction: string | null;
  description: string | null;
  montant: number | null;
  employeId: number | null;
  createdAt: Date | string;
  employe: Employe | null;
}

interface Props {
  transactions: Transaction[];
  employes: Employe[];
}

export default function HistoriqueTableau({ transactions, employes }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleSaved() {
    setEditing(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/banque/transaction/${confirmDelete.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      setConfirmDelete(null);
      router.refresh();
    }
  }

  return (
    <>
      <div className="bg-[#2b1d14] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Description</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Employé</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Montant</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Date</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const isPositif = POSITIF.includes(t.typeTransaction ?? "");
              const montant = t.montant ?? 0;
              return (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${typeBadge[t.typeTransaction ?? ""] ?? "bg-white/5 text-white/40 border-white/10"}`}>
                      {t.typeTransaction ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/60">{t.description ?? "—"}</td>
                  <td className="px-5 py-4 text-white/60">
                    {t.employe ? `${t.employe.prenom} ${t.employe.nom}` : "—"}
                  </td>
                  <td className={`px-5 py-4 text-right font-medium ${isPositif ? "text-green-400" : "text-red-400"}`}>
                    {fmtArgent(isPositif ? montant : -montant, { signe: true })}
                  </td>
                  <td className="px-5 py-4 text-right text-white/40 text-xs">
                    {fmtDate(t.createdAt, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditing(t)}
                        className="text-xs text-white/30 hover:text-[#e4b56a] transition-colors px-2 py-1 rounded hover:bg-[#6b3e22]"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => setConfirmDelete(t)}
                        className="text-xs text-white/30 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="text-center py-16 text-white/30">Aucune transaction ne correspond à vos filtres.</div>
        )}
      </div>

      {editing && (
        <EditModal
          transaction={editing}
          employes={employes}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#2b1d14] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h2 className="text-white font-medium mb-2">Supprimer cette transaction ?</h2>
            <p className="text-white/40 text-sm mb-1">
              {confirmDelete.typeTransaction} — {confirmDelete.description ?? "sans description"}
            </p>
            <p className="text-white/30 text-xs mb-5">
              Le solde {NOM_BANQUE.toLowerCase()} sera ajusté en conséquence.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EditModal({
  transaction,
  employes,
  onClose,
  onSaved,
}: {
  transaction: Transaction;
  employes: Employe[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [typeTransaction, setTypeTransaction] = useState(transaction.typeTransaction ?? "");
  const [montant, setMontant] = useState(String(transaction.montant ?? ""));
  const [description, setDescription] = useState(transaction.description ?? "");
  const [employeId, setEmployeId] = useState(String(transaction.employeId ?? ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const montantNum = parseFloat(montant);
    if (!montantNum || !typeTransaction) return setError("Montant et type requis");

    setLoading(true);
    setError("");

    const res = await fetch(`/api/banque/transaction/${transaction.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        montant: montantNum,
        description: description || null,
        typeTransaction,
        employeId: employeId || null,
      }),
    });

    if (res.ok) {
      onSaved();
    } else {
      const d = await res.json();
      setError(d.error ?? "Erreur lors de la sauvegarde");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#2b1d14] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-medium">Modifier la transaction</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Type</label>
            <select
              value={typeTransaction}
              onChange={(e) => setTypeTransaction(e.target.value)}
              className="w-full bg-[#1c140e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e4b56a]"
            >
              {Object.keys(typeBadge).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Montant</label>
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full bg-[#1c140e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e4b56a]"
              min="0"
              step="1"
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1c140e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e4b56a]"
              placeholder="Description optionnelle"
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Employé</label>
            <select
              value={employeId}
              onChange={(e) => setEmployeId(e.target.value)}
              className="w-full bg-[#1c140e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e4b56a]"
            >
              <option value="">— Aucun employé —</option>
              {employes.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 text-sm bg-[#6b3e22] hover:bg-[#a06b3c] border border-[#a06b3c] text-[#e4b56a] rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
