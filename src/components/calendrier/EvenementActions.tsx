"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUTS = ["planifie", "en_cours", "termine", "annule"];

export default function EvenementActions({ id, statut }: { id: number; statut: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [commentaire, setCommentaire] = useState("");
  const [showComment, setShowComment] = useState(false);

  async function changerStatut(s: string) {
    setLoading(true);
    await fetch(`/api/evenements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: s }),
    });
    router.refresh();
    setLoading(false);
  }

  async function saveComment() {
    setLoading(true);
    await fetch(`/api/evenements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentaire }),
    });
    setShowComment(false);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {STATUTS.filter((s) => s !== statut).map((s) => (
          <button key={s} onClick={() => changerStatut(s)} disabled={loading}
            className="text-xs px-2 py-1 rounded border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors disabled:opacity-30">
            → {s.replace("_", " ")}
          </button>
        ))}
        <button onClick={() => setShowComment(!showComment)}
          className="text-xs px-2 py-1 rounded border border-white/10 text-white/40 hover:text-white transition-colors">
          💬 Commenter
        </button>
      </div>

      {showComment && (
        <div className="flex gap-2">
          <input value={commentaire} onChange={(e) => setCommentaire(e.target.value)}
            className="input-dark flex-1 text-xs" placeholder="Ajouter un commentaire..." />
          <button onClick={saveComment} disabled={loading}
            className="text-xs px-3 py-1.5 bg-[#6b3e22] border border-[#a06b3c] text-[#f3d7a5] rounded-lg">
            OK
          </button>
        </div>
      )}
    </div>
  );
}
