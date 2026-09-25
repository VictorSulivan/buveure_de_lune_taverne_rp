"use client";

import type { ArticleContrat } from "@/lib/contrats";

export function ArticlesContratEditor({
  articles,
  onChange,
}: {
  articles: ArticleContrat[];
  onChange: (articles: ArticleContrat[]) => void;
}) {
  function update(index: number, key: keyof ArticleContrat, value: string) {
    onChange(articles.map((a, i) => (i === index ? { ...a, [key]: value } : a)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs text-white/40">Articles du pacte</label>
        <button
          type="button"
          onClick={() => onChange([...articles, { titre: "", contenu: "" }])}
          className="text-xs text-[#e4b56a] hover:text-[#f0c888] border border-[#e4b56a]/20 rounded-lg px-2.5 py-1"
        >
          + Article
        </button>
      </div>

      {articles.map((a, i) => (
        <div key={i} className="bg-[#1c140e]/60 border border-white/10 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30 w-16 shrink-0">Art. {i + 1}</span>
            <input
              value={a.titre}
              onChange={(e) => update(i, "titre", e.target.value)}
              className="input-dark"
              placeholder="Titre de l'article"
            />
            <button
              type="button"
              onClick={() => onChange(articles.filter((_, j) => j !== i))}
              className="text-white/25 hover:text-red-400 text-xs px-2"
            >
              ✕
            </button>
          </div>
          <textarea
            value={a.contenu}
            onChange={(e) => update(i, "contenu", e.target.value)}
            rows={3}
            className="input-dark resize-none"
            placeholder="Texte de l'article..."
          />
        </div>
      ))}

      {articles.length === 0 && (
        <p className="text-xs text-white/30">Aucun article. Ajoute-en autant que nécessaire.</p>
      )}
    </div>
  );
}
