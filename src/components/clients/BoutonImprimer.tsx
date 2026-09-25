"use client";

export function BoutonImprimer() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-xs text-white/40 hover:text-white border border-white/10 rounded-lg px-3 py-2 transition-colors print:hidden"
    >
      Imprimer
    </button>
  );
}
